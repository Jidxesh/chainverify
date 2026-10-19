// ── Auth & State ──────────────────────────────────────────────────────────────
let currentRole = null, currentUser = null;
let pubFileHash = '', pubLastResult = null;

const CREDS = {
  admin:     { user:'admin',     pass:'admin123', label:'System Administrator' },
  institute: { user:'institute', pass:'inst123',  label:'MIT — Institute Portal' },
};

// Boot
(async () => {
  await DB.init();
  showPage('landingPage');
})();

function goToLogin(role) {
  currentRole = role;
  const isAdmin = role === 'admin';
  const card = document.getElementById('loginCard');
  card.className = 'login-card ' + (isAdmin ? 'admin-login' : 'institute-login');
  document.getElementById('loginBadge').textContent   = isAdmin ? 'SYSTEM ADMIN' : 'INSTITUTE / UNIVERSITY';
  document.getElementById('loginTitle').textContent   = isAdmin ? 'Admin Login' : 'Institute Login';
  document.getElementById('loginSub').textContent     = isAdmin ? 'Restricted access — authorised personnel only' : "Access your institution's document portal";
  document.getElementById('loginHint').innerHTML      = isAdmin ? 'Demo: <b>admin</b> / <b>admin123</b>' : 'Demo: <b>institute</b> / <b>inst123</b>';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').classList.remove('visible');
  showPage('loginPage');
}
function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  const cred = CREDS[currentRole];
  if (u === cred.user && p === cred.pass) {
    currentUser = cred.label;
    buildDashboard(currentRole);
    showPage('dashPage');
  } else {
    document.getElementById('loginError').classList.add('visible');
    document.getElementById('loginPass').value = '';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginPass')?.addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
  document.getElementById('loginUser')?.addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('loginPass').focus(); });
});
function doLogout() { currentRole = null; currentUser = null; showPage('landingPage'); }
function goBack()   { showPage('landingPage'); }
function showPage(id) { document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); document.getElementById(id)?.classList.add('active'); }

