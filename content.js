// ==========================================================================
// Vinted Dark Mode — Content Script
// Läuft ab document_start, um White Flash (FOUC) zu verhindern.
// Bindet den Schalter fest in den Vinted-Header ein (vor der Hilfe / links neben Sprachauswahl).
// ==========================================================================

(() => {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  const STORAGE_KEYS = {
    enabled: true,
    showHeaderSwitch: true,
    showLabel: false
  };

  const html = document.documentElement;
  let state = {
    enabled: true,
    showHeaderSwitch: true,
    showLabel: false
  };

  let setByUs = false;
  let shadowRoot = null;
  let switchHost = null;
  let isInjecting = false;

  // 1. Sofortiges Aktivieren des Dark Modes beim Laden der Seite (vor dem Rendern)
  const applyTheme = (enabled) => {
    if (enabled) {
      if (html.getAttribute('data-theme') !== 'dark') {
        html.setAttribute('data-theme', 'dark');
        setByUs = true;
      }
      html.setAttribute('data-vinted-dark', 'true');
    } else {
      if (setByUs && html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        setByUs = false;
      }
      html.removeAttribute('data-vinted-dark');
    }
  };

  // Vorab standardmäßig Dark Mode aktivieren, um Blitz-Effekt zu verhindern
  applyTheme(true);

  // 2. Einstellungen aus dem Browser-Speicher lesen
  browserAPI.storage.local.get(STORAGE_KEYS, (stored) => {
    state.enabled = stored.enabled !== false;
    state.showHeaderSwitch = stored.showHeaderSwitch !== false;
    state.showLabel = !!stored.showLabel;

    applyTheme(state.enabled);
    updateSwitchVisuals();
    if (state.showHeaderSwitch) {
      injectHeaderSwitch();
    } else if (switchHost) {
      switchHost.style.display = 'none';
    }
  });

  // 3. Auf Änderungen im Speicher lauschen (z. B. aus Toolbar-Popup oder Shortcut)
  browserAPI.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.enabled !== undefined) {
      state.enabled = changes.enabled.newValue !== false;
      applyTheme(state.enabled);
      updateSwitchVisuals();
    }
    if (changes.showHeaderSwitch !== undefined) {
      state.showHeaderSwitch = changes.showHeaderSwitch.newValue !== false;
      if (switchHost) {
        switchHost.style.display = state.showHeaderSwitch ? 'inline-flex' : 'none';
      }
      if (state.showHeaderSwitch) {
        injectHeaderSwitch();
      }
    }
    if (changes.showLabel !== undefined) {
      state.showLabel = !!changes.showLabel.newValue;
      updateSwitchVisuals();
    }
  });

  // 4. SPA & MutationObserver: Vinted hydriert React dynamisch
  // Falls das Theme-Attribut überschrieben wird, stellen wir es sofort wieder her.
  const themeObserver = new MutationObserver(() => {
    if (state.enabled && html.getAttribute('data-theme') !== 'dark') {
      applyTheme(true);
    }
  });
  themeObserver.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

  // 5. Hilfe-Button und Sprachauswahl im Vinted-Header finden
  function findHelpButton() {
    const header = document.querySelector('header');
    if (!header) return null;

    // Suche gezielt nach dem Hilfe-Link im Header (funktioniert über alle Sprachen)
    const helpLink = header.querySelector('a[href*="/help"]') ||
                     header.querySelector('a[aria-label*="Hilfe"], a[aria-label*="Help"], a[aria-label*="Aide"], a[aria-label*="Ayuda"], a[aria-label*="Aiuto"], a[aria-label*="Pomoc"]');
    if (helpLink) return helpLink;

    return null;
  }

  function findLanguageDropdown() {
    const header = document.querySelector('header');
    if (!header) return null;

    // Sprachauswahl ist das Dropdown-Element direkt im Desktop-Aktionsbereich
    return header.querySelector('.u-desktops-only button[aria-expanded]') ||
           header.querySelector('.u-desktops-only [class*="language"]') ||
           header.querySelector('button[aria-label*="Sprache"], button[aria-label*="Language"]');
  }

  function findDesktopActionsContainer() {
    const header = document.querySelector('header');
    if (!header) return null;

    return header.querySelector('.u-desktops-only.u-flexbox.u-align-items-center') ||
           header.querySelector('.u-desktops-only.u-flexbox') ||
           header.querySelector('.u-desktops-only') ||
           header.querySelector('.u-flexbox.u-margin-left-auto.u-align-items-center') ||
           header.querySelector('.u-flexbox.u-align-items-center');
  }

  // 6. Header-Schalter erstellen
  function initSwitchHost() {
    if (switchHost) return switchHost;

    switchHost = document.createElement('div');
    switchHost.id = 'vinted-darkmode-header-switch';
    switchHost.style.cssText = `
      display: ${state.showHeaderSwitch ? 'inline-flex' : 'none'};
      align-items: center;
      margin: 0 6px;
      vertical-align: middle;
      user-select: none;
      -webkit-user-select: none;
      flex-shrink: 0;
    `;

    shadowRoot = switchHost.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      :host {
        display: inline-flex;
        align-items: center;
      }

      /* Haupt-Pill-Button */
      .vds-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 3px 8px 3px 6px;
        border-radius: 9999px;
        cursor: pointer;
        outline: none;
        border: 1px solid transparent;
        background: transparent;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 11.5px;
        font-weight: 600;
        transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
      }

      .vds-pill:focus-visible {
        outline: 2px solid #09b1ba;
        outline-offset: 1px;
      }

      .vds-pill:active {
        transform: scale(0.97);
      }

      /* Dark Mode Styling */
      .vds-pill.is-dark {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.14);
        color: #f3f4f6;
      }
      .vds-pill.is-dark:hover {
        background: rgba(255, 255, 255, 0.13);
        border-color: rgba(9, 177, 186, 0.45);
        box-shadow: 0 0 10px rgba(9, 177, 186, 0.18);
      }

      /* Light Mode Styling */
      .vds-pill.is-light {
        background: rgba(0, 0, 0, 0.04);
        border-color: rgba(0, 0, 0, 0.12);
        color: #1f2937;
      }
      .vds-pill.is-light:hover {
        background: rgba(0, 0, 0, 0.08);
        border-color: rgba(0, 0, 0, 0.22);
      }

      /* Mond- & Sonnen-Icons */
      .vds-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .is-dark .vds-icon-wrapper {
        transform: rotate(0deg);
      }
      .is-light .vds-icon-wrapper {
        transform: rotate(360deg);
      }

      .vds-icon-wrapper svg {
        width: 15px;
        height: 15px;
        display: block;
      }

      /* Optionaler Text */
      .vds-label {
        letter-spacing: -0.1px;
        display: none;
      }
      .vds-label.show {
        display: inline-block;
      }

      /* Mini Slider Track & Thumb */
      .vds-slider-track {
        position: relative;
        width: 28px;
        height: 16px;
        border-radius: 8px;
        transition: background-color 0.25s ease;
      }

      .is-dark .vds-slider-track {
        background-color: #09b1ba;
      }
      .is-light .vds-slider-track {
        background-color: #cbd5e1;
      }

      .vds-slider-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #ffffff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .is-dark .vds-slider-thumb {
        transform: translateX(12px);
      }
      .is-light .vds-slider-thumb {
        transform: translateX(0);
      }
    `;

    shadowRoot.appendChild(style);

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'vdsPill';
    button.className = `vds-pill ${state.enabled ? 'is-dark' : 'is-light'}`;
    button.setAttribute('role', 'switch');
    button.setAttribute('aria-checked', state.enabled.toString());
    button.title = state.enabled
      ? 'Vinted Dark Mode: Aktiviert (Klick zum Umschalten)'
      : 'Vinted Dark Mode: Deaktiviert (Klick zum Umschalten)';

    button.innerHTML = `
      <span class="vds-icon-wrapper" id="vdsIconWrapper">
        ${renderIcon(state.enabled)}
      </span>
      <span class="vds-label ${state.showLabel ? 'show' : ''}" id="vdsLabel">
        ${state.enabled ? 'Dark' : 'Light'}
      </span>
      <span class="vds-slider-track">
        <span class="vds-slider-thumb"></span>
      </span>
    `;

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const next = !state.enabled;
      state.enabled = next;
      applyTheme(next);
      updateSwitchVisuals();
      browserAPI.storage.local.set({ enabled: next });
    });

    shadowRoot.appendChild(button);
    return switchHost;
  }

  function renderIcon(isDark) {
    if (isDark) {
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    } else {
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    }
  }

  function updateSwitchVisuals() {
    if (!shadowRoot) return;

    const button = shadowRoot.getElementById('vdsPill');
    const iconWrapper = shadowRoot.getElementById('vdsIconWrapper');
    const label = shadowRoot.getElementById('vdsLabel');

    if (button) {
      button.className = `vds-pill ${state.enabled ? 'is-dark' : 'is-light'}`;
      button.setAttribute('aria-checked', state.enabled.toString());
      button.title = state.enabled
        ? 'Vinted Dark Mode: Aktiviert (Klick zum Umschalten)'
        : 'Vinted Dark Mode: Deaktiviert (Klick zum Umschalten)';
    }

    if (iconWrapper) {
      iconWrapper.innerHTML = renderIcon(state.enabled);
    }

    if (label) {
      label.textContent = state.enabled ? 'Dark' : 'Light';
      label.classList.toggle('show', state.showLabel);
    }
  }

  // 7. Schalter im Header einbinden (links neben Sprachauswahl, vor der Hilfe)
  function injectHeaderSwitch() {
    if (!state.showHeaderSwitch) return;
    if (isInjecting) return;

    const host = initSwitchHost();

    // Falls der Schalter bereits korrekt im Dokument eingehängt ist
    const helpBtn = findHelpButton();
    if (host.isConnected) {
      if (helpBtn && host.nextElementSibling === helpBtn) {
        return; // Steht bereits exakt vor dem Hilfe-Button
      }
    }

    isInjecting = true;
    try {
      if (helpBtn && helpBtn.parentNode) {
        // Exakt VOR dem Hilfe-Button einfügen
        helpBtn.parentNode.insertBefore(host, helpBtn);
      } else {
        // Fallback: Vor der Sprachauswahl einfügen
        const langDropdown = findLanguageDropdown();
        if (langDropdown && langDropdown.parentNode) {
          langDropdown.parentNode.insertBefore(host, langDropdown);
        } else {
          // Fallback: In den Desktop-Aktionen Container
          const container = findDesktopActionsContainer();
          if (container) {
            container.appendChild(host);
          }
        }
      }
    } finally {
      isInjecting = false;
    }
  }

  // 8. DOM-Überwachung für SPA-Seitenwechsel & React Hydration
  let scheduledCheck = null;
  const domObserver = new MutationObserver(() => {
    if (!state.showHeaderSwitch) return;

    // Nur prüfen, wenn der Schalter nicht mehr verbunden ist oder fehlt
    if (!switchHost || !switchHost.isConnected) {
      if (!scheduledCheck) {
        scheduledCheck = requestAnimationFrame(() => {
          scheduledCheck = null;
          injectHeaderSwitch();
        });
      }
    }
  });

  // Beobachte Änderungen im Body
  const startObserving = () => {
    if (document.body) {
      domObserver.observe(document.body, { childList: true, subtree: true });
      injectHeaderSwitch();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      startObserving();
    });
  } else {
    startObserving();
  }

  // Zusätzliche Absicherung bei Navigation
  window.addEventListener('load', injectHeaderSwitch);
  window.addEventListener('popstate', () => setTimeout(injectHeaderSwitch, 50));
})();
