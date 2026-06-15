// Content Script: Form Field Detector
// Scans the page for job application form fields and sends them to the service worker

(function () {
  'use strict';

  // Detect which portal we're on
  function detectPortal() {
    const host = window.location.hostname;
    if (host.includes('greenhouse')) return 'greenhouse';
    if (host.includes('lever')) return 'lever';
    if (host.includes('ashby')) return 'ashby';
    if (host.includes('workday')) return 'workday';
    if (host.includes('smartrecruiters')) return 'smartrecruiters';
    if (host.includes('taleo')) return 'taleo';
    if (host.includes('icims')) return 'icims';
    if (host.includes('linkedin')) return 'linkedin';
    if (host.includes('indeed')) return 'indeed';
    return 'generic';
  }

  // Get visible label for a form element
  function getFieldLabel(element) {
    // Explicit label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.innerText.trim();
    }
    // Wrapping label
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.innerText.replace(element.value || '', '').trim();
    // aria-label
    if (element.getAttribute('aria-label')) return element.getAttribute('aria-label');
    // aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) return labelEl.innerText.trim();
    }
    // Preceding sibling text
    const prev = element.previousElementSibling;
    if (prev && prev.tagName !== 'INPUT') return prev.innerText?.trim() || '';
    return '';
  }

  // Collect all fillable fields on the page
  function collectFields() {
    const inputs = document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea, select'
    );

    const fields = [];
    let idx = 0;

    inputs.forEach((el) => {
      // Skip invisible elements
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const id = el.id || el.name || `field_${idx++}`;
      const field = {
        id,
        elementId: el.id,
        name: el.name || '',
        label: getFieldLabel(el),
        placeholder: el.placeholder || '',
        type: el.type || el.tagName.toLowerCase(),
        ariaLabel: el.getAttribute('aria-label') || '',
        required: el.required,
        tagName: el.tagName.toLowerCase(),
        // Options for selects
        options: el.tagName === 'SELECT'
          ? Array.from(el.options).map(o => ({ value: o.value, text: o.text }))
          : undefined,
        _element: el // internal reference
      };
      fields.push(field);
    });

    return fields;
  }

  // Store detected fields globally so autofill.js can use them
  window.__jobAutofiller = window.__jobAutofiller || {};
  window.__jobAutofiller.portal = detectPortal();
  window.__jobAutofiller.fields = collectFields();
  window.__jobAutofiller.collectFields = collectFields;

  console.log(`[Job Autofiller] Detected ${window.__jobAutofiller.fields.length} fields on ${window.__jobAutofiller.portal}`);

  // Re-collect on dynamic DOM changes (SPA portals)
  const observer = new MutationObserver(() => {
    const newFields = collectFields();
    if (newFields.length !== window.__jobAutofiller.fields.length) {
      window.__jobAutofiller.fields = newFields;
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
