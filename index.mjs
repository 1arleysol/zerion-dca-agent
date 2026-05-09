#!/usr/bin/env node
/**
 * Zerion DCA Agent v2 — Entry Point
 * Usage:
 *   node index.mjs              → start agent
 *   node index.mjs --dry-run    → simulate (no real trades)
 *   node index.mjs --stats      → print stats and exit
 *   node index.mjs --history    → print last 20 trades and exit
 */

import { DCAAgent } from "./src/agent.mjs";
import { StateManager } from "./src/state.mjs";

const args = process.argv.slice(2);

if (args.includes("--stats")) {
  const s = new StateManager().getStats();
  console.log("\n📊 DCA Agent Stats\n" + "─".repeat(40));
  console.log(`Started:        ${s.startedAt ?? "—"}`);
  console.log(`Last cycle:     ${s.lastCycle ?? "never"}`);
  console.log(`Total cycles:   ${s.totalCycles}`);
  console.log(`Skipped:        ${s.skippedCycles}`);
  console.log(`Total spent:    $${s.totalSpentUSD.toFixed(2)}`);
  console.log(`Successful buys: ${s.successfulTrades}`);
  console.log(`Failed buys:    ${s.failedTrades}`);
  for (const [sym, d] of Object.entries(s.bySymbol ?? {})) {
    console.log(`  ${sym}: ${d.count} buys · $${d.totalUSD.toFixed(2)}`);
  }
  process.exit(0);
}

if (args.includes("--history")) {
  const trades = new StateManager().getAllTrades().slice(-20).reverse();
  console.log("\n📜 Recent Trades\n" + "─".repeat(60));
  if (!trades.length) { console.log("No trades yet."); process.exit(0); }
  for (const t of trades) {
    const ok = t.status === "success" ? "✅" : "❌";
    console.log(`${ok} ${t.timestamp} | $${(t.amountUSD||0).toFixed(2)} → ${t.symbol} | ${t.txHash ?? t.error ?? ""}`);
  }
  process.exit(0);
}

if (args.includes("--dry-run")) process.env.DRY_RUN = "true";

const agent = new DCAAgent();
agent.start().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
