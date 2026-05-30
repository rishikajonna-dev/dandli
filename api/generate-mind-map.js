import { createClient } from '@supabase/supabase-js';
import { SYSTEM_PROMPT, buildUserPrompt } from '../src/features/ai/prompt.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const MAX_NOTES_LENGTH = 20000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const generationWindows = new Map();

function sendJson(response, status, payload) {
  response.status(status);
  response.setHeader('Cache-Control', 'no-store');
  response.json(payload);
}

function extractJson(text) {
  const cleaned = String(text)
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  if (typeof request.body === 'string') {
    return request.body ? JSON.parse(request.body) : {};
  }

  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > MAX_NOTES_LENGTH + 2048) {
      throw new Error('Request body is too large.');
    }
  }
  return raw ? JSON.parse(raw) : {};
}

async function authenticate(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase server environment is not configured.');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

function checkRateLimit(userId) {
  const now = Date.now();
  const current = generationWindows.get(userId);
  if (!current || now - current.startedAt > WINDOW_MS) {
    generationWindows.set(userId, { startedAt: now, count: 1 });
    return true;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'Method not allowed.' });
      return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      sendJson(response, 500, { error: 'AI generation is not configured.' });
      return;
    }

    const user = await authenticate(request);
    if (!user) {
      sendJson(response, 401, { error: 'Sign in is required to generate maps.' });
      return;
    }

    if (!checkRateLimit(user.id)) {
      sendJson(response, 429, { error: 'Generation limit reached. Try again later.' });
      return;
    }

    const { notes } = await readJsonBody(request);
    if (typeof notes !== 'string' || !notes.trim()) {
      sendJson(response, 400, { error: 'Please enter some notes.' });
      return;
    }
    if (notes.length > MAX_NOTES_LENGTH) {
      sendJson(response, 413, { error: 'Notes are too long. Please shorten them and try again.' });
      return;
    }

    const aiResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(notes) },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      sendJson(response, 502, { error: 'AI generation failed. Please try again.' });
      return;
    }

    const data = await aiResponse.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      sendJson(response, 502, { error: 'AI generation returned an empty response.' });
      return;
    }

    sendJson(response, 200, { map: extractJson(content) });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
}
