const express = require('express');
const path = require('path');
const morgan = require('morgan');

const addonConfig = require(path.join(__dirname, 'package.json'));

const db = require('./database');
const indexRouter = require('./routes/index');
const itemsRouter = require('./routes/items');
const apiRouter   = require('./routes/api');
const csvRouter   = require('./routes/csv');

const app = express();
const PORT = process.env.PORT || 8099;
const buildStamp = process.env.ASSET_VERSION || Date.now().toString();

// ── Template engine ──────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cache-busting for static assets: new stamp on every restart unless overridden.
app.locals.assetVersion = `${addonConfig.version || 'dev'}-${buildStamp}`;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home Assistant ingress sends the base path in the X-Ingress-Path header.
// Inject it into res.locals so every template and redirect can use it.
app.use((req, res, next) => {
  res.locals.base = (req.headers['x-ingress-path'] || '').replace(/\/$/, '');
  app.locals.base  = res.locals.base; // also keep app.locals in sync for routes
  next();
});

// Static files
app.use('/public', express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', indexRouter);
app.use('/items', itemsRouter);
app.use('/api', apiRouter);
app.use('/csv', csvRouter);

// Fallback 404
app.use((req, res) => {
  res.status(404).render('error', { message: '404 – Seite nicht gefunden', base: res.locals.base });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).render('error', { message: err.message || 'Interner Serverfehler', base: res.locals.base });
});

// ── Startup ───────────────────────────────────────────────────────────────────
db.init();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VinylVault läuft auf http://0.0.0.0:${PORT}`);
});