// ── Dashboard ─────────────────────────────────────────────────────────────────
function buildDashboard(role) {
  const dp = document.getElementById('dashPage');
  dp.className = 'page ' + (role==='admin' ? 'admin-mode' : 'institute-mode');
  const pill = document.getElementById('dashRolePill');
  pill.className = 'dash-role-pill ' + (role==='admin' ? 'admin-pill' : 'institute-pill');
  pill.textContent = role==='admin' ? 'ADMINISTRATOR' : 'INSTITUTE';
  document.getElementById('dashUser').textContent = currentUser;
  if (role==='admin') buildAdminDash(); else buildInstituteDash();
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
function buildAdminDash() {
  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-section"><div class="sidebar-label">Overview</div>
      <div class="sidebar-item active" onclick="adminNav('overview',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>Dashboard
      </div>
    </div>
    <div class="sidebar-section"><div class="sidebar-label">Requests</div>
      <div class="sidebar-item" onclick="adminNav('approvals',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Pending Approvals
        <span id="pendingBadge" style="margin-left:auto;background:rgba(245,158,11,0.2);color:#F59E0B;font-family:var(--mono);font-size:9px;padding:2px 7px;border-radius:10px;">…</span>
      </div>
    </div>
    <div class="sidebar-section"><div class="sidebar-label">Management</div>
      <div class="sidebar-item" onclick="adminNav('institutes',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14h12M3 14V7M13 14V7M8 2L2 7h12L8 2z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="5.5" y="9.5" width="5" height="4.5" rx=".5" stroke="currentColor" stroke-width="1.3"/></svg>Institutes
      </div>
      <div class="sidebar-item" onclick="adminNav('ledger',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 5.5h7M4.5 8h7M4.5 10.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Full Ledger
      </div>
    </div>
    <div class="sidebar-section"><div class="sidebar-label">Tools</div>
      <div class="sidebar-item" onclick="adminNav('verify',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M11 11l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Verify Document
      </div>
      <div class="sidebar-item" onclick="adminNav('firebase',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 12L6.5 2.5L9 7L11 4L13 12H3Z" stroke="#FFA000" stroke-width="1.3" stroke-linejoin="round"/><path d="M3 12L7 9L13 12" stroke="#FF6F00" stroke-width="1.3" stroke-linejoin="round"/></svg><span style="color:#FFA000">Firebase</span>
      </div>
    </div>`;
  adminNav('overview', null);
}

async function adminNav(name, el) {
  if(el) { document.querySelectorAll('.sidebar-item').forEach(i=>i.classList.remove('active')); el.classList.add('active'); }
  const m = document.getElementById('dashMain');
  m.innerHTML = `<div style="padding:60px;text-align:center;font-family:var(--mono);font-size:12px;color:var(--muted)">Loading…</div>`;

  const [requests, ledger, institutes] = await Promise.all([DB.get('requests'), DB.get('ledger'), DB.get('institutes')]);
  const reqs = requests||[], led = ledger||[], insts = institutes||[];
  const pending = reqs.filter(r=>r.status==='pending').length;
  const pbEl = document.getElementById('pendingBadge');
  if(pbEl) pbEl.textContent = pending;

  const dbMode = DB.isConnected()
    ? `<span style="color:#FFA000">● Firebase Firestore</span>`
    : `<span style="color:#F59E0B">● In-Memory (connect Firebase for persistence)</span>`;

  if (name==='overview') {
    m.innerHTML = `
      <div class="section-head"><h2>System Overview</h2><span class="section-tag">ADMIN</span></div>
      <div class="stat-row">
        <div class="stat-card"><div class="stat-card-num">${led.length}</div><div class="stat-card-lbl">Docs Anchored</div></div>
        <div class="stat-card"><div class="stat-card-num">${pending}</div><div class="stat-card-lbl">Pending</div></div>
        <div class="stat-card"><div class="stat-card-num">${insts.length}</div><div class="stat-card-lbl">Institutes</div></div>
        <div class="stat-card"><div class="stat-card-num">${reqs.length}</div><div class="stat-card-lbl">Total Requests</div></div>
      </div>
      <div class="db-indicator">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><ellipse cx="6" cy="3" rx="4.5" ry="1.5" stroke="currentColor" stroke-width="1"/><path d="M1.5 3v3c0 .83 2.01 1.5 4.5 1.5S10.5 6.83 10.5 6V3" stroke="currentColor" stroke-width="1"/><path d="M1.5 6v3c0 .83 2.01 1.5 4.5 1.5S10.5 9.83 10.5 9V6" stroke="currentColor" stroke-width="1"/></svg>
        Database: ${dbMode} · ${reqs.length} requests · ${led.length} anchored
      </div>
      <div class="section-head" style="margin-top:8px"><h2>Recent Requests</h2></div>
      ${renderPendingTable(reqs.slice(0,5), true)}`;

  } else if (name==='approvals') {
    m.innerHTML = `
      <div class="section-head"><h2>Pending Approvals</h2><span class="section-tag">${pending} WAITING</span></div>
      <div class="alert-box info">Review each document hash before approving. Anchoring is irreversible.</div>
      ${renderPendingTable(reqs, false)}`;

  } else if (name==='institutes') {
    m.innerHTML = `
      <div class="section-head"><h2>Registered Institutes</h2><span class="section-tag">${insts.length} ACTIVE</span></div>
      <div class="ledger-wrap">
        <div class="ledger-head" style="grid-template-columns:90px 1fr 180px 60px 80px">
          <div class="lh">ID</div><div class="lh">Name</div><div class="lh">Email</div><div class="lh">Docs</div><div class="lh">Status</div>
        </div>
        ${insts.map(i=>`<div class="ledger-row-item" style="grid-template-columns:90px 1fr 180px 60px 80px">
          <div class="lc" style="color:var(--gold)">${i.id}</div>
          <div class="lc">${esc(i.name)}</div>
          <div class="lc" style="color:var(--text2)">${esc(i.email)}</div>
          <div class="lc" style="color:var(--accent)">${led.filter(l=>l.institute===i.name).length}</div>
          <div class="lc"><span class="badge ok"><span class="badge-dot"></span>ACTIVE</span></div>
        </div>`).join('')}
      </div>`;

  } else if (name==='ledger') {
    m.innerHTML = `
      <div class="section-head"><h2>Full Blockchain Ledger</h2><span class="section-tag">${led.length} RECORDS</span></div>
      <div class="ledger-wrap">
        <div class="ledger-head" style="grid-template-columns:110px 1fr 120px 150px 90px">
          <div class="lh">Block</div><div class="lh">Document</div><div class="lh">Institute</div><div class="lh">Timestamp</div><div class="lh">Status</div>
        </div>
        ${led.length ? led.map(r=>`<div class="ledger-row-item" style="grid-template-columns:110px 1fr 120px 150px 90px">
          <div class="lc" style="color:var(--blue)">#${r.block}</div>
          <div class="lc"><div>${esc(r.docName)}</div><div style="color:var(--muted);font-size:10px;margin-top:2px">${(r.hash||'').slice(0,22)}…</div></div>
          <div class="lc" style="color:var(--text2)">${esc(r.institute)}</div>
          <div class="lc" style="color:var(--muted)">${r.time}</div>
          <div class="lc"><span class="badge ok"><span class="badge-dot"></span>ANCHORED</span></div>
        </div>`).join('') : '<div class="empty-state">No records yet</div>'}
      </div>`;

  } else if (name==='verify') {
    m.innerHTML = `<div class="section-head"><h2>Verify Document</h2><span class="section-tag">ADMIN TOOL</span></div><div class="verify-section">${verifyHTML('adm')}</div>`;
    attachVerify('adm');

  } else if (name==='firebase') {
    const connected = DB.isConnected();
    const s = await DB.stats();
    m.innerHTML = `
      <div class="section-head"><h2>Firebase Firestore</h2>
        <span class="section-tag" style="color:${connected?'#FFA000':'var(--muted)'};border-color:${connected?'rgba(255,160,0,0.3)':'var(--border)'};background:${connected?'rgba(255,160,0,0.08)':'transparent'}">
          ${connected ? '● CONNECTED' : '○ NOT CONNECTED'}
        </span>
      </div>

      ${!connected ? `
      <div class="fb-setup-card">
        <div class="fb-logo-row">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 20L10.5 4L15 13L19 7L23 20H5Z" fill="#FFA000" opacity="0.9"/>
            <path d="M5 20L13 15L23 20" fill="#FF6F00"/>
          </svg>
          <span style="font-size:20px;font-weight:800;letter-spacing:-0.5px">Connect Firebase Firestore</span>
        </div>
        <p style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.7">
          Free Google cloud database. All requests, approvals, hashes, and ledger entries will be stored persistently in Firestore — no backend needed.
        </p>

        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:6px;padding:12px 16px;margin-bottom:20px;display:flex;gap:10px;align-items:flex-start">
          <span style="color:#F59E0B;font-size:16px;flex-shrink:0">⚠</span>
          <div style="font-family:var(--mono);font-size:11px;color:var(--text2);line-height:1.7">
            <b style="color:#F59E0B">Run locally for Firebase to work.</b> This preview sandbox blocks external API calls. 
            Download the HTML file and open it in your browser — Firebase will connect instantly.
          </div>
        </div>

        <div class="fb-steps">
          <div class="fb-step"><div class="fb-step-num">1</div><div>Go to <a href="https://console.firebase.google.com" target="_blank" style="color:#FFA000">console.firebase.google.com</a> → <b>Add project</b> (any name)</div></div>
          <div class="fb-step"><div class="fb-step-num">2</div><div>In your project → <b>Build → Firestore Database → Create database</b></div></div>
          <div class="fb-step"><div class="fb-step-num">3</div><div>Choose <b>Start in test mode</b> → pick any region → Done</div></div>
          <div class="fb-step"><div class="fb-step-num">4</div><div>Go to <b>Project Settings</b> (⚙ gear icon) → copy your <b>Project ID</b><br><span style="color:var(--muted);font-size:11px">Looks like: chainverify-abc12</span></div></div>
        </div>

        <div class="fb-form">
          <div class="form-group">
            <label class="form-label">Firebase Project ID</label>
            <input class="form-input" id="fbProjectId" placeholder="your-project-id" value="${esc(FB_PROJECT)}" style="font-size:13px;letter-spacing:0.5px">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:6px">Found in: Project Settings → General → Project ID</div>
          </div>
          <button class="btn-firebase" onclick="connectFirebase()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 12L6.5 2.5L9 7L11 4L13 12H3Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
            CONNECT TO FIRESTORE
          </button>
        </div>
        <div id="fbError" class="fb-error" style="display:none"></div>
      </div>

      ` : `
      <div class="fb-connected-card">
        <div class="fb-conn-header">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M4 28L12 6L18 16L23 9L32 28H4Z" fill="#FFA000"/>
            <path d="M4 28L18 20L32 28" fill="#FF6F00"/>
          </svg>
          <div>
            <div style="font-size:18px;font-weight:800;color:#FFA000">Connected to Firestore</div>
            <div style="font-family:var(--mono);font-size:11px;color:var(--muted)">${FB_PROJECT} · All writes persisted in real-time</div>
          </div>
        </div>

        <div class="fb-coll-grid">
          <div class="fb-coll-card"><div class="fb-coll-name">requests</div><div class="fb-coll-count" style="color:var(--gold)">${s.requests}</div><div class="fb-coll-desc">documents</div></div>
          <div class="fb-coll-card"><div class="fb-coll-name">ledger</div><div class="fb-coll-count" style="color:#FFA000">${s.ledger}</div><div class="fb-coll-desc">documents</div></div>
          <div class="fb-coll-card"><div class="fb-coll-name">hashes</div><div class="fb-coll-count" style="color:var(--blue)">${s.hashes}</div><div class="fb-coll-desc">documents</div></div>
          <div class="fb-coll-card"><div class="fb-coll-name">institutes</div><div class="fb-coll-count" style="color:var(--accent)">${s.institutes}</div><div class="fb-coll-desc">documents</div></div>
        </div>

        <div class="fb-conn-info">
          <div class="fb-info-row"><span class="fb-info-k">PROJECT ID</span><span class="fb-info-v" style="font-family:var(--mono)">${FB_PROJECT}</span></div>
          <div class="fb-info-row"><span class="fb-info-k">DATABASE</span><span class="fb-info-v">(default)</span></div>
          <div class="fb-info-row"><span class="fb-info-k">API</span><span class="fb-info-v">Firestore REST v1</span></div>
          <div class="fb-info-row"><span class="fb-info-k">AUTH</span><span class="fb-info-v">Test mode (open access)</span></div>
          <div class="fb-info-row"><span class="fb-info-k">STATUS</span><span class="fb-info-v" style="color:#FFA000">● Online — all writes persisted</span></div>
        </div>

        <button class="btn-fb-disconnect" onclick="disconnectFirebase()">DISCONNECT</button>
      </div>`}`;
  }
}

async function connectFirebase() {
  const projectId = document.getElementById('fbProjectId').value.trim();
  const errEl = document.getElementById('fbError');
  if (!projectId) { errEl.style.display='block'; errEl.textContent='Project ID is required.'; return; }
  errEl.style.display = 'none';
  const btn = document.querySelector('.btn-firebase');
  btn.textContent = 'Connecting…'; btn.disabled = true;
  const result = await DB.connect(projectId);
  btn.disabled = false;
  if (result === true) {
    adminNav('firebase', null);
  } else {
    errEl.style.display = 'block';
    errEl.textContent = result?.error?.includes('fetch')
      ? '⚠ Network blocked by sandbox. Download this file and open it locally — Firebase will connect perfectly outside this preview.'
      : result?.error
        ? `Error: ${result.error}. Make sure Firestore is enabled and in test mode.`
        : 'Connection failed. Check your Project ID and ensure Firestore Database is created in test mode.';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 12L6.5 2.5L9 7L11 4L13 12H3Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg> CONNECT TO FIRESTORE`;
  }
}

