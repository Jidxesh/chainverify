// ══════════════════════════════════════════════════════════════════════════════
// FIREBASE FIRESTORE — REST API database (no SDK needed, just fetch)
//
// SETUP (2 minutes, free):
//  1. console.firebase.google.com → Add project (any name)
//  2. Build → Firestore Database → Create database → Start in test mode
//  3. Project Settings (gear icon) → General → copy "Project ID"
//  4. Admin login → Firebase → paste Project ID → Connect
// ══════════════════════════════════════════════════════════════════════════════

let FB_PROJECT = '';   // e.g. "chainverify-abc12"

// ── Firestore REST client ─────────────────────────────────────────────────────
const Firestore = {
  _base() {
    return `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents`;
  },

  // Convert Firestore document format → plain JS object
  _fromDoc(doc) {
    if (!doc || !doc.fields) return null;
    const obj = { _id: doc.name.split('/').pop() };
    for (const [k, v] of Object.entries(doc.fields)) {
      if (v.stringValue  !== undefined) obj[k] = v.stringValue;
      else if (v.integerValue !== undefined) obj[k] = Number(v.integerValue);
      else if (v.doubleValue  !== undefined) obj[k] = v.doubleValue;
      else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
      else if (v.mapValue     !== undefined) obj[k] = this._fromDoc({ name:'', fields: v.mapValue.fields || {} });
      else if (v.arrayValue   !== undefined) obj[k] = (v.arrayValue.values || []).map(i => i.stringValue ?? i.integerValue ?? i.booleanValue ?? '');
      else obj[k] = null;
    }
    return obj;
  },

  // Convert plain JS object → Firestore fields format
  _toFields(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === '_id') continue;
      if (typeof v === 'string')  fields[k] = { stringValue: v };
      else if (typeof v === 'number') fields[k] = { doubleValue: v };
      else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
      else if (v === null || v === undefined) fields[k] = { nullValue: null };
      else if (typeof v === 'object') fields[k] = { stringValue: JSON.stringify(v) };
    }
    return fields;
  },

  async getAll(collection) {
    const res = await fetch(`${this._base()}/${collection}?pageSize=500`);
    if (!res.ok) throw new Error(`Firestore getAll ${collection}: ${res.status}`);
    const data = await res.json();
    return (data.documents || []).map(d => this._fromDoc(d));
  },

  async getDoc(collection, docId) {
    const res = await fetch(`${this._base()}/${collection}/${encodeURIComponent(docId)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Firestore get ${collection}/${docId}: ${res.status}`);
    return this._fromDoc(await res.json());
  },

  async setDoc(collection, docId, data) {
    const fields = this._toFields(data);
    const res = await fetch(
      `${this._base()}/${collection}/${encodeURIComponent(docId)}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }) }
    );
    if (!res.ok) throw new Error(`Firestore set ${collection}/${docId}: ${res.status} ${await res.text()}`);
    return res.json();
  },

  async updateField(collection, docId, fieldUpdates) {
    // PATCH with updateMask
    const fields = this._toFields(fieldUpdates);
    const mask = Object.keys(fieldUpdates).map(k => `updateMask.fieldPaths=${k}`).join('&');
    const res = await fetch(
      `${this._base()}/${collection}/${encodeURIComponent(docId)}?${mask}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }) }
    );
    if (!res.ok) throw new Error(`Firestore update: ${res.status}`);
  },

  async testConnection() {
    // Try reading a sentinel document
    // Listing a collection returns 200 (even if empty) when the database exists.
    // 404 = project or (default) database missing, 403 = rules deny access.
    const res = await fetch(`${this._base()}/_ping_chainverify?pageSize=1`);
    if (res.ok) return true;
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || `HTTP ${res.status}`);
  }
};

// ── DB layer — Firestore-backed with in-memory fallback ───────────────────────
const _mem = { requests:[], ledger:[], hashes:{}, institutes:[] };
let _fbReady = false;

