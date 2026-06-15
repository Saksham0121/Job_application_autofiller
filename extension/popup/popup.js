// Extension Popup Script

const API_BASE = 'http://localhost:5000';

const $ = id => document.getElementById(id);

// Show only one state
function showState(stateId) {
  ['loading-state', 'logged-out-state', 'logged-in-state'].forEach(id => {
    const el = $(id);
    if (el) el.classList.toggle('hidden', id !== stateId);
  });
}

// Init
async function init() {
  showState('loading-state');

  const token = await getToken();
  if (!token) {
    showState('logged-out-state');
    return;
  }

  // Verify token
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Unauthorized');
    const { user } = await res.json();
    renderLoggedIn(user);
  } catch {
    await chrome.storage.local.remove(['token', 'user']);
    showState('logged-out-state');
  }
}

async function getToken() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_TOKEN' }, res => resolve(res?.token || null));
  });
}

function renderLoggedIn(user) {
  showState('logged-in-state');

  // User info
  const name = user.name || user.email.split('@')[0];
  $('user-name').textContent = name;
  $('user-email').textContent = user.email;
  $('user-avatar').textContent = name.charAt(0).toUpperCase();

  // Detect portal from active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url || '';
    const portal = detectPortalFromUrl(url);
    updatePortalBadge(portal);

    // Count fields
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => window.__jobAutofiller?.fields?.length || 0
    }, (results) => {
      const count = results?.[0]?.result || 0;
      $('stat-fields').textContent = count;
    });
  });

  // Load app count
  loadStats(user);
}

async function loadStats(user) {
  const token = await getToken();
  try {
    const res = await fetch(`${API_BASE}/api/applications/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const { total } = await res.json();
      $('stat-apps').textContent = total || 0;
    }
  } catch { /* non-critical */ }
}

function detectPortalFromUrl(url) {
  const portals = {
    greenhouse: 'Greenhouse',
    lever: 'Lever',
    ashby: 'Ashby',
    workday: 'Workday',
    smartrecruiters: 'SmartRecruiters',
    taleo: 'Taleo',
    icims: 'iCIMS',
    linkedin: 'LinkedIn',
    indeed: 'Indeed',
    bamboohr: 'BambooHR',
    jobvite: 'Jobvite'
  };
  for (const [key, name] of Object.entries(portals)) {
    if (url.includes(key)) return name;
  }
  return null;
}

function updatePortalBadge(portal) {
  const card = $('portal-card');
  const label = $('portal-label');
  if (portal) {
    label.textContent = `Detected: ${portal}`;
    card.classList.remove('unknown');
  } else {
    label.textContent = 'No job portal detected';
    card.classList.add('unknown');
  }
}

// Autofill button
$('autofill-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  $('autofill-btn').textContent = '⏳ Opening Panel...';
  $('autofill-btn').disabled = true;

  chrome.tabs.sendMessage(tab.id, { type: 'OPEN_REVIEW_PANEL' }, () => {
    window.close(); // Close popup after triggering panel
  });
});

// Logout
$('logout-btn').addEventListener('click', async () => {
  await chrome.storage.local.remove(['token', 'user']);
  showState('logged-out-state');
});

// Dashboard link
$('open-dashboard-btn')?.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000' });
});

$('dashboard-link').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
});

$('profile-link').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard/profile' });
});

// Run
init();
