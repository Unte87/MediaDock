# VinylVault

> Self-hosted Vinyl-Sammlungsverwaltung – Home Assistant Add-on

Verwalte deine Schallplattensammlung direkt aus Home Assistant heraus.
Metadaten und Cover werden automatisch von **MusicBrainz** und dem
**Cover Art Archive** geladen.

---

## Features

### Sammlung verwalten
- **Hinzufügen, Bearbeiten, Löschen** einzelner Einträge
- **Bulk-Delete** – mehrere Einträge auf einmal markieren und löschen
- **Wunschliste** – Platten vormerken, die noch fehlen
- **Bewertung** – 1–5-Sterne-Rating pro Eintrag
- **Notizen** – Freitextfeld für persönliche Anmerkungen
- **CSV-Import & -Export** – Sammlung als CSV sichern oder importieren

### Metadaten & Cover
- **MusicBrainz-Suche** – 6-stufige kaskadierte Suche (Phrase → Term → Fuzzy)
- **Cover Art Archive** – automatische Cover-Bilder per Release-MBID oder Release-Group
- **Cover-Vorschläge** – Karussell mit alternativen Covern auf der Detailseite
- **Massenanalyse** – fehlende Cover für alle Einträge auf einmal suchen und übernehmen
- **Discogs-Integration** (optional) – zusätzliche Metadatenquelle per Personal Access Token

### Ansichten & Navigation
- **3 Ansichtsmodi** – Grid, Liste und Karussell
- **Client-seitige Suche** – Echtzeit-Filter über Titel, Künstler und Genre
- **Filter** nach Status (Alles / Besitze ich / Wunschliste)
- **Sortierung** nach Titel, Künstler, Jahr, Bewertung oder Datum
- **Gruppierung** nach Künstler, Titel, Jahr oder Bewertung
- **Shop-Links** – Direkt-Links zu Green Hell und Amazon für Wunschlisten-Einträge

### Hinzufügen-Workflow
- **Release-Suche** – Titel + Künstler eingeben → MusicBrainz-Treffer auswählen
- **Künstler-Suche** – Künstler suchen → komplette Diskografie durchblättern
- **Wunschliste per Diskografie** – ganze Alben eines Künstlers auf einmal vormerken
- **Manuell** – Eintrag komplett von Hand anlegen

### Themes & Oberfläche
- **15 Farbthemen** – Amber, Dark, Forest, Gold, Jazz, Matrix, Midnight, Ocean, Punk, Retro, Ruby, Slate, Sunset, Synthwave, Vinyl
- **Responsive Design** – optimiert für Desktop und Mobile
- **Home Assistant Ingress** – nahtlos in die HA-Sidebar integriert

### Technik
- **SQLite** (WAL-Mode) – persistente Datenbank im HA-Datenverzeichnis
- **Rate-Limiting** – schonender Umgang mit MusicBrainz-API (1 Request/1,1 s)
- **Automatisches Cache-Busting** – versionierte Asset-URLs, kein veralteter CSS/JS-Cache
- Läuft nach dem Laden der Metadaten komplett offline

---

## Installation

### 1. Repository in Home Assistant hinzufügen

1. **Home Assistant** öffnen → Einstellungen → Add-ons → Add-on Store
2. Auf das **⋮**-Menü oben rechts klicken
3. **Repositories** wählen
4. URL dieses Repositories einfügen:
   ```
   https://github.com/Unte87/VinylVault
   ```
5. **Hinzufügen → Schließen**

### 2. Add-on installieren

1. In der Add-on-Liste nach **VinylVault** scrollen
2. Anklicken → **Installieren**
3. Warten, bis das Image gebaut ist

### 3. Add-on starten

1. Zur **VinylVault**-Add-on-Seite gehen
2. **Starten** klicken
3. **In Seitenleiste anzeigen** aktivieren
4. Alternativ erreichbar unter:
   ```
   http://<deine-ha-ip>:8099/
   ```

---

## Discogs-Integration (optional)

VinylVault kann zusätzlich Metadaten von Discogs laden. Dazu in der
Add-on-Konfiguration einen **Discogs Personal Access Token** hinterlegen.
Einen Token gibt es unter https://www.discogs.com/settings/developers.

---

## Lokale Entwicklung (ohne Home Assistant)

```bash
cd media-collection-addon/app
npm install
DB_PATH=./data/collection.db PORT=8099 npm start
```

Dann <http://localhost:8099> öffnen.

---

## Repository-Struktur

```
VinylVault/
├── repository.json                # HA Add-on Repository Manifest
├── README.md                      # Diese Datei
└── media-collection-addon/
    ├── config.json                # Add-on Konfiguration
    ├── Dockerfile                 # Container-Definition
    ├── run.sh                     # Container Entry-Point
    ├── icon.png                   # Add-on Icon
    ├── logo.png                   # Add-on Logo
    ├── README.md                  # Add-on-Doku
    └── app/
        ├── package.json
        ├── server.js              # Express Entry-Point
        ├── database.js            # SQLite-Wrapper (better-sqlite3)
        ├── musicbrainz.js         # MusicBrainz + Cover Art Archive
        ├── discogs.js             # Discogs-API (optional)
        ├── routes/
        │   ├── index.js           # Sammlungsübersicht
        │   ├── items.js           # CRUD + Refresh + Bulk
        │   ├── api.js             # JSON-API (Suche, Künstler, Diskografie)
        │   └── csv.js             # CSV-Import & -Export
        ├── views/
        │   ├── index.ejs          # Sammlungs-Grid
        │   ├── add.ejs            # Hinzufügen (3 Tabs)
        │   ├── detail.ejs         # Detail / Bearbeiten
        │   ├── refresh.ejs        # Metadaten nachladen
        │   ├── bulk-refresh.ejs   # Massenanalyse
        │   ├── wishlist-add.ejs   # Wunschliste per Diskografie
        │   ├── csv.ejs            # CSV-Import
        │   ├── layout.ejs         # Shared Layout
        │   └── error.ejs          # Fehlerseite
        └── public/
            ├── style.css          # Hauptstyles
            ├── themes.css         # 15 Farbthemen
            └── theme-selector.js  # Theme-Auswahl & Persistenz
```

---

## Datenhaltung

Die SQLite-Datenbank liegt unter `/data/collection.db` im Container und wird
auf das persistente Datenverzeichnis von Home Assistant gemappt.
Your collection survives add-on updates and Home Assistant restarts.

---

## Credits

- Metadata: [MusicBrainz](https://musicbrainz.org) (CC0)
- Cover art: [Cover Art Archive](https://coverartarchive.org) (CC BY-SA / CC0)

Both services are free and open-source. Please respect their rate-limits.
