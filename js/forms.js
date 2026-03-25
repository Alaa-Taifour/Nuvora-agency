/* ============================================================
   NUVORA — FORMS
   Contact form → Supabase database → HubSpot notification
   ============================================================ */

(function () {
  'use strict';

  // ─── Wait for DOM ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', initForms);

  function initForms() {
    const submitBtn = document.querySelector('.btn-submit');
    if (!submitBtn) return;
    submitBtn.addEventListener('click', handleFormSubmit);

    // Real-time validation feedback
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearError(input));
    });
  }

  // ─── Validation ───────────────────────────────────────────
  function validateField(field) {
    const name = field.getAttribute('name');
    const value = field.value.trim();

    clearError(field);

    if (field.required && !value) {
      showError(field, 'This field is required');
      return false;
    }
    if (name === 'email' && value && !isValidEmail(value)) {
      showError(field, 'Please enter a valid email address');
      return false;
    }
    return true;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(field, message) {
    field.style.borderColor = '#ff4444';
    let errEl = field.parentNode.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'field-error';
      errEl.style.cssText = 'color:#ff4444;font-size:0.7rem;margin-top:0.3rem;font-family:var(--font-mono);letter-spacing:0.1em;';
      field.parentNode.appendChild(errEl);
    }
    errEl.textContent = message;
  }

  function clearError(field) {
    field.style.borderColor = '';
    const errEl = field.parentNode.querySelector('.field-error');
    if (errEl) errEl.remove();
  }

  // ─── Get active CTA choice ────────────────────────────────
  function getActiveCTA() {
    const active = document.querySelector('.cta-choice.active');
    return active ? active.textContent.trim() : 'WhatsApp Chat';
  }

  // ─── Collect form data ────────────────────────────────────
  function collectFormData() {
    return {
      first_name: document.querySelector('input[name="first-name"]')?.value.trim() || '',
      last_name: document.querySelector('input[name="last-name"]')?.value.trim() || '',
      email: document.querySelector('input[name="email"]')?.value.trim() || '',
      whatsapp: document.querySelector('input[name="whatsapp"]')?.value.trim() || '',
      service: document.querySelector('select[name="service"]')?.value || '',
      contact_method: getActiveCTA(),
      message: document.querySelector('textarea[name="message"]')?.value.trim() || '',
      status: 'new',
      source: 'website'
    };
  }

  // ─── Validate all required fields ─────────────────────────
  function validateForm(data) {
    const errors = [];
    if (!data.first_name) errors.push('First name is required');
    if (!data.last_name) errors.push('Last name is required');
    if (!data.email) errors.push('Email is required');
    if (data.email && !isValidEmail(data.email)) errors.push('Invalid email address');
    if (!data.message) errors.push('Please describe your project');
    return errors;
  }

  // ─── Button state helpers ─────────────────────────────────
  function setSubmitState(btn, state) {
    const inner = btn.querySelector('.btn-submit-inner');
    const arrowSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
    const checkSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
    const spinnerSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

    const states = {
      default: { html: `<span>Send Message — Let's Build Together</span>${arrowSvg}`, bg: '', disabled: false },
      loading: { html: `${spinnerSvg}<span>Sending...</span>`, bg: 'rgba(255,255,255,0.05)', disabled: true },
      success: { html: `${checkSvg}<span>Message Sent! We'll be in touch soon 🚀</span>`, bg: 'rgba(0,212,255,0.1)', disabled: true },
      error: { html: `<span>Something went wrong — try WhatsApp instead</span>${arrowSvg}`, bg: 'rgba(255,68,68,0.1)', disabled: false }
    };

    const s = states[state] || states.default;
    if (inner) inner.innerHTML = s.html;
    btn.disabled = s.disabled;
    if (s.bg) {
      btn.style.background = s.bg;
      btn.style.border = `1px solid ${state === 'success' ? 'var(--cyan)' : state === 'error' ? '#ff4444' : 'transparent'}`;
      btn.style.color = state === 'success' ? 'var(--cyan)' : state === 'error' ? '#ff4444' : 'var(--white)';
      btn.style.boxShadow = 'none';
    } else {
      btn.style.cssText = '';
    }
  }

  // ─── Main submit handler ──────────────────────────────────
  async function handleFormSubmit() {
    const btn = document.querySelector('.btn-submit');
    if (!btn || btn.disabled) return;

    const data = collectFormData();
    const errors = validateForm(data);

    if (errors.length > 0) {
      // Highlight first error field
      const firstErrorField = document.querySelector('input[required]:placeholder-shown, select[required] option:first-child:checked, textarea[required]:placeholder-shown');
      if (firstErrorField) firstErrorField.focus();
      showToast(errors[0], 'error');
      return;
    }

    setSubmitState(btn, 'loading');

    try {
      // 1. Save to Supabase
      const { data: saved, error } = await supabase.insert('contacts', data);

      if (error) throw error;

      // 2. Show success
      setSubmitState(btn, 'success');
      showToast('Message received! We\'ll contact you within 24 hours.', 'success');

      // 3. Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
        setSubmitState(btn, 'default');
      }, 4000);

    } catch (err) {
      console.error('Form submission error:', err);
      setSubmitState(btn, 'error');
      showToast('Submission failed. Please contact us on WhatsApp directly.', 'error');

      // Reset button after 5 seconds
      setTimeout(() => setSubmitState(btn, 'default'), 5000);
    }
  }

  // ─── Reset form fields ────────────────────────────────────
  function resetForm() {
    document.querySelectorAll('.form-input, .form-textarea').forEach(el => el.value = '');
    const select = document.querySelector('.form-select');
    if (select) select.selectedIndex = 0;
    document.querySelectorAll('.cta-choice').forEach((btn, i) => {
      btn.classList.toggle('active', i === 0);
    });
    document.querySelectorAll('.field-error').forEach(el => el.remove());
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
      el.style.borderColor = '';
    });
  }

  // ─── Toast notification ───────────────────────────────────
  function showToast(message, type = 'success') {
    // Remove existing toast
    document.querySelector('.nuvora-toast')?.remove();

    const toast = document.createElement('div');
    toast.className = 'nuvora-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem; right: 2rem;
      z-index: 9999;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? 'rgba(0,212,255,0.1)' : 'rgba(255,68,68,0.1)'};
      border: 1px solid ${type === 'success' ? 'var(--cyan)' : '#ff4444'};
      color: ${type === 'success' ? 'var(--cyan)' : '#ff4444'};
      font-family: var(--font-mono);
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      max-width: 360px;
      backdrop-filter: blur(10px);
      animation: toastIn 0.4s ease forwards;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Inject keyframe if not present
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes toastIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

})();
