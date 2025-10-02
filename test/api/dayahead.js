// api/dayahead.js (Vercel serverless function)
import { XMLParser } from "fast-xml-parser";

const ZONES = {
  FI: "10YFI-1--------U",     // Finland
  SE: "10Y1001A1001A46L",     // Sweden SE3 (example)
  NO: "10YNO-2--------T",     // Norway NO2 (example)
  DK: "10Y1001A1001A65H"      // Denmark DK1 (example)
};

const DOCUMENT_TYPE = "A44";  // Day-ahead prices

function periodYYYYMMDDHHmm(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const H = String(date.getUTCHours()).padStart(2, "0");
  const M = String(date.getUTCMinutes()).padStart(2, "0");
  return `${y}${m}${d}${H}${M}`;
}

export default async function handler(req, res) {
  // CORS so your static site (GitHub Pages, etc.) can call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = process.env.ENTSOE_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "ENTSOE_TOKEN not set" });
  }

  const countries = (req.query.countries || "FI,SE,NO,DK")
    .toString()
    .split(",")
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);

  // Window: today 00:00–23:59 UTC
  const start = new Date(); start.setUTCHours(0,0,0,0);
  const end = new Date(start.getTime() + 24 * 3600_000 - 60_000);
  const periodStart = periodYYYYMMDDHHmm(start);
  const periodEnd = periodYYYYMMDDHHmm(end);

  const parser = new XMLParser({ ignoreAttributes: false });
  const results = {};

  try {
    await Promise.all(countries.map(async c => {
      const zone = ZONES[c];
      if (!zone) { results[c] = []; return; }

      const url = `https://transparency.entsoe.eu/api?documentType=${DOCUMENT_TYPE}` +
                  `&in_Domain=${zone}&out_Domain=${zone}` +
                  `&periodStart=${periodStart}&periodEnd=${periodEnd}` +
                  `&securityToken=${token}`;

      const r = await fetch(url);
      if (!r.ok) { results[c] = []; return; }
      const xml = await r.text();
      const json = parser.parse(xml);

      const series = [];
      const tsArr = [].concat(json?.Publication_MarketDocument?.TimeSeries || []);
      for (const ts of tsArr) {
        const periods = [].concat(ts?.Period || []);
        for (const p of periods) {
          const startISO = p?.timeInterval?.start;
          const points = [].concat(p?.Point || []);
          points.forEach((pt, idx) => {
            const hour = new Date(new Date(startISO).getTime() + idx * 3600_000);
            const raw = Number(pt["price.amount"]);
            if (Number.isFinite(raw)) {
              series.push({ ts: hour.toISOString(), price: raw });
            }
          });
        }
      }

      // Auto-scale if needed
      const max = Math.max(...series.map(d => d.price), 0);
      let out = series;
      if (max > 2000) out = series.map(d => ({ ...d, price: d.price / 10 }));   // tenths → EUR/MWh
      else if (max < 1 && max > 0.01) out = series.map(d => ({ ...d, price: d.price * 1000 })); // EUR/kWh → EUR/MWh

      results[c] = out.sort((a,b) => new Date(a.ts) - new Date(b.ts));
    }));

    return res.status(200).json({ source: "LIVE", data: results });
  } catch (e) {
    return res.status(500).json({ error: "ENTSO-E fetch failed", details: String(e) });
  }
}