function disconnectFirebase() {
  _fbReady = false;
  FB_PROJECT = '';
  try { localStorage.removeItem('cv_fb_project'); } catch(e) {}
  updateDbStatusBadge(false);
  adminNav('firebase', null);
}

function renderPendingTable(reqs, compact) {
  const cols = compact ? '90px 1fr 110px 100px' : '90px 1fr 130px 200px';
  if (!reqs.length) return `<div class="ledger-wrap"><div class="empty-state">No requests found</div></div>`;
  return `<div class="ledger-wrap"><div class="ledger-head" style="grid-template-columns:${cols}">
    <div class="lh">Req ID</div><div class="lh">Document</div><div class="lh">Date</div><div class="lh">${compact?'Status':'Action'}</div>
  </div>${reqs.map(r=>{
    const action = compact
      ? `<span class="badge ${r.status==='pending'?'pending':r.status==='approved'?'ok':'reject'}"><span class="badge-dot"></span>${(r.status||"").toUpperCase()}</span>`
      : r.status==='pending'
        ? `<div class="action-btns"><button class="btn-approve" onclick="approveReq('${r.id}')">✓ APPROVE</button><button class="btn-reject" onclick="rejectReq('${r.id}')">✗ REJECT</button></div>`
        : `<span class="badge ${r.status==='approved'?'ok':'reject'}"><span class="badge-dot"></span>${(r.status||"").toUpperCase()}</span>`;
    return `<div class="ledger-row-item" style="grid-template-columns:${cols}">
      <div class="lc" style="color:var(--gold)">${r.id}</div>
      <div class="lc"><div>${esc(r.docName)}</div><div style="color:var(--muted);font-size:10px;margin-top:2px">${esc(r.institute||'')} · ${esc(r.recipient||'—')}</div></div>
      <div class="lc" style="color:var(--muted)">${(r.submitted||'').slice(0,10)}</div>
      <div class="lc">${action}</div>
    </div>`;
  }).join('')}</div>`;
}

