// ── State Manager ────────────────────────────────────────────────────────────
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DIR   = path.join(path.dirname(fileURLToPath(import.meta.url)), "../logs");
const FILE  = path.join(DIR, "state.json");

export class StateManager {
  constructor() { this._d = this._load(); }

  _load() {
    try {
      if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, "utf8"));
    } catch {}
    return { totalCycles:0, skippedCycles:0, errorCycles:0, totalSpentUSD:0, trades:[], lastPrices:{} };
  }

  save() {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(this._d, null, 2));
  }

  get(k, def = null)  { return this._d[k] ?? def; }
  set(k, v)           { this._d[k] = v; }
  increment(k, n = 1) { this._d[k] = (this._d[k] ?? 0) + n; }
  add(k, v)           { this._d[k] = (this._d[k] ?? 0) + v; }

  addTrade(t) {
    if (!Array.isArray(this._d.trades)) this._d.trades = [];
    this._d.trades.push(t);
    if (this._d.trades.length > 500) this._d.trades = this._d.trades.slice(-500);
  }

  getStats() {
    const trades = this._d.trades ?? [];
    const ok  = trades.filter(t => t.status === "success");
    const bad = trades.filter(t => t.status === "failed");
    const bySymbol = {};
    for (const t of ok) {
      bySymbol[t.symbol] ??= { count: 0, totalUSD: 0 };
      bySymbol[t.symbol].count++;
      bySymbol[t.symbol].totalUSD += t.amountUSD ?? 0;
    }
    return {
      totalCycles:      this._d.totalCycles ?? 0,
      skippedCycles:    this._d.skippedCycles ?? 0,
      totalSpentUSD:    this._d.totalSpentUSD ?? 0,
      successfulTrades: ok.length,
      failedTrades:     bad.length,
      bySymbol,
      startedAt:        this._d.startedAt,
      lastCycle:        this._d.lastCycle,
      lastPrices:       this._d.lastPrices ?? {},
    };
  }

  getAllTrades() { return this._d.trades ?? []; }
}


// ── Logger ───────────────────────────────────────────────────────────────────
import { createWriteStream } from "fs";

export class Logger {
  constructor() {
    fs.mkdirSync(DIR, { recursive: true });
    this._stream = createWriteStream(path.join(DIR, "agent.log"), { flags: "a" });
  }

  _write(level, msg) {
    const line = `[${new Date().toISOString()}] [${level}] ${msg}`;
    console.log(line);
    this._stream.write(line + "\n");
  }

  info(msg)  { this._write("INFO ", msg); }
  warn(msg)  { this._write("WARN ", msg); }
  error(msg) { this._write("ERROR", msg); }
  debug(msg) { if (process.env.DEBUG) this._write("DEBUG", msg); }
}
