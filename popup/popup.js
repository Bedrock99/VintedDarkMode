// ==========================================================================
// Vinted Dark Mode — Popup Script
// Synchronisiert Einstellungen zwischen Toolbar-Popup und Browser-Speicher.
// ==========================================================================

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', () => {
  const mainToggle = document.getElementById('mainToggle');
  const headerSwitchToggle = document.getElementById('headerSwitchToggle');
  const labelToggle = document.getElementById('labelToggle');
  const openVintedBtn = document.getElementById('openVintedBtn');

  const heroIcon = document.getElementById('heroIcon');
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusIndicatorText = document.getElementById('statusIndicatorText');

  // 1. Gespeicherten Zustand laden
  browserAPI.storage.local.get({
    enabled: true,
    showHeaderSwitch: true,
    showLabel: false
  }, (data) => {
    mainToggle.checked = data.enabled !== false;
    headerSwitchToggle.checked = data.showHeaderSwitch !== false;
    labelToggle.checked = !!data.showLabel;
    renderStatus(mainToggle.checked);
  });

  // 2. UI-Status rendern
  function renderStatus(isEnabled) {
    if (isEnabled) {
      statusIndicator.classList.remove('is-disabled');
      statusIndicatorText.textContent = 'Aktiv';
      heroTitle.textContent = 'Dark Mode ist AKTIV';
      heroSubtitle.textContent = 'Augen schonen beim Stöbern & Kaufen';
      heroIcon.style.color = '#09b1ba';
      heroIcon.style.background = 'rgba(9, 177, 186, 0.15)';
      heroIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    } else {
      statusIndicator.classList.add('is-disabled');
      statusIndicatorText.textContent = 'Deaktiv';
      heroTitle.textContent = 'Dark Mode ist AUS';
      heroSubtitle.textContent = 'Standard-Helles Design aktiv';
      heroIcon.style.color = '#f59e0b';
      heroIcon.style.background = 'rgba(245, 158, 11, 0.15)';
      heroIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

  // 3. Event-Listener für Einstellungen
  mainToggle.addEventListener('change', () => {
    const isEnabled = mainToggle.checked;
    renderStatus(isEnabled);
    browserAPI.storage.local.set({ enabled: isEnabled });
  });

  headerSwitchToggle.addEventListener('change', () => {
    browserAPI.storage.local.set({ showHeaderSwitch: headerSwitchToggle.checked });
  });

  labelToggle.addEventListener('change', () => {
    browserAPI.storage.local.set({ showLabel: labelToggle.checked });
  });

  // Vinted Button
  openVintedBtn.addEventListener('click', () => {
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url && currentTab.url.includes('vinted.')) {
        window.close();
      } else {
        browserAPI.tabs.create({ url: 'https://www.vinted.de' });
        window.close();
      }
    });
  });

  // 4. Speicher-Änderungen live reflektieren (falls während Popup offen auf der Seite geklickt wird)
  browserAPI.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.enabled !== undefined) {
      mainToggle.checked = changes.enabled.newValue !== false;
      renderStatus(mainToggle.checked);
    }
    if (changes.showHeaderSwitch !== undefined) {
      headerSwitchToggle.checked = changes.showHeaderSwitch.newValue !== false;
    }
    if (changes.showLabel !== undefined) {
      labelToggle.checked = !!changes.showLabel.newValue;
    }
  });
});
