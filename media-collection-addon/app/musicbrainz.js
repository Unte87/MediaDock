'use strict';

/**
 * musicbrainz.js
 *
 * MusicBrainz-API und Cover Art Archive Hilfsfunktionen.
 *
 * Endpunkte:
 *   Release-Suche:  https://musicbrainz.org/ws/2/release/?query=…&fmt=json
 *   Künstler-Suche: https://musicbrainz.org/ws/2/artist/?query=…&fmt=json
 *   Release-Groups: https://musicbrainz.org/ws/2/release-group/?artist=<mbid>&fmt=json
 *   Cover:          https://coverartarchive.org/release/<mbid>/front-250
 *   Cover (RG):     https://coverartarchive.org/release-group/<mbid>/front-250
 *
 * Rate-Limit: max. 1 Anfrage/Sekunde. User-Agent ist Pflicht.
 */

const axios = require('axios');

const USER_AGENT = 'MediaDock/1.0.1 (home-assistant-addon)';

const http = axios.create({
  timeout: 10_000,
  headers: { 'User-Agent': USER_AGENT },
});

// ── Release-Suche ─────────────────────────────────────────────────────────────

/**
 * Gibt das erste MusicBrainz-Suchergebnis zurück.
 * Wenn `artist` angegeben ist, verwendet die Suche Lucene-Feldsyntax:
 *   release:"Greatest Hits" AND artist:"Foo Fighters"
 * Das liefert erheblich präzisere Treffer als eine Freitextsuche.
 */
async function searchMusicBrainz(title, artist = '') {
  const results = await searchMusicBrainzMultiple(title, 1, artist);
  return results.length > 0 ? results[0] : null;
}

/**
 * Sucht nach Releases und gibt bis zu `limit` Ergebnisse zurück.
 *
 * Strategie (von präzise → tolerant, stoppt sobald Treffer da sind):
 *   1. Phrase AND:  release:"<title>" AND artist:"<artist>"
 *   2. Phrase OR:   release:"<title>" OR  artist:"<artist>"
 *   3. Term AND:    release:(<title>) AND artist:(<artist>)
 *   4. Term OR:     release:(<title>) OR  artist:(<artist>)
 *   5. Fuzzy AND/OR als letzter Ausweg
 *
 * Die MusicBrainz-Suche ist von Haus aus case-insensitiv.
 */
