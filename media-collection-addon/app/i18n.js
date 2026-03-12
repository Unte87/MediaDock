const path = require('path');
const fs   = require('fs');

const LOCALES_DIR   = path.join(__dirname, 'locales');
const DEFAULT_LOCALE = 'de';
const SUPPORTED      = ['de', 'en'];

const translations = {};
for (const lang of SUPPORTED) {
  translations[lang] = JSON.parse(
    fs.readFileSync(path.join(LOCALES_DIR, `${lang}.json`), 'utf8')
  );
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx < 1) return;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    try { cookies[key] = decodeURIComponent(val); } catch { cookies[key] = val; }
  });
  return cookies;
}

function detectLocale(req) {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.lang && SUPPORTED.includes(cookies.lang)) return cookies.lang;
  const accept = req.headers['accept-language'] || '';
  for (const part of accept.split(',')) {
    const tag = part.split(';')[0].trim().substring(0, 2).toLowerCase();
    if (SUPPORTED.includes(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

function middleware(req, res, next) {
  const lang = detectLocale(req);
  const dict = translations[lang] || translations[DEFAULT_LOCALE];
  res.locals.lang         = lang;
  res.locals.__           = (key) => dict[key] || key;
  res.locals.translations = dict;
  next();
}

module.exports = { middleware };
