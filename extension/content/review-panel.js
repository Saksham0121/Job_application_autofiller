// Content Script: Review Panel UI
// Injects a floating sidebar showing all fields that will be filled, for user review before autofill

(function () {
  'use strict';

  let panel = null;
  let currentMappings = [];
  let currentFields = [];

  function createPanel() {
    if (document.getElementById('job-autofiller-panel')) return;

    panel = document.createElement('div');
    panel.id = 'job-autofiller-panel';
    panel.innerHTML = `
      <div id="jaf-header">
        <div id="jaf-logo">⚡</div>
        <div id="jaf-title-block">
          <p id="jaf-title">Job Autofiller</p>
          <p id="jaf-subtitle">AI-Powered Form Assistant</p>
        </div>
        <button id="jaf-close" title="Close">✕</button>
      </div>
      <div id="jaf-portal-badge">
        <div id="jaf-portal-dot"></div>
        <span id="jaf-portal-name">Detected: ${window.__jobAutofiller?.portal || 'Job Portal'}</span>
      </div>
      <div id="jaf-body">
        <div id="jaf-loading">
          <div class="jaf-spinner"></div>
          <p>Analyzing form fields with AI...</p>
        </div>
      </div>
      <div id="jaf-footer">
        <button class="jaf-btn jaf-btn-primary" id="jaf-fill-btn" style="display:none">⚡ Fill All Fields</button>
        <button class="jaf-btn jaf-btn-secondary" id="jaf-cancel-btn">Cancel</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Events
    document.getElementById('jaf-close').addEventListener('click', closePanel);
    document.getElementById('jaf-cancel-btn').addEventListener('click', closePanel);
    document.getElementById('jaf-fill-btn').addEventListener('click', doAutofill);

    // Animate in
    requestAnimationFrame(() => panel.classList.add('open'));
  }

  function closePanel() {
    if (panel) {
      panel.classList.remove('open');
      setTimeout(() => { panel?.remove(); panel = null; }, 350);
    }
  }

  function renderNotLoggedIn() {
    const body = document.getElementById('jaf-body');
    if (!body) return;
    body.innerHTML = `
      <div id="jaf-not-logged-in">
        <div class="jaf-icon">🔒</div>
        <h3>Sign In Required</h3>
        <p>Please sign in to your Job Autofiller account to use autofill.</p>
        <button class="jaf-btn jaf-btn-primary" onclick="window.open('http://localhost:3000', '_blank')" style="margin-top:8px">Open Dashboard →</button>
      </div>
    `;
  }

  function renderMappings(mappings, fields) {
    currentMappings = mappings;
    currentFields = fields;

    const body = document.getElementById('jaf-body');
    const fillBtn = document.getElementById('jaf-fill-btn');
    if (!body) return;

    const filled = mappings.filter(m => m.value).length;
    const empty = mappings.filter(m => !m.value).length;
    const total = mappings.length;

    body.innerHTML = `
      <div class="jaf-stats-row">
        <div class="jaf-stat">
          <div class="jaf-stat-num">${total}</div>
          <div class="jaf-stat-label">Fields Found</div>
        </div>
        <div class="jaf-stat">
          <div class="jaf-stat-num" style="color:#10b981">${filled}</div>
          <div class="jaf-stat-label">Ready to Fill</div>
        </div>
        <div class="jaf-stat">
          <div class="jaf-stat-num" style="color:#f59e0b">${empty}</div>
          <div class="jaf-stat-label">Missing Data</div>
        </div>
      </div>
      <div class="jaf-section-title">Review & Edit Before Filling</div>
      ${mappings.map((m, i) => {
        const field = fields.find(f => f.id === m.fieldId);
        const label = field?.label || field?.placeholder || field?.name || m.fieldId;
        const statusClass = m.value ? 'jaf-status-filled' : 'jaf-status-empty';
        return `
          <div class="jaf-field-row">
            <div class="jaf-field-label">${label}</div>
            <div class="jaf-field-value">
              <span class="jaf-status-dot ${statusClass}"></span>
              <input type="text" data-index="${i}" value="${(m.value || '').replace(/"/g, '&quot;')}" placeholder="No data found" />
            </div>
          </div>
        `;
      }).join('')}
    `;

    // Sync edits back to mappings
    body.querySelectorAll('input[data-index]').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        currentMappings[idx].value = e.target.value;
      });
    });

    if (fillBtn) fillBtn.style.display = 'block';
  }

  async function doAutofill() {
    const fillBtn = document.getElementById('jaf-fill-btn');
    if (fillBtn) { fillBtn.disabled = true; fillBtn.textContent = '⏳ Filling...'; }

    const results = await window.__jobAutofiller.autofill(currentMappings, currentFields);

    // Show results
    const filledCount = results.filter(r => r.status === 'filled').length;
    const body = document.getElementById('jaf-body');
    if (body) {
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:12px">
          <div style="font-size:48px">✅</div>
          <h3 style="font-size:16px;font-weight:700;color:#fff;margin:0">${filledCount} Fields Filled!</h3>
          <p style="font-size:13px;color:#64748b;margin:0;text-align:center">Review the form before submitting.<br>Only you control the final submission.</p>
        </div>
        <div class="jaf-section-title">Filled Fields</div>
        ${results.filter(r => r.status === 'filled').map(r => `
          <div class="jaf-field-row">
            <div class="jaf-field-label">${r.label}</div>
            <div class="jaf-field-value"><span class="jaf-status-dot jaf-status-filled"></span>${r.value}</div>
          </div>
        `).join('')}
      `;
    }

    if (fillBtn) { fillBtn.textContent = '✅ Done! Review & Submit Manually'; fillBtn.disabled = false; }

    // Save application to backend
    const portal = window.__jobAutofiller?.portal;
    chrome.runtime.sendMessage({
      type: 'SAVE_APPLICATION',
      application: {
        company: document.title.split(' - ')[1] || document.title,
        role: document.title.split(' - ')[0] || 'Unknown Role',
        jobUrl: window.location.href,
        portal,
        status: 'applied'
      }
    });
  }

  // Listen for trigger from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_REVIEW_PANEL') {
      openPanel();
    }
  });

  async function openPanel() {
    createPanel();

    // Check auth
    const { token } = await new Promise(resolve =>
      chrome.runtime.sendMessage({ type: 'GET_AUTH_TOKEN' }, resolve)
    );

    if (!token) {
      renderNotLoggedIn();
      return;
    }

    // Get fields
    const fields = window.__jobAutofiller?.collectFields() || [];
    if (fields.length === 0) {
      const body = document.getElementById('jaf-body');
      if (body) body.innerHTML = `<div style="padding:20px;text-align:center;color:#64748b">No form fields detected on this page.</div>`;
      return;
    }

    // Classify fields with AI
    const serializedFields = fields.map(({ _element, ...f }) => f); // strip DOM refs
    const { mappings, error } = await new Promise(resolve =>
      chrome.runtime.sendMessage({ type: 'CLASSIFY_FIELDS', fields: serializedFields }, resolve)
    );

    if (error || !mappings) {
      const body = document.getElementById('jaf-body');
      if (body) body.innerHTML = `<div style="padding:20px;text-align:center;color:#ef4444">Failed to classify fields: ${error || 'Unknown error'}</div>`;
      return;
    }

    renderMappings(mappings, fields);
  }

  // Expose to popup trigger
  window.__jobAutofiller = window.__jobAutofiller || {};
  window.__jobAutofiller.openPanel = openPanel;
})();
