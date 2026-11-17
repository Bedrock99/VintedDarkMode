# 🌙 Vinted Dark Mode

Eine kompakte Firefox-Erweiterung (Manifest V3), die Vinted in einen augenschonenden **Dark Mode** taucht — mit einem integrierten Schalter direkt im Header.

> **Entwicklung**: Konzipiert und entwickelt mit Unterstützung von **Gemini 3.8 Flash**.

---

## ✨ Features

- **Schalter im Header**: Sitzt in der oberen Leiste direkt nach „Artikel verkaufen“ und vor dem Hilfe-Icon (links neben der Sprachauswahl).
- **Kein weißer Blitz (Zero FOUC)**: Greift ab `document_start` und verhindert grelles Aufleuchten beim Laden.
- **Natives Vinted-Design**: Nutzt Vinteds Dark-Theme-Tokens und korrigiert Lade-Skelette, Banner und Scrollbars.
- **Bilderschutz**: Fotos, Avatare und Abzeichen bleiben in Originalfarben.
- **Toolbar-Popup**: Schnelleinstellungen (z. B. Header-Schalter oder Textbeschriftung ein-/ausblenden).
- **Länderunterstützung**: Funktioniert auf allen Vinted-Domains (`.de`, `.fr`, `.at`, `.co.uk`, `.it`, `.es`, `.pl` etc.).

---

## 🚀 Installation (Firefox)

### Temporär testen (about:debugging)
1. In Firefox `about:debugging#/runtime/this-firefox` aufrufen.
2. Auf **„Temporäres Add-on laden…“** klicken.
3. [manifest.json](file:///d:/GIT/Github/VintedDarkMode/manifest.json) oder die ZIP-Datei in `dist/` auswählen.
4. Auf [vinted.de](https://www.vinted.de) surfen — der Schalter ist sofort aktiv.

### Dauerhaft installieren (Mozilla Add-on Store)
https://addons.mozilla.org/de/firefox/addon/vinted-darkmode/

---

## 📦 Paketierung & Versionierung

Mit einem Befehl wird das installierbare Paket (`.xpi` und `.zip`) im Ordner `dist/` erstellt:

```powershell
python package.py
```

---

## 📄 Lizenz

Freie Open-Source-Software (siehe [LICENSE.md](file:///d:/GIT/Github/VintedDarkMode/LICENSE.md)). Kostenlose Nutzung, Weiterentwicklung und Verbreitung für jeden erlaubt.
