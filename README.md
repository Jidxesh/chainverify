# ChainVerify — Blockchain Document Verification

Static front-end demo for anchoring and verifying document SHA-256 hashes.
Data lives in memory by default, or in Firebase Firestore (REST API) once an admin connects a project.

## Structure

```
index.html       Page markup (landing, login, dashboard, public verify)
css/styles.css   All styles
js/db.js         Firestore REST client + DB layer (in-memory fallback)
js/app.js        Auth, admin/institute dashboards, verification, utilities
```

## Run

Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000

Demo logins: `admin` / `admin123`, `institute` / `inst123`.