const DB = {
  isConnected() { return _fbReady; },

  async get(col) {
    if (!_fbReady) return col === 'hashes' ? {..._mem.hashes} : [...(_mem[col]||[])];
    try {
      if (col === 'hashes') {
        const docs = await Firestore.getAll('hashes');
        const map = {};
        docs.forEach(d => { const h = d._id; const {_id,...m} = d; map[h] = m; });
        return map;
      }
      return await Firestore.getAll(col);
    } catch(e) {
      console.warn('Firestore read fallback:', e.message);
      return col === 'hashes' ? {..._mem.hashes} : [...(_mem[col]||[])];
    }
  },

  async insertRequest(doc) {
    _mem.requests.unshift(doc);
    if (!_fbReady) return;
    try { await Firestore.setDoc('requests', doc.id, doc); } catch(e) { console.warn(e); }
  },

  async insertLedgerEntry(doc) {
    _mem.ledger.unshift(doc);
    if (!_fbReady) return;
    try {
      const docId = 'BLK-' + String(doc.block).replace(/\D/g,'') + '-' + Date.now();
      await Firestore.setDoc('ledger', docId, doc);
    } catch(e) { console.warn(e); }
  },

  async insertHash(hash, meta) {
    _mem.hashes[hash] = meta;
    if (!_fbReady) return;
    try { await Firestore.setDoc('hashes', hash, meta); } catch(e) { console.warn(e); }
  },

  async updateRequestStatus(reqId, status) {
    const r = _mem.requests.find(x => x.id === reqId);
    if (r) r.status = status;
    if (!_fbReady) return;
    try { await Firestore.updateField('requests', reqId, { status }); } catch(e) { console.warn(e); }
  },

  async findHash(hash) {
    if (!_fbReady) return _mem.hashes[hash] || null;
    try {
      const doc = await Firestore.getDoc('hashes', hash);
      if (!doc) return null;
      const { _id, ...meta } = doc;
      return meta;
    } catch(e) {
      return _mem.hashes[hash] || null;
    }
  },

  async stats() {
    if (!_fbReady) return {
      requests: _mem.requests.length, ledger: _mem.ledger.length,
      hashes: Object.keys(_mem.hashes).length, institutes: _mem.institutes.length
    };
    try {
      const [rq,lg,hh,ins] = await Promise.all([
        Firestore.getAll('requests'), Firestore.getAll('ledger'),
        Firestore.getAll('hashes'),   Firestore.getAll('institutes'),
      ]);
      return { requests:rq.length, ledger:lg.length, hashes:hh.length, institutes:ins.length };
    } catch { return { requests:0, ledger:0, hashes:0, institutes:0 }; }
  },

  async init() {
    _mem.institutes = [
      { id:'INST-001', name:'MIT',                email:'admin@mit.edu',      joined:'2024-06-01', active:true },
      { id:'INST-002', name:'Harvard University', email:'admin@harvard.edu',  joined:'2024-07-15', active:true },
      { id:'INST-003', name:'Stanford University',email:'admin@stanford.edu', joined:'2024-08-20', active:true },
    ];
    _mem.requests = []; _mem.ledger = []; _mem.hashes = {};
    // Auto-reconnect if project ID was saved before
    try {
      const saved = localStorage.getItem('cv_fb_project');
      if (saved) await DB.connect(saved);
    } catch(e) {}
  },

  async connect(projectId) {
    FB_PROJECT = projectId.trim();
    showDbStatus('Connecting to Firebase Firestore…');
    try {
      await Firestore.testConnection();
      _fbReady = true;
      try { localStorage.setItem('cv_fb_project', FB_PROJECT); } catch(e) {}

      // Load existing data
      showDbStatus('Loading data from Firestore…');
      const [reqs, led, hashDocs, insts] = await Promise.all([
        Firestore.getAll('requests'),
        Firestore.getAll('ledger'),
        Firestore.getAll('hashes'),
        Firestore.getAll('institutes'),
      ]);

      _mem.requests = reqs;
      _mem.ledger   = led;
      _mem.hashes   = {};
      hashDocs.forEach(d => { const h = d._id; const {_id,...m} = d; _mem.hashes[h] = m; });

      // Seed institutes if empty
      if (insts.length === 0) {
        for (const inst of _mem.institutes) {
          await Firestore.setDoc('institutes', inst.id, inst);
        }
      } else {
        _mem.institutes = insts;
      }

      hideDbStatus();
      showToast('✓ Connected to Firebase Firestore', 'ok');
      updateDbStatusBadge(true);
      return true;
    } catch(e) {
      _fbReady = false;
      hideDbStatus();
      console.error('Firebase connect error:', e);
      return { error: e.message };
    }
  }
};

// ── UI helpers ────────────────────────────────────────────────────────────────
function updateDbStatusBadge(connected) {
  const badge = document.getElementById('dbBadge');
  if (!badge) return;
  badge.textContent = connected ? '● Firebase' : '● In-Memory';
  badge.style.color = connected ? '#FFA000' : '#F59E0B';
}

function showDbStatus(msg) {
  const bar = document.getElementById('dbStatusBar');
  if (bar) { bar.style.display = 'flex'; document.getElementById('dbStatusMsg').textContent = msg; }
}
function hideDbStatus() {
  const bar = document.getElementById('dbStatusBar');
  if (bar) bar.style.display = 'none';
}
