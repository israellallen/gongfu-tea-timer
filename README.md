# 🍵 Gongfu Tea Timer (Web)

A sleek, mobile-friendly **Gongfu Tea Timer** for multi-infusion brewing. Presets, customizable schedules, keyboard shortcuts, local save, export/import, progress ring, and a brew log. Pure HTML/CSS/JS — host on GitHub Pages in minutes.

## ✨ Features
- **Presets** (Oolong, Ripe Puerh, Green, Black, White) + save/delete your own (localStorage)
- **Infusion generator**: base seconds + increase rule (*fixed*, *percent*, *multiplier*) + number of infusions
- **Timer** with progress ring, start/pause/reset/next, and a soft chime
- **Keyboard**: `Space` start/pause, `N` next, `R` reset
- **Export/Import** infusion plans as JSON
- **Brew log** with timestamps
- **Dark / Light** theme (auto-detect + toggle)
- Zero dependencies — just open `index.html`

## 🏁 Quickstart
1. Download this folder and open `index.html` in any modern browser.
2. Pick a preset or set your own plan.
3. Press **Start**. Keyboard shortcuts: `Space`, `N`, `R`.

## 💡 Gongfu Brewing Notes
- Use a small gaiwan/teapot (80–120ml) with a high leaf ratio.
- Start short (e.g., 8–10s), increase modestly each infusion.
- Rinse leaves once (2–3s) before infusion #1 if desired.
- Taste every cup; adjust the increase rule as leaves open up.

## 🛠️ Stack
- **HTML/CSS/JS** (no frameworks)
- LocalStorage for presets
- Web Audio API for the chime

## 🚀 Deploy on GitHub Pages
1. Create a new repo (e.g., `gongfu-tea-timer`), push these files.
2. Repo **Settings → Pages** → **Deploy from branch**, select `main` and `/root`.
3. You’ll get a live URL you can put in your bio.

## 📦 Export / Import
- **Export**: Saves current plan to `gongfu_timer_plan.json`.
- **Import**: Load a plan back in and adjust.

## 🔒 License
MIT — free to use and remix. See `LICENSE`.

## ✍️ Author
Israel Allen — Dartmouth ’28 (QSS)  
LinkedIn: <your link here>
