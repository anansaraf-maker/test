// ---------- CONFIG ----------
const COUNTRIES = ["FI", "SE", "NO", "DK"];
const COUNTRY_NAMES = { FI: "Finland", SE: "Sweden", NO: "Norway", DK: "Denmark" };
const COUNTRY_FLAGS = { FI: "🇫🇮", SE: "🇸🇪", NO: "🇳🇴", DK: "🇩🇰" };

// Secure API endpoint - will use your deployed Vercel function
// Falls back to demo data automatically if API is not available
const API_URL = "/api/dayahead?countries=FI,SE,NO,DK";

// ---------- DOM ELEMENTS ----------
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const errorTextEl = document.getElementById("error-text");
const dashboardEl = document.getElementById("dashboard");
const priceTickerEl = document.getElementById("priceTicker");
const dataSourceIndicator = document.getElementById("dataSourceIndicator");
const liveClockEl = document.getElementById("liveClock");

// Will be created below if missing: a small yellow banner for data issues
let validationBanner;

// ---------- UTIL ----------
const fmtEUR = v => `${Number(v).toFixed(1)} EUR/MWh`;
const by = k => (a, b) => (a[k] > b[k] ? 1 : -1);

// Make/ensure a top banner for validation messages
function ensureValidationBanner() {
  if (validationBanner) return validationBanner;
  validationBanner = document.createElement("div");
  validationBanner.style.cssText = `
    display:none;margin:10px 0;padding:10px 14px;border-radius:10px;
    background:#FEF3C7;color:#92400E;font:500 14px/1.3 Inter, system-ui, Arial;
  `;
  // Add after the header ticker
  const header = document.querySelector(".main-header");
  header.insertAdjacentElement("afterend", validationBanner);
  return validationBanner;
}

function showError(msg) {
  loadingEl.style.display = "none";
  dashboardEl.style.display = "none";
  errorEl.style.display = "block";
  errorTextEl.textContent = msg;
}

function showDashboard() {
  loadingEl.style.display = "none";
  errorEl.style.display = "none";
  dashboardEl.style.display = "grid";
}

function setSourceBadge(source) {
  const dot = dataSourceIndicator.querySelector(".source-dot");
  const text = dataSourceIndicator.querySelector(".source-text");
  if (!dot || !text) return;
  text.textContent = source === "LIVE" ? "Live data" : source || "Demo data";
  dot.style.background = source === "LIVE" ? "#22c55e" : "#f59e0b";
}

// ---------- VALIDATION ----------
function validateAndSanitize(raw) {
  // raw expected: { FI:[{ts,price}, ...], SE:[...], ... }
  const issues = [];
  const data = {};

  for (const c of COUNTRIES) {
    const arr = Array.isArray(raw?.[c]) ? raw[c] : [];
    // Filter to good points and normalize timestamps
    const clean = arr
      .filter(pt => pt && pt.ts && Number.isFinite(+pt.price))
      .map(pt => ({ ts: new Date(pt.ts).toISOString(), price: Number(pt.price) }))
      .sort(by("ts"));

    // Deduplicate same ts
    const seen = new Set();
    const unique = clean.filter(d => (seen.has(d.ts) ? false : (seen.add(d.ts), true)));

    // Sanity checks
    if (unique.length < 24) issues.push(`${c}: expected ≥24 hourly points, got ${unique.length}`);
    if (unique.some(d => d.price < -50)) issues.push(`${c}: extreme negative (< -50)`);
    if (unique.some(d => d.price > 1000)) issues.push(`${c}: extreme positive (> 1000)`);

    const prices = unique.map(d => d.price).sort((a,b) => a-b);
    if (prices.length > 0) {
      const median = prices[Math.floor(prices.length / 2)];
      if (unique.some(d => d.price > 3 * median)) {
        issues.push(`${c}: spike > 3× median (${median.toFixed(1)})`);
      }
    }

    data[c] = unique;
  }
  return { ok: issues.length === 0, issues, data };
}

// ---------- DEMO DATA (if API not ready) ----------
function buildDemoSeries() {
  // 24 hours starting from 00:00 today, simple waves
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const mk = (offset, base, amp) =>
    Array.from({ length: 24 }, (_, i) => ({
      ts: new Date(start.getTime() + i * 3600_000).toISOString(),
      price: base + amp * Math.sin((i + offset) / 24 * Math.PI * 2) + (Math.random() - 0.5) * 4
    }));
  return {
    FI: mk(0, 45, 20),
    SE: mk(4, 46, 18),
    NO: mk(8, 30, 15),
    DK: mk(2, 48, 22),
    __source: "DEMO"
  };
}

