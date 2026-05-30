const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
const DISTINCT_ID_KEY = 'dandli:analytics:distinct-id';
const LANDING_VIEWED_KEY = 'dandli:analytics:landing-viewed';
const SIGNUP_COMPLETED_PREFIX = 'dandli:analytics:signup-completed:';

let identifiedUserId = null;

function canTrack() {
  return Boolean(MIXPANEL_TOKEN) && typeof window !== 'undefined';
}

function getAnonymousId() {
  let id = window.localStorage.getItem(DISTINCT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DISTINCT_ID_KEY, id);
  }
  return id;
}

function distinctId() {
  return identifiedUserId || getAnonymousId();
}

function encodePayload(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function identifyUser(user) {
  if (!user?.id || !canTrack()) return;
  identifiedUserId = user.id;
}

export function trackEvent(eventName, properties = {}) {
  if (!canTrack()) return;

  const payload = {
    event: eventName,
    properties: {
      token: MIXPANEL_TOKEN,
      distinct_id: distinctId(),
      time: Math.floor(Date.now() / 1000),
      ...properties,
    },
  };

  const url = `https://api-js.mixpanel.com/track/?ip=1&data=${encodeURIComponent(encodePayload(payload))}`;
  const pixel = new Image();
  pixel.src = url;
}

export function trackLandingViewed() {
  if (!canTrack() || window.sessionStorage.getItem(LANDING_VIEWED_KEY)) return;
  window.sessionStorage.setItem(LANDING_VIEWED_KEY, 'true');
  trackEvent('Landing Viewed');
}

export function trackSignUpCompleted(user) {
  if (!user?.id || !canTrack()) return;

  identifyUser(user);
  const key = `${SIGNUP_COMPLETED_PREFIX}${user.id}`;
  if (window.localStorage.getItem(key)) return;
  window.localStorage.setItem(key, 'true');
  trackEvent('Sign Up Completed', {
    email: user.email,
  });
}
