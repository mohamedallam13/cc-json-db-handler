# AGENT.md — cc-json-db-handler

## Purpose
A Google Apps Script backend that acts as a database API/backend using fragmented JSON files in Google Drive as its data store. Features a custom ORM layer and both GScript and REST API routers.

## Structure
```
cc-json-db-handler/
├── README.md
├── AGENT.md
├── .gitignore
└── src/
    ├── appsscript.json          ← GAS manifest
    ├── DBHandler.js             ← core DB read/write over Drive JSON files
    ├── ORM.js                   ← custom ORM layer
    ├── Router- GScript.js       ← GAS-internal routing (called from other scripts)
    ├── Router- REST API.js      ← REST-style doPost() handler
    ├── Controller- All.js       ← unified controller
    ├── Models- Applications.js  ← Applications data model
    ├── Models- CCOne.js         ← CCOne data model
    ├── Models- Confessions.js   ← Confessions data model
    ├── Data Refit.js            ← data migration / refit utility
    ├── z-Dump it.js             ← dev: DB dump utility
    ├── z-Seed.js                ← dev: DB seeding
    └── z-Testing.js             ← dev: test runner
```

## Key Facts
- **Platform:** Google Apps Script (backend API, no UI)
- **Data store:** Fragmented JSON files in Google Drive
- **Pattern:** ORM over Drive JSON, dual-router (GScript internal + REST API)
- **Entry point:** `Router- REST API.js` → `doPost()` for external calls

## Development Notes
- All source files live under `src/` — push with clasp from that directory
- Files with spaces in names (e.g., `Controller- All.js`) must be quoted in shell commands
- No Node/npm at runtime; ES5-compatible GAS code only
- `z-` prefixed files are dev/debug utilities — do not deploy to production
