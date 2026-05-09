/**
 * DCA Agent Core — autonomous buying loop
 */

import { execSync } from "child_process";
import { ZerionAPI } from "./api.mjs";
import { StateManager } from "./state.mjs";
import { Logger } from "./logger.mjs";

// ── Config (all from env vars) ───────────────────────────────────────────────
export const CONFIG = {
  ZERION_API_KEY:          process.env.ZERION_API_KEY || "",
  WALLET_NAME:             process.env.WALLET_NAME || "dca-agent",
  BUDGET_PER_CYCLE_USD:    parseFloat(process.env.BUDGET_PER_CYCLE_USD || "5"),
  INTERVAL_MS:             parseInt(process.env.INTERVAL_MS || "3600000"),   // 1 hour
  CIRCUIT_BREAKER_DROP_PCT:parseFloat(process.env.CIRCUIT_BREAKER_DROP_PCT || "20"),
  SLIPPAGE_PCT:            parseFloat(process.env.SLIPPAGE_PCT || "2"),
  DRY_RUN:                 process.env.DRY_RUN === "true",
  // Tokens to DCA into. Must sum to 100%. USDC entries are skipped (already stable).
  TARGETS: JSON.parse(process.env.DCA_TARGETS || JSON.stringify([
    { symbol: "ETH", token: "ETH",  chain: "base", pct: 100 },
  ])),
};

// ── Agent ────────────────────────────────────────────────────────────────────
export class DCAAgent {
  constructor() {
    this.api    = new ZerionAPI(CONFIG.ZERION_API_KEY);
    this.state  = new StateManager();
    this.log    = new Logger();
    this._timer = null;
  }

  async start() {
    if (!CONFIG.ZERION_API_KEY) throw new Error("ZERION_API_KEY is required");

    this.log.info("🚀 Zerion DCA Agent starting");
    this.log.info(`   Wallet  : ${CONFIG.WALLET_NAME}`);
    this.log.info(`   Budget  : $${CONFIG.BUDGET_PER_CYCLE_USD}/cycle`);
    this.log.info(`   Interval: ${CONFIG.INTERVAL_MS / 60000} min`);
    this.log.info(`   Dry run : ${CONFIG.DRY_RUN}`);

    if (!this.state.get("startedAt")) {
      this.state.set("startedAt", new Date().toISOString());
      this.state.save();
    }

    process.on("SIGINT",  () => this._stop());
    process.on("SIGTERM", () => this._stop());

    await this._cycle();
    this._timer = setInterval(() => this._cycle(), CONFIG.INTERVAL_MS);
  }

  _stop() {
    this.log.info("🛑 Agent stopping");
    if (this._timer) clearInterval(this._timer);
    process.exit(0);
  }

  async _cycle() {
    const num = this.state.get("totalCycles", 0) + 1;
    this.log.info(`\n━━━ Cycle #${num} — ${new Date().toISOString()} ━━━`);

    try {
      // 1. Portfolio value
      const walletAddr = this.state.get("walletAddress", "");
      const portfolio  = walletAddr ? await this.api.getPortfolio(walletAddr) : { totalUSD: 0 };
      this.log.info(`💼 Portfolio: $${portfolio.totalUSD.toFixed(2)}`);

      // 2. Prices
      const prices = {};
      for (const t of CONFIG.TARGETS) {
        try {
          prices[t.symbol] = await this.api.getPrice(t.symbol);
          this.log.info(`   ${t.symbol}: $${prices[t.symbol].toFixed(2)}`);
        } catch {
          this.log.warn(`   Could not fetch price for ${t.symbol}`);
          prices[t.symbol] = null;
        }
      }

      // 3. Circuit breaker
      const lastPrices = this.state.get("lastPrices", {});
      for (const [sym, price] of Object.entries(prices)) {
        if (!price || !lastPrices[sym]) continue;
        const drop = ((lastPrices[sym] - price) / lastPrices[sym]) * 100;
        if (drop > CONFIG.CIRCUIT_BREAKER_DROP_PCT) {
          this.log.warn(`🚨 Circuit breaker: ${sym} dropped ${drop.toFixed(1)}% — skipping cycle`);
          this.state.increment("skippedCycles");
          this.state.save();
          return;
        }
      }

      // 4. Execute purchases
      let spent = 0;
      for (const target of CONFIG.TARGETS) {
        if (target.symbol === "USDC") continue;
        const amountUSD = (target.pct / 100) * CONFIG.BUDGET_PER_CYCLE_USD;
        if (amountUSD < 0.5) continue;

        this.log.info(`🛒 Buying $${amountUSD.toFixed(2)} of ${target.symbol} on ${target.chain}`);
        const result = await this._swap(target, amountUSD);

        this.state.addTrade({
          timestamp: new Date().toISOString(),
          symbol:    target.symbol,
          chain:     target.chain,
          amountUSD,
          status:    result.success ? "success" : "failed",
          txHash:    result.txHash,
          error:     result.error,
        });

        if (result.success) {
          spent += amountUSD;
          this.log.info(`✅ Done | tx: ${result.txHash}`);
        } else {
          this.log.error(`❌ Failed: ${result.error}`);
        }
      }

      // 5. Update state
      this.state.increment("totalCycles");
      this.state.add("totalSpentUSD", spent);
      this.state.set("lastCycle", new Date().toISOString());
      this.state.set("lastPrices", prices);
      this.state.save();

      this.log.info(`✨ Cycle done — spent $${spent.toFixed(2)} | total $${this.state.get("totalSpentUSD", 0).toFixed(2)}`);

    } catch (err) {
      this.log.error(`💥 Cycle error: ${err.message}`);
      this.state.increment("errorCycles");
      this.state.save();
    }
  }

  async _swap(target, amountUSD) {
    if (CONFIG.DRY_RUN) {
      return { success: true, txHash: `dry-${Date.now()}` };
    }

    try {
      // Syntax: zerion swap <chain> <amount> <from> <to> [--wallet <name>] [--slippage <n>]
      const cmd = [
        "zerion", "swap",
        target.chain,
        amountUSD.toFixed(4),
        "USDC",
        target.token,
        "--wallet", CONFIG.WALLET_NAME,
        "--slippage", String(CONFIG.SLIPPAGE_PCT),
        "--output", "json",
      ].join(" ");

      this.log.debug(`$ ${cmd}`);

      const out = execSync(cmd, {
        encoding: "utf8",
        timeout: 120_000,
        env: { ...process.env, ZERION_API_KEY: CONFIG.ZERION_API_KEY },
      });

      const parsed = JSON.parse(out.trim());
      if (parsed?.error) return { success: false, error: parsed.error.message };
      return { success: true, txHash: parsed?.txHash || parsed?.hash || "submitted" };

    } catch (err) {
      // Try to extract JSON error from stderr/stdout
      const match = err.stdout?.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const j = JSON.parse(match[0]);
          return { success: false, error: j?.error?.message || j?.message || "unknown" };
        } catch {}
      }
      return { success: false, error: err.message?.slice(0, 200) };
    }
  }
}
