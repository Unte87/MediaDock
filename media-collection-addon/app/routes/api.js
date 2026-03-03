'use strict';

/**
 * routes/api.js
 * JSON-API für das Frontend.
 *
 * GET /api/search?q=<title>&artist=<artist>  – bis zu 20 Release-Treffer (MusicBrainz)
 * GET /api/artists?q=<name>                  – Künstler-Suche
 * GET /api/artists/:mbid/releases            – Diskografie eines Künstlers
 * GET /api/items/known                       – alle bekannten MBIDs + Titel aus der Sammlung
 */

const express = require('express');
const router  = express.Router();
const db      = require('../database');
const {
  searchMusicBrainzMultiple,
  searchArtists,
  getReleaseGroupsByArtist,
} = require('../musicbrainz');

// ── Release-Suche ────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  const title  = (req.query.q      || '').trim();
  const artist = (req.query.artist || '').trim();
  if (!title) return res.status(400).json({ error: 'Parameter q fehlt.' });
  try {
    const results = await searchMusicBrainzMultiple(title, 20, artist);
    res.json(results);
  } catch (err) {
    console.error('Release-Suche fehlgeschlagen:', err.message);
    res.status(502).json({ error: 'MusicBrainz nicht erreichbar.' });
  }
});

// ── Künstler-Suche ────────────────────────────────────────────────────────────
router.get('/artists', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Parameter q fehlt.' });
  try {
    const artists = await searchArtists(q, 8);
    res.json(artists);
  } catch (err) {
    console.error('Künstler-Suche fehlgeschlagen:', err.message);
    res.status(502).json({ error: 'MusicBrainz nicht erreichbar.' });
  }
});

// ── Diskografie eines Künstlers ───────────────────────────────────────────────
router.get('/artists/:mbid/releases', async (req, res) => {
  const { mbid } = req.params;
  try {
    const releases = await getReleaseGroupsByArtist(mbid, 50);
    res.json(releases);
  } catch (err) {
    console.error('Diskografie-Abfrage fehlgeschlagen:', err.message);
    res.status(502).json({ error: 'MusicBrainz nicht erreichbar.' });
  }
});

// ── Bekannte Einträge (für Duplikat-Filter) ───────────────────────────────────
router.get('/items/known', (req, res) => {
  try {
    res.json(db.getKnownIdentifiers());
  } catch (err) {
    console.error('Known-Identifiers fehlgeschlagen:', err.message);
    res.status(500).json({ error: 'Datenbankfehler.' });
  }
});

module.exports = router;
