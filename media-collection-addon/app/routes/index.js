'use strict';

/**
 * routes/index.js
 * Main collection overview page.
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

// Supported media types used in the filter UI
const MEDIA_TYPES = ['vinyl'];

router.get('/', (req, res, next) => {
  try {
    const { status } = req.query;

    // Alle Items laden – Filterung + Sortierung passiert clientseitig
    const items = db.getAllItems({ media_type: 'all' });

    res.render('index', {
      items,
      mediaTypes: MEDIA_TYPES,
      selectedType: 'all',
      selectedStatus: status || 'all',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
