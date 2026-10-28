// Vercel serverless function: receives a booking request and emails it to Obi through Resend.
// Environment variables (set in the Vercel dashboard, never in the repo):
//   RESEND_API_KEY  required  your Resend API key
//   TO_EMAIL        required  the inbox that receives requests
//   FROM_EMAIL      optional  defaults to "ASL Booking <onboarding@resend.dev>"

const NY = "America/New_York";
const HOURS_MIN = 9;
const HOURS_MAX = 20; // last block starts at 8 PM and ends at 9 PM
const KEY_RE = /^(\d{4})-(\d{2})-(\d{2})\|(\d{1,2})$/;

function hourLabel(h) { return (h % 12 || 12) + (h < 12 ? " AM" : " PM"); }

function nyOffsetMs(utcMs) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: NY, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }).formatToParts(new Date(utcMs));
  const o = {};
  parts.forEach((p) => { o[p.type] = parseInt(p.value, 10); });
  return Date.UTC(o.year, o.month - 1, o.day, o.hour % 24, o.minute, o.second) - utcMs;
}
function nyToUtc(y, m, d, h) {
  const guess = Date.UTC(y, m - 1, d, h);
  const first = guess - nyOffsetMs(guess);
  return guess - nyOffsetMs(first);
}
function validTz(tz) {
  if (!tz || typeof tz !== "string" || tz.length > 60) return false;
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true; } catch (e) { return false; }
}
function clean(s, max) {
  return String(s == null ? "" : s).replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
}

function parseBlocks(list) {
  if (!Array.isArray(list) || list.length === 0 || list.length > 80) return null;
  const today = Date.now();
  const seen = {};
  const out = [];
  for (const raw of list) {
    const m = KEY_RE.exec(String(raw));
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3], h = +m[4];
    if (h < HOURS_MIN || h > HOURS_MAX) return null;
    const noon = Date.UTC(y, mo - 1, d, 12);
    const dow = new Date(noon).getUTCDay();
    if (dow === 0) return null; // Sunday is not offered
    if (noon < today - 2 * 86400000 || noon > today + 70 * 86400000) return null;
    const key = m[1] + "-" + m[2] + "-" + m[3] + "|" + h;
    if (seen[key]) continue;
    seen[key] = true;
    out.push({ date: m[1] + "-" + m[2] + "-" + m[3], y, mo, d, h });
  }
  out.sort((a, b) => (a.date === b.date ? a.h - b.h : a.date < b.date ? -1 : 1));
  return out;
}

function buildLines(blocks, tz) {
  const byDay = {};
  blocks.forEach((b) => { (byDay[b.date] = byDay[b.date] || []).push(b); });
  const showLocal = validTz(tz) && tz !== NY;
  const lines = [];
  Object.keys(byDay).sort().forEach((date) => {
    const hs = byDay[date];
    const first = hs[0];
    const dayLabel = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }).format(new Date(Date.UTC(first.y, first.mo - 1, first.d, 12)));
    lines.push(dayLabel);
    let s = hs[0], p = hs[0];
    const flush = () => {
      let line = "  " + hourLabel(s.h) + " to " + hourLabel(p.h + 1) + " ET";
      if (showLocal) {
        const a = nyToUtc(s.y, s.mo, s.d, s.h);
        const b = nyToUtc(p.y, p.mo, p.d, p.h + 1);
        const f = (ms) => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date(ms));
        const day = (ms) => new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(new Date(ms));
        const sameDay = day(a) === day(b - 1);
        line += "   (their time: " + (sameDay ? "" : day(a) + " ") + f(a) + " to " + (sameDay ? "" : day(b - 1) + " ") + f(b) + ")";
      }
      lines.push(line);
    };
    for (let i = 1; i <= hs.length; i++) {
      if (hs[i] && hs[i].h === p.h + 1) { p = hs[i]; continue; }
      flush();
      if (hs[i]) { s = hs[i]; p = hs[i]; }
    }
  });
  return lines;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false }); }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== "object") return res.status(400).json({ ok: false, error: "bad_request" });

  // Honeypot: real visitors never fill this. Pretend success so bots move on.
  if (body.website) return res.status(200).json({ ok: true });

  const name = clean(body.name, 80);
  const contact = clean(body.contact, 120);
  const note = clean(body.note, 500);
  const tz = clean(body.tz, 60);
  const blocks = parseBlocks(body.blocks);
  if (!name || !contact || !blocks) return res.status(400).json({ ok: false, error: "invalid" });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.TO_EMAIL;
  if (!key || !to) return res.status(500).json({ ok: false, error: "not_configured" });

  const lines = buildLines(blocks, tz);
  const text = [
    "New ASL call request",
    "",
    "Name: " + name,
    "Reach them at: " + contact,
    validTz(tz) ? "Their time zone: " + tz : "",
    note ? "Note: " + note : "",
    "",
    "Blocks they picked (Eastern time" + (validTz(tz) && tz !== NY ? ", with their local time" : "") + "):",
    ...lines,
    "",
    "Reply to confirm one block. The call is 30 to 45 minutes."
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");

  const payload = {
    from: process.env.FROM_EMAIL || "ASL Booking <onboarding@resend.dev>",
    to: [to],
    subject: "New ASL call request from " + name,
    text
  };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) payload.reply_to = contact;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: "send_failed" });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
};