// ---------- FETCH ----------
async function fetchSeries() {
  try {
    const r = await fetch(API_URL, { cache: "no-store" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json(); // expect { source: "LIVE"|"DEMO", data: {...} }
    const source = j.source || "LIVE";
    return { source, data: j.data || {} };
  } catch (e) {
    // Fall back to demo
    const demo = buildDemoSeries();
    return { source: "DEMO", data: demo };
  }
}

// ---------- RENDER HELPERS ----------
function updateCards(series) {
  const map = {
    FI: document.querySelector('.stat-card[data-country="finland"]'),
    SE: document.querySelector('.stat-card[data-country="sweden"]'),
    NO: document.querySelector('.stat-card[data-country="norway"]'),
    DK: document.querySelector('.stat-card[data-country="denmark"]'),
  };
  for (const c of COUNTRIES) {
    const card = map[c];
    const data = series[c] || [];
    const last = data.at(-1);
    const prev = data.at(-2);
    if (!card || !last) continue;

    card.querySelector(".current-price").textContent = fmtEUR(last.price);
    const trend = card.querySelector(".price-trend");
    if (prev) {
      const diff = last.price - prev.price;
      trend.textContent = `${diff >= 0 ? "📈 Rising" : "📉 Falling"} (${diff.toFixed(1)})`;
    } else {
      trend.textContent = "—";
    }
    const status = card.querySelector(".price-status");
    status.textContent = last.price < 30 ? "LOW PRICE" : last.price < 60 ? "MEDIUM PRICE" : "HIGH PRICE";
  }
}

function updateTicker(series) {
  for (const item of priceTickerEl.querySelectorAll(".ticker-item")) {
    const k = item.dataset.country; // finland | sweden | norway | denmark
    const c = k === "finland" ? "FI" : k === "sweden" ? "SE" : k === "norway" ? "NO" : "DK";
    const last = series[c]?.at(-1);
    if (last) item.querySelector(".price").textContent = last.price.toFixed(1);
  }
}

function updateCheapest(series) {
  const best = COUNTRIES
    .map(c => ({ c, v: series[c]?.at(-1)?.price ?? Infinity }))
    .sort((a,b) => a.v - b.v)[0];
  const el = document.getElementById("cheapestCountry");
  el.querySelector(".flag").textContent = COUNTRY_FLAGS[best.c];
  el.querySelector(".name").textContent = COUNTRY_NAMES[best.c];
  el.querySelector(".price").textContent = fmtEUR(best.v);
}

function updateBestTimes(series) {
  // Simple: 3 cheapest hours today for FI
  const arr = series.FI || [];
  const today = new Date().toISOString().slice(0,10);
  const todays = arr.filter(d => d.ts.slice(0,10) === today);
  const picks = todays.slice().sort((a,b) => a.price - b.price).slice(0,3);

  const box = document.getElementById("bestTimes");
  box.innerHTML = "";
  for (const p of picks) {
    const t = new Date(p.ts);
    const div = document.createElement("div");
    div.className = "time-slot";
    div.innerHTML = `<span class="time">${t.getHours().toString().padStart(2,"0")}:00</span>
                     <span class="price">${p.price.toFixed(1)} EUR</span>`;
    box.appendChild(div);
  }
}

// ---------- CHART ----------
let chart;
function renderChart(series) {
  const ctx = document.getElementById("priceChart");
  const labels = (series.FI || []).map(d => new Date(d.ts)); // use FI timestamps for X axis

  const ds = (code, color) => ({
    label: COUNTRY_NAMES[code],
    data: (series[code] || []).map(d => ({ x: new Date(d.ts), y: d.price })),
    borderWidth: 2,
    tension: 0.25,
    pointRadius: 0
  });

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        ds("FI"), ds("SE"), ds("NO"), ds("DK")
      ]
    },
    options: {
      parsing: false,
      responsive: true,
      interaction: { mode: "nearest", intersect: false },
      plugins: {
        legend: { display: true, position: "bottom" },
        decimation: { enabled: true }
      },
      scales: {
        x: { type: "time", time: { unit: "hour", tooltipFormat: "HH:mm" } },
        y: { title: { display: true, text: "EUR/MWh" } }
      }
    }
  });
}

// ---------- CLOCK ----------
function startClock() {
  const pad = n => n.toString().padStart(2,"0");
  const tick = () => {
    const d = new Date();
    liveClockEl.textContent = `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);
}

// ---------- MAIN ----------
async function loadElectricityPrices() {
  try {
    loadingEl.style.display = "flex";
    const { source, data } = await fetchSeries();
    setSourceBadge(source);

    const { ok, issues, data: series } = validateAndSanitize(data);

    // Show validation banner if needed
    const banner = ensureValidationBanner();
    if (!ok) {
      banner.style.display = "block";
      banner.textContent = "Data checks: " + issues.join(" • ");
    } else {
      banner.style.display = "none";
      banner.textContent = "";
    }

    // Render UI
    updateCards(series);
    updateTicker(series);
    updateCheapest(series);
    updateBestTimes(series);
    renderChart(series);
    showDashboard();
  } catch (e) {
    showError(`Could not load prices. ${e.message || e}`);
  }
}

// Initial load + clock
startClock();
loadElectricityPrices();

// Optional: expose for the Retry button in your HTML error box
window.loadElectricityPrices = loadElectricityPrices;
