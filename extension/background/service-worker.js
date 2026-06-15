// Background Service Worker — handles auth token storage & API communication

const API_BASE = 'http://localhost:5000';

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep channel open for async responses
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case 'GET_AUTH_TOKEN':
        const { token } = await chrome.storage.local.get('token');
        sendResponse({ token: token || null });
        break;

      case 'SET_AUTH_TOKEN':
        await chrome.storage.local.set({ token: message.token });
        sendResponse({ success: true });
        break;

      case 'CLEAR_AUTH_TOKEN':
        await chrome.storage.local.remove(['token', 'user']);
        sendResponse({ success: true });
        break;

      case 'GET_AUTOFILL_DATA':
        const autofillData = await fetchAutofillData();
        sendResponse({ data: autofillData });
        break;

      case 'CLASSIFY_FIELDS':
        const mappings = await classifyFields(message.fields);
        sendResponse({ mappings });
        break;

      case 'SAVE_APPLICATION':
        const app = await saveApplication(message.application);
        sendResponse({ application: app });
        break;

      case 'GET_USER':
        const { user } = await chrome.storage.local.get('user');
        sendResponse({ user: user || null });
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (err) {
    console.error('Service worker error:', err);
    sendResponse({ error: err.message });
  }
}

async function getToken() {
  const { token } = await chrome.storage.local.get('token');
  return token;
}

async function fetchAutofillData() {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/api/profile/autofill`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('Failed to fetch profile');
  const { autofillData } = await response.json();
  return autofillData;
}

async function classifyFields(fields) {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/api/ai/classify-fields`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  if (!response.ok) throw new Error('Field classification failed');
  const { mappings } = await response.json();
  return mappings;
}

async function saveApplication(applicationData) {
  const token = await getToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE}/api/applications`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(applicationData)
  });

  if (!response.ok) return null;
  const { application } = await response.json();
  return application;
}

// On install, open dashboard
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  }
});
