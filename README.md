# 🌙 Vinted Dark Mode — Firefox Extension

Eine elegante und performante Firefox-Erweiterung (Manifest V3), die Vinted in einen vollwertigen, augenschonenden **Dark Mode** taucht — mit einem **fest in den Header integrierten Ein-/Aus-Schalter**.

> **Hinweis zur Entwicklung**: Dieses Projekt wurde mit Unterstützung von **Gemini 3.8 Flash** konzipiert und entwickelt.

---

## ✨ Highlights & Features

- 🔘 **Fest im Vinted-Header eingebunden (nicht fliegend)**:
  - Sitzt direkt in der oberen Navigationsleiste von Vinted: **NACH „Artikel verkaufen“ und VOR dem Hilfe-Icon (`?`)** (links neben der Sprachauswahl).
  - Passt sich nahtlos in Vinteds Design ein: Elegante Pill mit animiertem Mond-/Sonne-Icon und Schieberegler.
  - **Kein Überdecken von Inhalten**: Bewegt sich natürlich mit dem Header mit und verdeckt keine Profil-, Chat- oder Such-Elemente.
  - **Isoliert im Shadow DOM**: Kein CSS-Konflikt mit Vinteds Stylesheets und keine Störung von React / Next.js.
  - **SPA- & Hydration-Safe**: Bleibt auch bei Seitenwechseln (Katalog, Artikel, Chat, Profil) ohne Neuladen stets an der richtigen Stelle.
- ⚡ **Kein weißer Blitz (Zero FOUC)**:
  - Startet bei `document_start` und setzt den dunklen Hintergrund bereits vor dem Rendern des HTML-Bodys.
- 🎨 **Natives Vinted-Designsystem**:
  - Nutzt Vinteds integrierte Dark-Theme-Tokens und ergänzt diese um Korrekturen für Lade-Skelette, Aktionsbanner, Dropzones und Verifizierungs-Badges.
  - **Bilderschutz**: Produktfotos, Profilbilder, Badges und Videos werden niemals invertiert oder verfälscht.
- ⌨️ **Tastenkombination**:
  - Drücke jederzeit <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>, um den Dark Mode blitzschnell umzuschalten.
- 🧭 **Firefox Toolbar Popup**:
  - Klicke auf das Icon in der Firefox-Symbolleiste für einen schnellen Hauptschalter und die Option, den Header-Schalter nach Wunsch ein-/auszublenden oder zu beschriften.
- 🌍 **Vollständige Länderunterstützung**:
  - Funktioniert auf allen Vinted-Domains: `.de`, `.fr`, `.at`, `.co.uk`, `.it`, `.es`, `.pl`, `.nl`, `.be`, `.cz`, `.lt`, `.pt`, `.se`, `.ro`, `.hu`, `.sk`, `.com` uvm.

---

## 🚀 Installation in Firefox

### Methode 1: Temporär laden (für Entwicklung & Sofort-Test)

1. Öffne Firefox und tippe in die Adressleiste:
   ```text
   about:debugging#/runtime/this-firefox
   ```
2. Klicke auf die Schaltfläche **„Temporäres Add-on laden…“** (*Load Temporary Add-on*).
3. Navigiere in dieses Projektverzeichnis:
   ```text
   D:\GIT\Github\VintedDarkMode
   ```
4. Wähle die Datei [manifest.json](file:///d:/GIT/Github/VintedDarkMode/manifest.json) (oder die Datei `dist/vinted-dark-mode-v1.0.0.zip`) aus und klicke auf **Öffnen**.
5. Fertig! Öffne jetzt [vinted.de](https://www.vinted.de) — der Schalter befindet sich oben in der Leiste direkt nach „Artikel verkaufen“ und vor der Hilfe.

---

## 🎮 Bedienung

| Aktion | Wo? | Wie? |
| :--- | :--- | :--- |
| **Dark Mode umschalten** | Im Vinted-Header | Klick auf den Schalter vor der Hilfe |
| **Tastatur-Shortcut** | Überall im Browser | <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd> |
| **Schalter im Header ausblenden** | Toolbar Popup | Option „Schalter im Vinted-Header“ deaktivieren |
| **Text im Schalter einblenden** | Toolbar Popup | Option „Text-Beschriftung im Schalter“ aktivieren |
| **Popup öffnen** | Firefox Symbolleiste | Klick auf das Erweiterungs-Icon |

---

## 📄 Lizenz

Dieses Projekt steht unter einer freien Open-Source-Lizenz (siehe [LICENSE.md](file:///d:/GIT/Github/VintedDarkMode/LICENSE.md)). Jeder darf den Code kostenlos nutzen, anpassen und weiterverbreiten.
