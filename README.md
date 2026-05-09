# ⚡ ZerionDCA — Autonomous Onchain DCA Agent

> **Frontier Hackathon Submission** — Build an Autonomous Onchain Agent using Zerion CLI

ZerionDCA is a fully autonomous Dollar Cost Averaging agent that **automatically buys ETH onchain every hour** using the Zerion CLI and Zerion API — no human interaction required after setup.

---

## 🎥 Demo

> Agent running + live dashboard: [video link]

**Live stats:**
- Wallet: `0x7de6b3A58173B6812F5d3f84ba0Fe97F415dB79F` (Base chain)
- Buying: ETH every hour on Base
- Dashboard: real-time trade history and portfolio stats

---

## 🤖 What it does

Every cycle (default: 1 hour), the agent:

1. **Fetches ETH price** via Zerion API
2. **Checks circuit breaker** — skips if price dropped >20% since last cycle
3. **Executes swap** via Zerion CLI: `zerion swap base <amount> USDC ETH`
4. **Logs the trade** — timestamp, tx hash, amount, status
5. **Persists state** — survives restarts, tracks total spent and PnL

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Zerion CLI: `npm install -g github:zeriontech/zerion-ai`
- API key from [dashboard.zerion.io](https://dashboard.zerion.io)

### 1. Clone and setup
```bash
git clone https://github.com/YOUR_USERNAME/zerion-dca-agent
cd zerion-dca-agent
cp .env.example .env
# Edit .env with your API key
```

### 2. Create agent wallet
```bash
zerion wallet create --agent --name dca-agent
# Save the passphrase — it's the only way to recover your wallet
```

### 3. Fund the wallet
```bash
zerion wallet fund
# Send USDC to the Base address shown
```

### 4. Test with dry run (no real trades)
```bash
ZERION_API_KEY=your_key DRY_RUN=true node index.mjs
```

### 5. Run for real
```bash
ZERION_API_KEY=your_key node index.mjs
```

### 6. Open the dashboard
```bash
# In a second terminal:
ZERION_API_KEY=your_key node dashboard.mjs
# Open http://localhost:3000
```

---

## ⚙️ Configuration

All config via environment variables:

| Variable | Default | Description |
|---|---|---|
| `ZERION_API_KEY` | — | **Required.** From dashboard.zerion.io |
| `WALLET_NAME` | `dca-agent` | Zerion wallet name |
| `BUDGET_PER_CYCLE_USD` | `5` | USD to spend per cycle |
| `INTERVAL_MS` | `3600000` | Cycle interval (1 hour) |
| `CIRCUIT_BREAKER_DROP_PCT` | `20` | Skip cycle if price drops >X% |
| `SLIPPAGE_PCT` | `2` | Swap slippage tolerance |
| `DRY_RUN` | `false` | Simulate without real trades |
| `DCA_TARGETS` | ETH 100% | JSON array of tokens to buy |

### Custom allocation example
```bash
# 70% ETH, 30% stays as USDC
DCA_TARGETS='[{"symbol":"ETH","token":"ETH","chain":"base","pct":100}]'
```

---

## 🛡️ Safety Features

- **Circuit breaker** — halts buying if price crashes between cycles
- **Agent token policy** — `deny-transfers` prevents unauthorized withdrawals
- **Dry run mode** — full simulation before going live
- **Persistent state** — all trades logged to `logs/state.json`
- **Configurable slippage** — protects against bad swap rates

---

## 🏗️ Architecture

```
index.mjs          ← CLI entry point (--dry-run, --stats, --history)
dashboard.mjs      ← Web server: landing page + dashboard + /api
src/
  agent.mjs        ← Main DCA loop (fetch → check → swap → log)
  api.mjs          ← Zerion REST API v1 client
  state.mjs        ← Persistent state + Logger
logs/
  state.json       ← Trade history and agent stats
  agent.log        ← Full log file
```

### How a cycle works
```
1. GET /v1/wallets/{address}/portfolio  → portfolio value
2. GET /v1/fungibles?filter[search_query]=ETH → current price
3. Circuit breaker check (vs last cycle price)
4. zerion swap base {amount} USDC ETH --wallet dca-agent
5. Save trade to state.json
6. Wait INTERVAL_MS → repeat
```

---

## 📊 CLI Commands

```bash
node index.mjs              # Start agent
node index.mjs --dry-run    # Simulate (no real trades)
node index.mjs --stats      # Print stats summary
node index.mjs --history    # Print last 20 trades
node dashboard.mjs          # Start web dashboard
```

---

## 🔧 Tech Stack

| Layer | Tech |
|---|---|
| Onchain execution | **Zerion CLI** (`zerion swap`) |
| Price & portfolio data | **Zerion REST API v1** |
| Chain | **Base** (low fees) |
| Runtime | Node.js 20 ESM |
| Security | Zerion Agent Tokens + deny-transfers policy |
| State | JSON file persistence |
| Frontend | Vanilla HTML/CSS/JS |

---

## 📸 Screenshots

### Landing Page
> "Buy crypto. Every hour. On autopilot."

### Live Dashboard
> Real-time stats: total invested, cycles run, successful buys, ETH price, trade history

---

## 🔗 Resources

- [Zerion CLI GitHub](https://github.com/zeriontech/zerion-ai)
- [Zerion API Docs](https://developers.zerion.io)
- [Zerion Dashboard](https://dashboard.zerion.io)
- [Hackathon Listing](https://superteam.fun/earn/listing/build-a-autonomous-onchain-agent-using-zerion-cli)

---

## License

MIT