async function approveReq(reqId) {
  showDbStatus('Writing to Firebase Firestore…');
  const reqs = await DB.get('requests') || [];
  const req  = reqs.find(r=>r.id===reqId);
  if (!req) { hideDbStatus(); return; }

  const block  = (19847232 + Math.floor(Math.random()*500)).toLocaleString();
  const now    = new Date().toISOString().replace('T',' ').slice(0,19);
  const txHash = '0x' + [...Array(64)].map(()=>Math.floor(Math.random()*16).toString(16)).join('');

  await DB.updateRequestStatus(reqId, 'approved');
  await DB.insertLedgerEntry({ block, institute:req.institute, docName:req.docName, hash:req.hash, time:now, status:'ANCHORED', txHash, recipient:req.recipient, type:req.type });
  await DB.insertHash(req.hash, { name:req.docName, type:req.type, recipient:req.recipient, institute:req.institute, reqId, submitted:now, block, txHash });

  hideDbStatus();
  showToast('✓ Anchored to block #'+block + (DB.isConnected() ? ' · Saved to Firestore' : ''), 'ok');
  adminNav('approvals', null);
}

async function rejectReq(reqId) {
  showDbStatus('Updating…');
  await DB.updateRequestStatus(reqId, 'rejected');
  hideDbStatus();
  showToast('Request rejected', 'warn');
  adminNav('approvals', null);
}

