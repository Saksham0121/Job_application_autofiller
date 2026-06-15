// Content Script: Autofill Engine
// Fills detected form fields with user profile data

(function () {
  'use strict';

  // Simulate human-like typing into an input
  function simulateInput(element, value) {
    if (!value && value !== 0) return;
    element.focus();

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
      'value'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  }

  // Fill a SELECT element with best matching option
  function fillSelect(element, value) {
    if (!value) return;
    const options = Array.from(element.options);
    const valueLower = value.toLowerCase();

    // Try exact match first
    let match = options.find(o => o.value.toLowerCase() === valueLower || o.text.toLowerCase() === valueLower);
    // Try partial match
    if (!match) match = options.find(o => o.text.toLowerCase().includes(valueLower) || valueLower.includes(o.text.toLowerCase()));

    if (match) {
      element.value = match.value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Find element by field id (checks id, name attributes)
  function findElement(fieldId, elementId, fieldName) {
    return (
      document.getElementById(elementId) ||
      document.getElementById(fieldId) ||
      document.querySelector(`[name="${fieldName}"]`) ||
      document.querySelector(`[name="${fieldId}"]`)
    );
  }

  // Main autofill function — called with AI mappings
  async function autofill(mappings, fields) {
    const results = [];

    for (const mapping of mappings) {
      if (!mapping.value) continue;

      const field = fields.find(f => f.id === mapping.fieldId);
      if (!field) continue;

      const element = field._element || findElement(field.id, field.elementId, field.name);
      if (!element) continue;

      try {
        if (element.tagName === 'SELECT') {
          fillSelect(element, mapping.value);
        } else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
          simulateInput(element, mapping.value);
        }

        results.push({
          fieldId: mapping.fieldId,
          label: field.label || field.placeholder || field.name,
          value: mapping.value,
          profileKey: mapping.profileKey,
          status: 'filled'
        });

        // Small delay between fills for SPAs
        await new Promise(r => setTimeout(r, 50));
      } catch (err) {
        results.push({ fieldId: mapping.fieldId, status: 'error', error: err.message });
      }
    }

    return results;
  }

  // Expose autofill globally for review-panel.js
  window.__jobAutofiller = window.__jobAutofiller || {};
  window.__jobAutofiller.autofill = autofill;
  window.__jobAutofiller.findElement = findElement;

  // Listen for autofill trigger from popup or review panel
  window.addEventListener('__jobAutofiller_trigger', async (e) => {
    const { mappings, fields } = e.detail;
    const results = await autofill(mappings, fields);
    window.dispatchEvent(new CustomEvent('__jobAutofiller_done', { detail: { results } }));
  });
})();
