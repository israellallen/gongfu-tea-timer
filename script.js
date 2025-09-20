// Gongfu Tea Timer — by Israel Allen (MIT)
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const defaultPresets = [
    { name: "Oolong (Gongfu)", base: 10, rule: "fixed", amount: 2, count: 12 },
    { name: "Puerh Ripe (Shou)", base: 8, rule: "fixed", amount: 2, count: 14 },
    { name: "Green (Light)", base: 8, rule: "percent", amount: 20, count: 8 },
    { name: "Black/Red Tea", base: 12, rule: "percent", amount: 15, count: 10 },
    { name: "White (Delicate)", base: 12, rule: "multiplier", amount: 1.15, count: 10 }
  ];

  const el = {
    presetSelect: $("#preset-select"),
    savePreset: $("#save-preset"),
    deletePreset: $("#delete-preset"),
    base: $("#base-seconds"),
    rule: $("#increase-rule"),
    amount: $("#increase-amount"),
    count: $("#num-infusions"),
    generate: $("#generate"),
    exportBtn: $("#export-json"),
    importBtn: $("#import-json"),
    importFile: $("#import-file"),
    time: $("#time-remaining"),
    label: $("#infusion-label"),
    start: $("#start"),
    pause: $("#pause"),
    reset: $("#reset"),
    next: $("#next"),
    ring: document.querySelector(".ring"),
    tableBody: $("#schedule-table tbody"),
    log: $("#log"),
    themeBtn: $("#toggle-theme"),
    gh: $("#github-link")
  };

  // Fill GitHub link placeholder
  el.gh.href = "https://israellallen.github.io/gongfu-tea-timer/";
  el.gh.textContent = "GitHub Repo";

  // Theme
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  if (localStorage.getItem("theme") === "light" || (!localStorage.getItem("theme") && prefersLight)) {
    document.documentElement.classList.add("light");
  }
  el.themeBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("light");
    localStorage.setItem("theme", document.documentElement.classList.contains("light") ? "light" : "dark");
  });

  // Presets
  function loadPresets() {
    const saved = JSON.parse(localStorage.getItem("gongfu_presets") || "[]");
    const all = [...defaultPresets, ...saved];
    el.presetSelect.innerHTML = "";
    all.forEach((p, i) => {
      const opt = document.createElement("option");
      opt.value = p.name;
      opt.textContent = p.name;
      el.presetSelect.appendChild(opt);
    });
    return all;
  }
  function getPreset(name) {
    const saved = JSON.parse(localStorage.getItem("gongfu_presets") || "[]");
    const all = [...defaultPresets, ...saved];
    return all.find(p => p.name === name);
  }
  function saveCurrentAsPreset() {
    const name = prompt("Preset name:");
    if (!name) return;
    const preset = {
      name,
      base: +el.base.value,
      rule: el.rule.value,
      amount: +el.amount.value,
      count: +el.count.value
    };
    const saved = JSON.parse(localStorage.getItem("gongfu_presets") || "[]");
    const i = saved.findIndex(p => p.name === name);
    if (i >= 0) saved[i] = preset; else saved.push(preset);
    localStorage.setItem("gongfu_presets", JSON.stringify(saved));
    loadPresets();
    el.presetSelect.value = name;
  }
  function deletePreset() {
    const name = el.presetSelect.value;
    const saved = JSON.parse(localStorage.getItem("gongfu_presets") || "[]");
    const newSaved = saved.filter(p => p.name !== name);
    localStorage.setItem("gongfu_presets", JSON.stringify(newSaved));
    loadPresets();
  }

  // Schedule generation
  function generateSchedule(base, rule, amount, count) {
    let times = [];
    let t = base;
    for (let i = 0; i < count; i++) {
      times.push(Math.round(t));
      if (rule === "fixed") t += amount;
      else if (rule === "percent") t += t * (amount/100);
      else if (rule === "multiplier") t *= amount;
    }
    return times;
  }
  function renderSchedule(times) {
    el.tableBody.innerHTML = "";
    times.forEach((sec, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${i+1}</td><td>${sec}</td><td contenteditable="true" data-idx="${i}" class="note-cell" placeholder="notes…"></td>`;
      el.tableBody.appendChild(tr);
    });
  }

  // Timer
  const CIRC = 2 * Math.PI * 54;
  let schedule = generateSchedule(+el.base.value, el.rule.value, +el.amount.value, +el.count.value);
  let idx = 0;
  let remaining = schedule[0];
  let timerId = null;
  let paused = true;
  function updateRing() {
    const total = schedule[idx] || 1;
    const frac = remaining / total;
    el.ring.style.strokeDasharray = CIRC;
    el.ring.style.strokeDashoffset = CIRC * (1 - frac);
  }
  function fmt(sec){
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = Math.floor(sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }
  function paint() {
    el.time.textContent = fmt(remaining);
    el.label.textContent = `Infusion ${idx+1} / ${schedule.length}`;
    updateRing();
  }
  function tick() {
    if (paused) return;
    if (remaining <= 0){
      chime();
      logBrew();
      nextInfusion();
      return;
    }
    remaining -= 1;
    paint();
  }
  function start() {
    if (!timerId) timerId = setInterval(tick, 1000);
    paused = false; paint();
  }
  function pause() { paused = true; paint(); }
  function reset() {
    idx = 0; remaining = schedule[0]; paused = true; paint();
  }
  function nextInfusion() {
    idx++;
    if (idx >= schedule.length) { paused = true; idx = schedule.length-1; paint(); return; }
    remaining = schedule[idx];
    paint();
  }
  function chime() {
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      setTimeout(()=>o.stop(), 900);
    }catch(e){}
  }
  function logBrew() {
    const now = new Date();
    const div = document.createElement("div");
    div.className = "log-item";
    div.textContent = `✔️ Infusion ${idx+1} finished at ${now.toLocaleTimeString()}`;
    el.log.prepend(div);
  }

  // Bindings
  el.generate.addEventListener("click", () => {
    schedule = generateSchedule(+el.base.value, el.rule.value, +el.amount.value, +el.count.value);
    idx = 0; remaining = schedule[0]; renderSchedule(schedule); paint();
  });
  el.start.addEventListener("click", start);
  el.pause.addEventListener("click", pause);
  el.reset.addEventListener("click", reset);
  el.next.addEventListener("click", nextInfusion);
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space"){ e.preventDefault(); paused ? start() : pause(); }
    if (e.key.toLowerCase() === "n"){ nextInfusion(); }
    if (e.key.toLowerCase() === "r"){ reset(); }
  });

  // Presets UI
  function applyPreset(p){
    el.base.value = p.base;
    el.rule.value = p.rule;
    el.amount.value = p.amount;
    el.count.value = p.count;
    schedule = generateSchedule(p.base, p.rule, p.amount, p.count);
    idx = 0; remaining = schedule[0];
    renderSchedule(schedule); paint();
  }
  const allPresets = loadPresets();
  applyPreset(allPresets[0]);
  el.presetSelect.addEventListener("change", () => {
    const p = getPreset(el.presetSelect.value); if (p) applyPreset(p);
  });
  el.savePreset.addEventListener("click", saveCurrentAsPreset);
  el.deletePreset.addEventListener("click", deletePreset);

  // Export / Import
  el.exportBtn.addEventListener("click", () => {
    const data = {
      base: +el.base.value, rule: el.rule.value, amount: +el.amount.value, count: +el.count.value,
      schedule
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "gongfu_timer_plan.json"; a.click();
    URL.revokeObjectURL(url);
  });
  el.importBtn.addEventListener("click", () => el.importFile.click());
  el.importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const j = JSON.parse(reader.result);
        el.base.value = j.base ?? 10;
        el.rule.value = j.rule ?? "fixed";
        el.amount.value = j.amount ?? 2;
        el.count.value = j.count ?? 10;
        schedule = j.schedule ?? generateSchedule(+el.base.value, el.rule.value, +el.amount.value, +el.count.value);
        idx = 0; remaining = schedule[0];
        renderSchedule(schedule); paint();
      }catch(err){ alert("Invalid JSON"); }
    };
    reader.readAsText(file);
  });

  // Initial render
  renderSchedule(schedule); paint();
})();