// ── INSTITUTE ─────────────────────────────────────────────────────────────────
function buildInstituteDash() {
  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-section"><div class="sidebar-label">Overview</div>
      <div class="sidebar-item active" onclick="instNav('overview',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>Dashboard
      </div>
    </div>
    <div class="sidebar-section"><div class="sidebar-label">Documents</div>
      <div class="sidebar-item" onclick="instNav('anchor',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Anchor Document
      </div>
      <div class="sidebar-item" onclick="instNav('requests',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3.5L10.5 11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>My Requests
      </div>
      <div class="sidebar-item" onclick="instNav('issued',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 4L6 11l-3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Anchored Docs
      </div>
    </div>
    <div class="sidebar-section"><div class="sidebar-label">Tools</div>
      <div class="sidebar-item" onclick="instNav('verify',this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M11 11l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Verify Document
      </div>
    </div>`;
  instNav('overview', null);
}

async function instNav(name, el) {
  if(el) { document.querySelectorAll('.sidebar-item').forEach(i=>i.classList.remove('active')); el.classList.add('active'); }
  const m = document.getElementById('dashMain');
  m.innerHTML = `<div style="padding:60px;text-align:center;font-family:var(--mono);font-size:12px;color:var(--muted)">Loading…</div>`;

  const [reqs, led] = await Promise.all([DB.get('requests'), DB.get('ledger')]);
  const myReqs = (reqs||[]).filter(r=>r.institute==='MIT');
  const myLed  = (led||[]).filter(r=>r.institute==='MIT');

  if (name==='overview') {
    m.innerHTML = `
      <div class="section-head"><h2>Institute Dashboard</h2><span class="section-tag">MIT PORTAL</span></div>
      <div class="stat-row">
        <div class="stat-card"><div class="stat-card-num">${myReqs.length}</div><div class="stat-card-lbl">Submitted</div></div>
        <div class="stat-card"><div class="stat-card-num">${myReqs.filter(r=>r.status==='pending').length}</div><div class="stat-card-lbl">Pending</div></div>
        <div class="stat-card"><div class="stat-card-num">${myLed.length}</div><div class="stat-card-lbl">Anchored</div></div>
        <div class="stat-card"><div class="stat-card-num">${myReqs.length}</div><div class="stat-card-lbl">Total Docs</div></div>
      </div>
      <div class="db-indicator"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><ellipse cx="6" cy="3" rx="4.5" ry="1.5" stroke="currentColor" stroke-width="1"/><path d="M1.5 3v3c0 .83 2.01 1.5 4.5 1.5S10.5 6.83 10.5 6V3" stroke="currentColor" stroke-width="1"/><path d="M1.5 6v3c0 .83 2.01 1.5 4.5 1.5S10.5 9.83 10.5 9V6" stroke="currentColor" stroke-width="1"/></svg>
        ${DB.isConnected() ? '<span style="color:#FFA000">● Firebase Firestore — data is persistent</span>' : '<span style="color:#F59E0B">● In-Memory — connect Firebase for persistence</span>'}
      </div>
      <div class="section-head" style="margin-top:8px"><h2>Recent Requests</h2></div>
      ${renderMyReqs(myReqs.slice(0,4))}`;

  } else if (name==='anchor') {
    m.innerHTML = `
      <div class="section-head"><h2>Anchor Document</h2><span class="section-tag">SUBMIT REQUEST</span></div>
      <div class="alert-box warn">Anchoring requires Admin approval before being written to the blockchain.</div>
      <div id="anchorZone" class="upload-zone">
        <input type="file" id="anchorFile" style="display:none">
        <div class="upload-zone-icon"><svg viewBox="0 0 52 52" fill="none"><rect x="8" y="10" width="36" height="32" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M26 34V20M26 20L19 27M26 20l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="upload-zone-title">Drop document to hash</div>
        <div class="upload-zone-sub">PDF · DOCX · PNG · JPG · Any format</div>
      </div>
      <div class="hash-row" id="anchorHashRow"><div class="hash-box" id="anchorHashVal">—</div><button class="icon-btn" onclick="copyHashEl('anchorHashVal')">COPY</button></div>
      <div class="reg-form" id="anchorForm">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Document Name</label><input class="form-input" id="anchorDocName" type="text" placeholder="e.g. Diploma_2025.pdf"></div>
          <div class="form-group"><label class="form-label">Document Type</label><select class="form-select" id="anchorDocType"><option value="">Select type...</option><option>Degree Certificate</option><option>Transcript</option><option>Diploma</option><option>Research Paper</option><option>Enrollment Letter</option><option>Other</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Student / Recipient Name</label><input class="form-input" id="anchorRecipient" type="text" placeholder="Full name of recipient"></div>
        <button class="btn-primary" onclick="submitAnchorReq()">SUBMIT ANCHOR REQUEST →</button>
      </div>
      <div class="processing" id="anchorProc"><div class="chain-loader"><div class="cn"></div><div class="cl"></div><div class="cn"></div><div class="cl"></div><div class="cn"></div><div class="cl"></div><div class="cn"></div><div class="cl"></div><div class="cn"></div></div><div class="proc-text">Saving to database…</div><div class="proc-step" id="anchorStep">Computing SHA-256</div></div>
      <div class="result-card" id="anchorResult">
        <div class="result-head pend"><div class="result-icon"><svg viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke="#F59E0B" stroke-width="1.8"/><path d="M22 13v9.5L26.5 27" stroke="#F59E0B" stroke-width="1.8" stroke-linecap="round"/></svg></div><div><div class="result-title pend">Request Submitted</div><div class="result-sub2" id="anchorSaveStatus">Awaiting Admin approval</div></div></div>
        <div class="result-body" id="anchorResultBody"></div>
      </div>`;
    attachAnchor();

  } else if (name==='requests') {
    m.innerHTML = `<div class="section-head"><h2>My Anchor Requests</h2><span class="section-tag">${myReqs.length} TOTAL</span></div>${renderMyReqs(myReqs)}`;

  } else if (name==='issued') {
    m.innerHTML = `
      <div class="section-head"><h2>Anchored Documents</h2><span class="section-tag">${myLed.length} ON CHAIN</span></div>
      <div class="ledger-wrap">
        <div class="ledger-head" style="grid-template-columns:110px 1fr 150px 90px">
          <div class="lh">Block</div><div class="lh">Document</div><div class="lh">Timestamp</div><div class="lh">Status</div>
        </div>
        ${myLed.length ? myLed.map(r=>`<div class="ledger-row-item" style="grid-template-columns:110px 1fr 150px 90px">
          <div class="lc" style="color:var(--blue)">#${r.block}</div>
          <div class="lc"><div>${esc(r.docName)}</div><div style="color:var(--muted);font-size:10px;margin-top:2px">${(r.hash||'').slice(0,22)}…</div></div>
          <div class="lc" style="color:var(--muted)">${r.time}</div>
          <div class="lc"><span class="badge ok"><span class="badge-dot"></span>ANCHORED</span></div>
        </div>`).join('') : '<div class="empty-state">No anchored documents yet.</div>'}
      </div>`;

  } else if (name==='verify') {
    m.innerHTML = `<div class="section-head"><h2>Verify Document</h2></div><div class="verify-section">${verifyHTML('inst')}</div>`;
    attachVerify('inst');
  }
}

function renderMyReqs(reqs) {
  if (!reqs.length) return '<div class="ledger-wrap"><div class="empty-state">No requests yet.</div></div>';
  return `<div class="ledger-wrap"><div class="ledger-head" style="grid-template-columns:90px 1fr 110px 100px">
    <div class="lh">Req ID</div><div class="lh">Document</div><div class="lh">Submitted</div><div class="lh">Status</div>
  </div>${reqs.map(r=>`<div class="ledger-row-item" style="grid-template-columns:90px 1fr 110px 100px">
    <div class="lc" style="color:var(--blue)">${r.id}</div>
    <div class="lc"><div>${esc(r.docName)}</div><div style="color:var(--muted);font-size:10px;margin-top:2px">${(r.hash||'').slice(0,22)}…</div></div>
    <div class="lc" style="color:var(--muted)">${(r.submitted||'').slice(0,10)}</div>
    <div class="lc"><span class="badge ${r.status==='pending'?'pending':r.status==='approved'?'ok':'reject'}"><span class="badge-dot"></span>${(r.status||"").toUpperCase()}</span></div>
  </div>`).join('')}</div>`;
}

// ── Anchor Submit ─────────────────────────────────────────────────────────────
let aHash='';
function attachAnchor() {
  aHash='';
  const zone=document.getElementById('anchorZone'), inp=document.getElementById('anchorFile');
  zone.addEventListener('click',()=>inp.click());
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over');});
  zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
  zone.addEventListener('drop',async e=>{e.preventDefault();zone.classList.remove('drag-over');if(e.dataTransfer.files[0]) await processAnchor(e.dataTransfer.files[0]);});
  inp.addEventListener('change',async e=>{if(e.target.files[0]) await processAnchor(e.target.files[0]);});
}
async function processAnchor(file) {
  aHash=await hashFile(file);
  document.getElementById('anchorHashVal').textContent=aHash;
  document.getElementById('anchorHashRow').classList.add('visible');
  document.getElementById('anchorForm').classList.add('visible');
  document.getElementById('anchorDocName').value=file.name;
  document.getElementById('anchorResult').classList.remove('visible');
}
function copyHashEl(id) { navigator.clipboard.writeText(document.getElementById(id).textContent).catch(()=>{}); showToast('Hash copied'); }

async function submitAnchorReq() {
  if (!aHash) return;
  const name=document.getElementById('anchorDocName').value||'Untitled';
  const type=document.getElementById('anchorDocType').value||'Document';
  const recipient=document.getElementById('anchorRecipient').value||'Unknown';
  document.getElementById('anchorForm').classList.remove('visible');
  document.getElementById('anchorHashRow').classList.remove('visible');
  const proc=document.getElementById('anchorProc'); proc.classList.add('visible');

  const steps=['Computing SHA-256…','Validating document…',DB.isConnected()?'Saving to Firebase…':'Saving to memory…','Request confirmed ✓'];
  let i=0; const el=document.getElementById('anchorStep');
  const itv=setInterval(()=>{if(i<steps.length) el.textContent=steps[i++];},700);
  await sleep(2800); clearInterval(itv); proc.classList.remove('visible');

  const reqs = await DB.get('requests') || [];
  const reqId='REQ-'+String(reqs.length+1).padStart(3,'0');
  const now=new Date().toISOString().replace('T',' ').slice(0,19);
  const doc={id:reqId, institute:'MIT', docName:name, hash:aHash, submitted:now, status:'pending', type, recipient};

  await DB.insertRequest(doc);

  document.getElementById('anchorSaveStatus').textContent = DB.isConnected()
    ? '✓ Saved to Firebase · Awaiting Admin approval'
    : 'Awaiting Admin approval (connect Firebase for persistence)';
  document.getElementById('anchorResultBody').innerHTML=`
    <div class="result-row"><div class="rk">Request ID</div><div class="rv blue">${reqId}</div></div>
    <div class="result-row"><div class="rk">Document</div><div class="rv">${esc(name)}</div></div>
    <div class="result-row"><div class="rk">Type</div><div class="rv">${esc(type)}</div></div>
    <div class="result-row"><div class="rk">Recipient</div><div class="rv">${esc(recipient)}</div></div>
    <div class="result-row"><div class="rk">SHA-256</div><div class="rv acc">${aHash.slice(0,34)}…</div></div>
    <div class="result-row"><div class="rk">Saved</div><div class="rv acc">✓ ${now} UTC</div></div>
    <div class="result-row"><div class="rk">Status</div><div class="rv gold">⏳ AWAITING ADMIN APPROVAL</div></div>`;
  document.getElementById('anchorResult').classList.add('visible');
  showToast('Request submitted' + (DB.isConnected() ? ' → Firebase Firestore' : ''), 'warn');
}

// ── Shared Verify ─────────────────────────────────────────────────────────────
function verifyHTML(ns) {
  return `<div id="vz_${ns}" class="upload-zone"><input type="file" id="vf_${ns}" style="display:none"><div class="upload-zone-icon"><svg viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="16" stroke="currentColor" stroke-width="1.8"/><path d="M19 26l5 5 9-10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26" cy="26" r="22" stroke="currentColor" stroke-width="1" opacity="0.2" stroke-dasharray="4 4"/></svg></div><div class="upload-zone-title">Upload document to verify</div><div class="upload-zone-sub">or enter hash below</div></div>
  <div style="margin-top:16px"><div class="form-group"><label class="form-label">SHA-256 Hash</label><input class="form-input" id="vh_${ns}" type="text" placeholder="0x...sha256"></div><button class="btn-primary" onclick="runVerify('${ns}')">VERIFY ON BLOCKCHAIN</button></div>
  <div class="processing" id="vp_${ns}"><div class="chain-loader"><div class="cn"></div><div class="cl"></div><div class="cn"></div><div class="cl"></div><div class="cn"></div><div class="cl"></div><div class="cn"></div><div class="cl"></div><div class="cn"></div></div><div class="proc-text">Querying database…</div><div class="proc-step" id="vs_${ns}">Connecting</div></div>
  <div class="result-card" id="vr_${ns}"><div class="result-head" id="vrh_${ns}"><div class="result-icon" id="vri_${ns}"></div><div><div class="result-title" id="vrt_${ns}"></div><div class="result-sub2" id="vrs_${ns}"></div></div></div><div class="result-body" id="vrb_${ns}"></div></div>`;
}
function attachVerify(ns) {
  const z=document.getElementById(`vz_${ns}`),f=document.getElementById(`vf_${ns}`);
  z.addEventListener('click',()=>f.click());
  z.addEventListener('dragover',e=>{e.preventDefault();z.classList.add('drag-over');});
  z.addEventListener('dragleave',()=>z.classList.remove('drag-over'));
  z.addEventListener('drop',async e=>{e.preventDefault();z.classList.remove('drag-over');if(e.dataTransfer.files[0]){document.getElementById(`vh_${ns}`).value=await hashFile(e.dataTransfer.files[0]);}});
  f.addEventListener('change',async e=>{if(e.target.files[0]){document.getElementById(`vh_${ns}`).value=await hashFile(e.target.files[0]);}});
}
async function runVerify(ns) {
  const hash=normalizeHash(document.getElementById(`vh_${ns}`).value);
  if(!hash){document.getElementById(`vh_${ns}`).focus();return;}
  document.getElementById(`vr_${ns}`).classList.remove('visible');
  const proc=document.getElementById(`vp_${ns}`); proc.classList.add('visible');
  const steps=[DB.isConnected()?'Querying Firebase Firestore…':'Searching in-memory DB…','Scanning block history…','Cross-referencing Merkle tree…','Finalizing…'];
  let i=0; const el=document.getElementById(`vs_${ns}`);
  const itv=setInterval(()=>{if(i<steps.length)el.textContent=steps[i++];},700);
  await sleep(2800); clearInterval(itv); proc.classList.remove('visible');

  const rec=await DB.findHash(hash);
  const found=!!rec;
  const head=document.getElementById(`vrh_${ns}`),icon=document.getElementById(`vri_${ns}`),
        title=document.getElementById(`vrt_${ns}`),sub=document.getElementById(`vrs_${ns}`),
        body=document.getElementById(`vrb_${ns}`);
  if(found){
    head.className='result-head ok';
    icon.innerHTML=`<svg viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke="#00FFB2" stroke-width="1.8"/><path d="M13 22l7 7 11-14" stroke="#00FFB2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    title.className='result-title ok';title.textContent='Document Verified';
    sub.textContent='Hash found in database — document is authentic';
    body.innerHTML=`<div class="result-row"><div class="rk">Document</div><div class="rv">${esc(rec.name)}</div></div><div class="result-row"><div class="rk">Type</div><div class="rv">${esc(rec.type||'—')}</div></div><div class="result-row"><div class="rk">Recipient</div><div class="rv">${esc(rec.recipient||'—')}</div></div><div class="result-row"><div class="rk">Institute</div><div class="rv blue">${esc(rec.institute)}</div></div><div class="result-row"><div class="rk">SHA-256</div><div class="rv acc">${esc(hash.slice(0,34))}…</div></div><div class="result-row"><div class="rk">Anchored</div><div class="rv">${rec.submitted} UTC</div></div><div class="result-row"><div class="rk">Integrity</div><div class="rv acc">✓ INTACT</div></div>`;
  } else {
    head.className='result-head fail';
    icon.innerHTML=`<svg viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke="#EF4444" stroke-width="1.8"/><path d="M15 15l14 14M29 15L15 29" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/></svg>`;
    title.className='result-title fail';title.textContent='Not Found';
    sub.textContent='No database record matches this hash';
    body.innerHTML=`<div class="result-row"><div class="rk">Hash</div><div class="rv" style="color:var(--warn)">${esc(hash.slice(0,34))}…</div></div><div class="result-row"><div class="rk">Status</div><div class="rv" style="color:var(--warn)">✗ No match</div></div><div class="result-row"><div class="rk">Conclusion</div><div class="rv" style="color:var(--muted)">Unregistered or tampered</div></div>`;
  }
  document.getElementById(`vr_${ns}`).classList.add('visible');
}

