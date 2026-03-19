# CC JSON DB Handler

A Google Apps Script backend that acts as a database API using fragmented JSON files in Google Drive as the data store. Features a custom ORM layer and dual routing — both GAS-internal and REST-style via `doPost()`.

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Backend%20API-blue)
![Pattern](https://img.shields.io/badge/Pattern-ORM%20%2B%20Dual%20Router-lightgrey)

---

## Overview

This library serves as the shared data access layer across multiple CC community apps. It exposes two interfaces:

- **GScript Router** — called directly by other GAS scripts in the same project or via library imports
- **REST API Router** — called externally via `doPost()` HTTP requests

A custom ORM abstracts all Drive JSON file operations, and per-collection Models define the data shape.

---

## Features

- Dual-router architecture: internal GScript calls + external REST API
- Custom ORM over Drive-hosted fragmented JSON files
- Index-based file lookup for efficient reads
- Three data models: Applications, CCOne, Confessions
- Data migration / refit utility
- Dev utilities: DB dump, seeding, test runner (all prefixed `z-`)

---

## Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Platform | Google Apps Script              |
| Database | Fragmented JSON files in Google Drive |
| Pattern  | ORM + dual router               |
| Deploy   | clasp CLI                       |

---

## Project Structure

```
cc-json-db-handler/
├── README.md
├── AGENT.md
├── .gitignore
└── src/
    ├── appsscript.json           # GAS manifest
    ├── DBHandler.js              # Core Drive JSON file read/write
    ├── ORM.js                    # ORM abstraction layer
    ├── Router- GScript.js        # Internal GAS routing (library calls)
    ├── Router- REST API.js       # External REST doPost() handler
    ├── Controller- All.js        # Unified controller
    ├── Models- Applications.js   # Applications data model
    ├── Models- CCOne.js          # CCOne data model
    ├── Models- Confessions.js    # Confessions data model
    ├── Data Refit.js             # Data migration / refit utility
    ├── z-Dump it.js              # Dev: DB dump
    ├── z-Seed.js                 # Dev: DB seeding
    └── z-Testing.js              # Dev: test runner
```

> `z-` prefixed files are development utilities — do not include in production deployments.

---

## Getting Started

### Prerequisites

- A Google account with Google Apps Script access
- [clasp](https://github.com/google/clasp) installed globally

```bash
npm install -g @google/clasp
clasp login
```

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mohamedallam13/cc-json-db-handler.git
   cd cc-json-db-handler
   ```

2. Link to your Apps Script project:
   ```bash
   clasp create --type webapp --title "CC JSON DB Handler" --rootDir src
   ```

3. Push source files:
   ```bash
   clasp push
   ```

---

## Deployment

1. In the Apps Script editor, go to **Deploy > New deployment**
2. Select type: **Web app**
3. Set **Execute as**: Me · **Who has access**: Anyone with the link
4. Click **Deploy** — the Web App URL is the REST API endpoint

---

## Author

**Mohamed Allam** — [GitHub](https://github.com/mohamedallam13) · [Email](mailto:mohamedallam.tu@gmail.com)
