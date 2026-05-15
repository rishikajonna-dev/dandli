import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    const requested = normalize(url.pathname === '/' ? '/index.html' : url.pathname);
    const path = requested.startsWith('\\') || requested.startsWith('/') ? requested.slice(1) : requested;
    const file = join(root, path);
    const body = await readFile(file).catch(() => readFile(join(root, 'index.html')));
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'text/html; charset=utf-8' });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.message : 'Server error');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Clasp preview: http://127.0.0.1:${port}`);
});