// ── Public Page ───────────────────────────────────────────────────────────────
function goToPublic() { showPage('publicPage'); initPublicPage(); }
function initPublicPage() {
  pubFileHash='';pubLastResult=null;
  document.getElementById('pubHashPreview').classList.remove('visible');
  document.getElementById('pubFileVerifyBtn').style.display='none';
  document.getElementById('pubResult').classList.remove('visible');
  document.getElementById('pubProcessing').classList.remove('visible');
  document.getElementById('pubHashInputField').value='';
  document.getElementById('pubFilePanel').classList.add('active');
  document.getElementById('pubHashPanel').classList.remove('active');
  document.querySelectorAll('.pub-tab').forEach((t,i)=>t.classList.toggle('active',i===0));
  const zone=document.getElementById('pubUploadZone'),inp=document.getElementById('pubFileInput');
  const nz=zone.cloneNode(true);zone.replaceWith(nz);const ni=inp.cloneNode(true);inp.replaceWith(ni);
  nz.addEventListener('click',()=>ni.click());
  nz.addEventListener('dragover',e=>{e.preventDefault();nz.classList.add('drag-over');});
  nz.addEventListener('dragleave',()=>nz.classList.remove('drag-over'));
  nz.addEventListener('drop',async e=>{e.preventDefault();nz.classList.remove('drag-over');if(e.dataTransfer.files[0]) await setPubFile(e.dataTransfer.files[0]);});
  ni.addEventListener('change',async e=>{if(e.target.files[0]) await setPubFile(e.target.files[0]);});
}
async function setPubFile(file) {
  pubFileHash=await hashFile(file);
  document.getElementById('pubHashPreviewVal').textContent=pubFileHash;
  document.getElementById('pubHashPreview').classList.add('visible');
  document.getElementById('pubFileVerifyBtn').style.display='flex';
}
function switchPubTab(tab,el) {
  document.querySelectorAll('.pub-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  document.getElementById('pubFilePanel').classList.toggle('active',tab==='file');
  document.getElementById('pubHashPanel').classList.toggle('active',tab==='hash');
  document.getElementById('pubResult').classList.remove('visible');
}
async function pubVerify(mode) {
  const hash=mode==='file'?pubFileHash:normalizeHash(document.getElementById('pubHashInputField').value);
  if(!hash){if(mode==='hash')document.getElementById('pubHashInputField').focus();return;}
  document.getElementById('pubFilePanel').classList.remove('active');
  document.getElementById('pubHashPanel').classList.remove('active');
  document.getElementById('pubResult').classList.remove('visible');
  const proc=document.getElementById('pubProcessing');proc.classList.add('visible');
  const steps=[DB.isConnected()?'Querying Firebase Firestore…':'Scanning in-memory DB…','Scanning 19,847,231 blocks…','Cross-referencing Merkle proofs…','Validating issuer signature…','Finalizing…'];
  let si=0;const stepEl=document.getElementById('pubProcStep');
  const itv=setInterval(()=>{if(si<steps.length)stepEl.textContent=steps[si++];},680);
  await sleep(3200);clearInterval(itv);proc.classList.remove('visible');

  const rec=await DB.findHash(hash);
  const found=!!rec;
  pubLastResult={hash,found,rec};
  const icon=document.getElementById('pubResultIcon'),verdict=document.getElementById('pubResultVerdict'),msg=document.getElementById('pubResultMsg'),body=document.getElementById('pubCertBody');
  if(found){
    icon.innerHTML=`<svg viewBox="0 0 76 76" fill="none"><circle cx="38" cy="38" r="36" fill="rgba(0,255,178,0.08)" stroke="#00FFB2" stroke-width="1.5"/><circle cx="38" cy="38" r="28" stroke="#00FFB2" stroke-width="1" stroke-dasharray="3 3" opacity="0.4"/><path d="M24 38l10 10 18-20" stroke="#00FFB2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    verdict.className='pub-result-verdict ok';verdict.textContent='✓  Document Authentic';
    msg.textContent='This document is anchored on the blockchain and has not been altered since issuance.';
    body.innerHTML=`<div class="pub-cert-row"><div class="pub-cert-key">Document</div><div class="pub-cert-val">${esc(rec.name)}</div></div><div class="pub-cert-row"><div class="pub-cert-key">Type</div><div class="pub-cert-val">${esc(rec.type||'—')}</div></div><div class="pub-cert-row"><div class="pub-cert-key">Issued To</div><div class="pub-cert-val" style="font-weight:700">${esc(rec.recipient||'—')}</div></div><div class="pub-cert-row"><div class="pub-cert-key">Issued By</div><div class="pub-cert-val blue">${esc(rec.institute)}</div></div><div class="pub-cert-row"><div class="pub-cert-key">SHA-256</div><div class="pub-cert-val green">${esc(hash.slice(0,36))}…</div></div><div class="pub-cert-row"><div class="pub-cert-key">Anchored</div><div class="pub-cert-val">${rec.submitted} UTC</div></div><div class="pub-cert-row"><div class="pub-cert-key">Block</div><div class="pub-cert-val blue">${rec.block?'#'+rec.block:'Confirmed'}</div></div><div class="pub-cert-row"><div class="pub-cert-key">Integrity</div><div class="pub-cert-val green">✓ INTACT</div></div>`;
  } else {
    icon.innerHTML=`<svg viewBox="0 0 76 76" fill="none"><circle cx="38" cy="38" r="36" fill="rgba(239,68,68,0.08)" stroke="#EF4444" stroke-width="1.5"/><circle cx="38" cy="38" r="28" stroke="#EF4444" stroke-width="1" stroke-dasharray="3 3" opacity="0.3"/><path d="M26 26l24 24M50 26L26 50" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"/></svg>`;
    verdict.className='pub-result-verdict fail';verdict.textContent='✗  Not Verified';
    msg.textContent='No matching record found. This document may be unregistered or tampered.';
    body.innerHTML=`<div class="pub-cert-row"><div class="pub-cert-key">Hash</div><div class="pub-cert-val red">${esc(hash.slice(0,36))}…</div></div><div class="pub-cert-row"><div class="pub-cert-key">Result</div><div class="pub-cert-val red">✗ No record found</div></div><div class="pub-cert-row"><div class="pub-cert-key">Blocks Scanned</div><div class="pub-cert-val">19,847,231</div></div>`;
  }
  document.getElementById('pubResult').classList.add('visible');
}
function pubReset(){pubFileHash='';pubLastResult=null;initPublicPage();}
function pubShare(){
  if(!pubLastResult)return;
  const{hash,found,rec}=pubLastResult;
  const text=found?`✓ VERIFIED on ChainVerify\nDocument: ${rec.name}\nIssued to: ${rec.recipient}\nIssued by: ${rec.institute}\nAnchored: ${rec.submitted} UTC\nHash: ${hash}`:`✗ NOT VERIFIED on ChainVerify\nHash: ${hash}\nNo record found.`;
  navigator.clipboard.writeText(text).catch(()=>{});showToast('Result copied');
}

// ── Utils ─────────────────────────────────────────────────────────────────────
async function hashFile(file){const buf=await file.arrayBuffer();const h=await crypto.subtle.digest('SHA-256',buf);return '0x'+Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function showToast(msg,type='ok'){const t=document.getElementById('toast');document.getElementById('toastMsg').textContent=msg;t.className='toast '+type+' show';setTimeout(()=>t.classList.remove('show'),3200);}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function normalizeHash(v){let h=String(v||'').trim().toLowerCase();if(h&&!h.startsWith('0x'))h='0x'+h;return h;}