async function searchMusicBrainzMultiple(title, limit = 5, artist = '') {
  // Sonderzeichen escapen (für alle Stufen)
  const escQuote = (s) => s.replace(/["\\]/g, '\\$&').trim();
  const escTerm  = (s) => s.replace(/["\\+\-!(){}\[\]^~*?:|&]/g, ' ').trim();

  const tQ = escQuote(title);
  const aQ = escQuote(artist);
  const tT = escTerm(title);
  const aT = escTerm(artist);

  const queries = [];

  // Stufe 1: Exaktes Phrase-Match beider Felder (AND)
  if (artist) {
    queries.push(`release:"${tQ}" AND artist:"${aQ}"`);
  }
  queries.push(`release:"${tQ}"`);

  // Stufe 2: Exaktes Phrase-Match, OR-verknüpft (Titel ODER Künstler)
  if (artist) {
    queries.push(`release:"${tQ}" OR artist:"${aQ}"`);
  }

  // Stufe 3: Term-Match AND (alle Wörter müssen vorkommen, Reihenfolge egal)
  if (artist) {
    queries.push(`release:(${tT}) AND artist:(${aT})`);
  }
  queries.push(`release:(${tT})`);

  // Stufe 4: Term-Match OR
  if (artist) {
    queries.push(`release:(${tT}) OR artist:(${aT})`);
  }

  // Stufe 5: Fuzzy (Tipp-Toleranz, nur als letzter Ausweg)
  const fuzzyTitle  = tT.split(/\s+/).filter(Boolean).map(t => `${t}~`).join(' ');
  const fuzzyArtist = aT.split(/\s+/).filter(Boolean).map(t => `${t}~`).join(' ');
  if (artist) {
    queries.push(`release:(${fuzzyTitle}) AND artist:(${fuzzyArtist})`);
    queries.push(`release:(${fuzzyTitle}) OR artist:(${fuzzyArtist})`);
  }
  queries.push(`release:(${fuzzyTitle})`);

  for (const query of queries) {
    const { data } = await http.get('https://musicbrainz.org/ws/2/release/', {
      params: { query, fmt: 'json', limit },
    });
    const results = (data.releases || []).map(mapRelease);
    if (results.length > 0) return results;
    // Rate-Limit einhalten: max. 1 Anfrage/Sekunde
    await new Promise(r => setTimeout(r, 1100));
  }
  return [];
}

function mapRelease(release) {
  const artist = (release['artist-credit'] || [])
    .map((ac) => (typeof ac === 'string' ? ac : ac.artist?.name || ac.name || ''))
    .join('').trim();
  const mbid = release.id || '';
  return {
    title: release.title || '',
    artist,
    year: (release.date || '').slice(0, 4),
    mbid,
    score: release.score ?? null,
    cover_url: mbid ? `https://coverartarchive.org/release/${mbid}/front-250` : '',
  };
}

// ── Künstler-Suche ────────────────────────────────────────────────────────────

/**
 * Sucht Künstler bei MusicBrainz.
 * @returns {Promise<Array<{name, mbid, country, disambiguation}>>}
 */
async function searchArtists(query, limit = 8) {
  const { data } = await http.get('https://musicbrainz.org/ws/2/artist/', {
    params: { query, fmt: 'json', limit },
  });

  return (data.artists || []).map((a) => ({
    name: a.name || '',
    mbid: a.id || '',
    country: a.country || '',
    disambiguation: a.disambiguation || '',
  }));
}

// ── Diskografie eines Künstlers ───────────────────────────────────────────────

/**
 * Gibt die Release-Groups eines Künstlers zurück.
 * Release-Groups vermeiden Duplikate durch mehrere Editionen.
 * @returns {Promise<Array<{title, artist, year, mbid, type, cover_url}>>}
 */
async function getReleaseGroupsByArtist(artistMbid, limit = 50) {
  const { data } = await http.get('https://musicbrainz.org/ws/2/release-group/', {
    params: { artist: artistMbid, fmt: 'json', limit, inc: 'artist-credits' },
  });

  const groups = (data['release-groups'] || []).map((rg) => {
    const artist = (rg['artist-credit'] || [])
      .map((ac) => (typeof ac === 'string' ? ac : ac.artist?.name || ''))
      .join('').trim();
    return {
      title: rg.title || '',
      artist,
      year: (rg['first-release-date'] || '').slice(0, 4),
      mbid: rg.id || '',
      type: rg['primary-type'] || 'Album',
      cover_url: `https://coverartarchive.org/release-group/${rg.id}/front-250`,
    };
  });

  const order = ['Album', 'EP', 'Single', 'Other'];
  return groups.sort((a, b) => {
    const ta = order.indexOf(a.type);
    const tb = order.indexOf(b.type);
    if (ta !== tb) return (ta === -1 ? 99 : ta) - (tb === -1 ? 99 : tb);
    return (b.year || '0').localeCompare(a.year || '0');
  });
}

// ── Cover Art Archive ─────────────────────────────────────────────────────────

/** Cover-URL für eine Release-MBID (der Browser folgt dem Redirect selbst). */
function fetchCoverUrl(mbid) {
  if (!mbid) return '';
  return `https://coverartarchive.org/release/${mbid}/front-250`;
}

/** Cover-URL für eine Release-Group-MBID. */
function fetchReleaseGroupCoverUrl(rgMbid) {
  if (!rgMbid) return '';
  return `https://coverartarchive.org/release-group/${rgMbid}/front-250`;
}

module.exports = {
  searchMusicBrainz,
  searchMusicBrainzMultiple,
  searchArtists,
  getReleaseGroupsByArtist,
  fetchCoverUrl,
  fetchReleaseGroupCoverUrl,
};
