// ==========================================================================
// Vinted Dark Mode — Background Script (Firefox WebExtension MV3)
// Verwaltet Tastenkürzel, Toolbar-Badge und initialen Status.
// ==========================================================================

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
const KEY_ENABLED = 'enabled';

// Aktualisiert Badge & Tooltip des Toolbar-Icons
const updateBadge = (enabled) => {
  const badgeText = enabled ? '' : 'OFF';
  const title = enabled
    ? 'Vinted Dark Mode: Aktiviert (Klick für Optionen)'
    : 'Vinted Dark Mode: Deaktiviert (Klick für Optionen)';

  if (browserAPI.action) {
    browserAPI.action.setBadgeText({ text: badgeText });
    browserAPI.action.setBadgeBackgroundColor({ color: '#5a6566' });
    browserAPI.action.setTitle({ title });
  }
};

// Liest den Status aus dem Speicher
const refreshState = () => {
  browserAPI.storage.local.get({ [KEY_ENABLED]: true }, (res) => {
    updateBadge(res[KEY_ENABLED] !== false);
  });
};

// Initialisierung beim Installieren / Starten
browserAPI.runtime.onInstalled.addListener(() => {
  refreshState();
});

browserAPI.runtime.onStartup.addListener(() => {
  refreshState();
});

// Tastenkombination (Alt + Shift + D) verarbeiten
browserAPI.commands.onCommand.addListener((command) => {
  if (command === 'toggle-dark-mode') {
    browserAPI.storage.local.get({ [KEY_ENABLED]: true }, (res) => {
      const current = res[KEY_ENABLED] !== false;
      const next = !current;
      browserAPI.storage.local.set({ [KEY_ENABLED]: next }, () => {
        updateBadge(next);
      });
    });
  }
});

// Bei Änderungen im Speicher Badge synchron halten
browserAPI.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[KEY_ENABLED]) {
    updateBadge(changes[KEY_ENABLED].newValue !== false);
  }
});
