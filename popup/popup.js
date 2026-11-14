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

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function createSvgElement(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
      }
    }
    return el;
  }

  function createMoonSvg() {
    const svg = createSvgElement('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    });
    const path = createSvgElement('path', {
      d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'
    });
    svg.appendChild(path);
    return svg;
  }

  function createSunSvg() {
    const svg = createSvgElement('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    });
    const circle = createSvgElement('circle', {
      cx: '12',
      cy: '12',
      r: '5'
    });
    svg.appendChild(circle);

    const lines = [
      [12, 1, 12, 3],
      [12, 21, 12, 23],
      [4.22, 4.22, 5.64, 5.64],
      [18.36, 18.36, 19.78, 19.78],
      [1, 12, 3, 12],
      [21, 12, 23, 12],
      [4.22, 19.78, 5.64, 18.36],
      [18.36, 5.64, 19.78, 4.22]
    ];
    for (const [x1, y1, x2, y2] of lines) {
      const line = createSvgElement('line', {
        x1: x1.toString(),
        y1: y1.toString(),
        x2: x2.toString(),
        y2: y2.toString()
      });
      svg.appendChild(line);
    }
    return svg;
  }

  function setHeroIcon(isDark) {
    while (heroIcon.firstChild) {
      heroIcon.removeChild(heroIcon.firstChild);
    }
    heroIcon.appendChild(isDark ? createMoonSvg() : createSunSvg());
  }

  // 2. UI-Status rendern
  function renderStatus(isEnabled) {
    if (isEnabled) {
      statusIndicator.classList.remove('is-disabled');
      statusIndicatorText.textContent = 'Aktiv';
      heroTitle.textContent = 'Dark Mode ist AKTIV';
      heroSubtitle.textContent = 'Augen schonen beim Stöbern & Kaufen';
      heroIcon.style.color = '#09b1ba';
      heroIcon.style.background = 'rgba(9, 177, 186, 0.15)';
      setHeroIcon(true);
    } else {
      statusIndicator.classList.add('is-disabled');
      statusIndicatorText.textContent = 'Deaktiv';
      heroTitle.textContent = 'Dark Mode ist AUS';
      heroSubtitle.textContent = 'Standard-Helles Design aktiv';
      heroIcon.style.color = '#f59e0b';
      heroIcon.style.background = 'rgba(245, 158, 11, 0.15)';
      setHeroIcon(false);
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
