# VinylVault – Home Assistant Add-on

Self-hosted Vinyl-Sammlungsverwaltung. Verwalte deine Schallplattensammlung mit
automatischen Metadaten von MusicBrainz und Coverbildern vom Cover Art Archive.

## Funktionen

- Einträge hinzufügen, bearbeiten, löschen (einzeln und in Masse)
- Wunschliste mit Bulk-Hinzufügen ganzer Diskografien
- MusicBrainz-Suche mit 6-stufigem Matching + Cover Art Archive
- Discogs-Integration (optional, per Token)
- Massenanalyse – fehlende Cover für alle Einträge auf einmal nachladen
- CSV-Import & -Export
- 3 Ansichtsmodi (Grid, Liste, Karussell)
- 15 Farbthemen
- Echtzeit-Suche, Filter, Sortierung und Gruppierung
- 1–5-Sterne-Bewertungen
- Responsive Design für Desktop und Mobile
- Home Assistant Ingress (Sidebar-Integration)

## Benutzung

1. Add-on aus dem lokalen Repository installieren (siehe Repository-README).
2. Add-on starten.
3. **Web-UI öffnen** oder **In Seitenleiste anzeigen** aktivieren.
4. Mit **+ Hinzufügen** den ersten Eintrag anlegen.

## Konfiguration

Dieses Add-on hat keine Pflicht-Einstellungen. Alle Daten werden automatisch
in `/data/collection.db` gespeichert.

Optional kann ein **Discogs Personal Access Token** konfiguriert werden, um
zusätzliche Metadaten von Discogs zu laden.

## Ports

| Port | Beschreibung |
|------|--------------|
| 8099 | Web-UI (Ingress) |

## Support

Bitte ein Issue im [GitHub Repository](https://github.com/Unte87/VinylVault) öffnen.
