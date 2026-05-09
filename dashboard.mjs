/**
 * Dashboard + Landing Page server
 * Run: node dashboard.mjs
 * Open: http://localhost:3000         → landing page
 *       http://localhost:3000/dash    → live dashboard
 *       http://localhost:3000/api     → JSON data
 */

import http from "http";
import { StateManager } from "./src/state.mjs";
import { CONFIG } from "./src/agent.mjs";

const PORT = process.env.PORT || 3000;

// ── Landing Page ─────────────────────────────────────────────────────────────
const LANDING = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ZerionDCA — Autonomous Onchain Agent</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#080b10;--surface:#0f1520;--border:#1e2d40;--accent:#00d4ff;--accent2:#7b61ff;--text:#e8f4f8;--muted:#4a6080;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Syne',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;}
/* grid bg */
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:.3;pointer-events:none;}

/* NAV */
nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(8,11,16,.9);backdrop-filter:blur(12px);z-index:100;}
.logo{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:var(--accent);letter-spacing:-1px;}
.logo span{color:var(--text);}
nav a{color:var(--muted);text-decoration:none;font-size:14px;transition:color .2s;}
nav a:hover{color:var(--accent);}
.nav-links{display:flex;gap:32px;align-items:center;}
.btn-nav{background:var(--accent);color:#000;padding:8px 20px;border-radius:6px;font-weight:700;font-size:13px;}
.btn-nav:hover{background:#fff;color:#000;}

/* HERO */
.hero{min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px;position:relative;}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);padding:6px 16px;border-radius:20px;font-family:'Space Mono',monospace;font-size:12px;color:var(--accent);margin-bottom:32px;}
.hero-badge::before{content:'';width:6px;height:6px;background:var(--accent);border-radius:50%;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
h1{font-size:clamp(48px,8vw,96px);font-weight:800;line-height:.95;letter-spacing:-3px;margin-bottom:24px;}
h1 .line2{color:var(--accent);}
.hero-sub{font-size:18px;color:var(--muted);max-width:520px;line-height:1.6;margin-bottom:48px;}
.hero-actions{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;}
.btn-primary{background:var(--accent);color:#000;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;transition:transform .2s,box-shadow .2s;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,212,255,.4);}
.btn-secondary{border:1px solid var(--border);color:var(--text);padding:14px 32px;border-radius:8px;font-size:15px;text-decoration:none;transition:border-color .2s;}
.btn-secondary:hover{border-color:var(--accent);}

/* LIVE STATS */
.live-stats{display:flex;gap:32px;flex-wrap:wrap;justify-content:center;margin-top:64px;}
.stat{text-align:center;}
.stat-val{font-family:'Space Mono',monospace;font-size:32px;font-weight:700;color:var(--accent);}
.stat-lbl{font-size:12px;color:var(--muted);margin-top:4px;text-transform:uppercase;letter-spacing:.1em;}

/* HOW IT WORKS */
.section{padding:100px 48px;max-width:1100px;margin:0 auto;}
.section-label{font-family:'Space Mono',monospace;font-size:11px;color:var(--accent);letter-spacing:.2em;text-transform:uppercase;margin-bottom:16px;}
.section-title{font-size:clamp(32px,4vw,52px);font-weight:800;letter-spacing:-2px;margin-bottom:64px;}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;}
.step{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px;position:relative;overflow:hidden;transition:border-color .3s;}
.step:hover{border-color:var(--accent);}
.step::before{content:attr(data-n);position:absolute;top:-10px;right:16px;font-size:80px;font-weight:800;color:rgba(0,212,255,.05);line-height:1;font-family:'Space Mono',monospace;}
.step-icon{font-size:32px;margin-bottom:16px;}
.step h3{font-size:20px;font-weight:700;margin-bottom:8px;}
.step p{color:var(--muted);font-size:14px;line-height:1.6;}

/* TECH STACK */
.tech{padding:80px 48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
.tech-inner{max-width:1100px;margin:0 auto;}
.tech-grid{display:flex;flex-wrap:wrap;gap:16px;margin-top:40px;}
.tech-pill{background:var(--surface);border:1px solid var(--border);padding:10px 20px;border-radius:8px;font-family:'Space Mono',monospace;font-size:13px;color:var(--text);}

/* TERMINAL */
.terminal-wrap{padding:80px 48px;max-width:1100px;margin:0 auto;}
.terminal{background:#000;border:1px solid var(--border);border-radius:12px;overflow:hidden;}
.terminal-header{background:#1a1a1a;padding:12px 16px;display:flex;gap:8px;align-items:center;}
.dot{width:12px;height:12px;border-radius:50%;}
.dot-r{background:#ff5f56;}.dot-y{background:#ffbd2e;}.dot-g{background:#27c93f;}
.terminal-body{padding:24px;font-family:'Space Mono',monospace;font-size:13px;line-height:1.8;}
.t-muted{color:#4a6080;}.t-green{color:#27c93f;}.t-cyan{color:#00d4ff;}.t-yellow{color:#ffbd2e;}

/* FOOTER */
footer{text-align:center;padding:48px;border-top:1px solid var(--border);color:var(--muted);font-size:13px;}
footer a{color:var(--accent);text-decoration:none;}
</style>
</head>
<body>

<nav>
  <div class="logo">Zerion<span>DCA</span></div>
  <div class="nav-links">
    <a href="#how">How it works</a>
    <a href="#tech">Tech</a>
    <a href="/dash" class="btn-nav">Live Dashboard →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-badge">🤖 Autonomous Onchain Agent — Frontier Hackathon</div>
  <h1>Buy crypto.<br><span class="line2">Every hour.</span><br>On autopilot.</h1>
  <p class="hero-sub">ZerionDCA is an autonomous agent that dollar-cost averages into ETH onchain — powered by Zerion CLI and the Zerion API.</p>
  <div class="hero-actions">
    <a href="/dash" class="btn-primary">Live Dashboard</a>
    <a href="https://github.com/zeriontech/zerion-ai" class="btn-secondary" target="_blank">Zerion CLI →</a>
  </div>
  <div class="live-stats" id="live-stats">
    <div class="stat"><div class="stat-val" id="s-spent">—</div><div class="stat-lbl">Total Invested</div></div>
    <div class="stat"><div class="stat-val" id="s-cycles">—</div><div class="stat-lbl">Cycles Run</div></div>
    <div class="stat"><div class="stat-val" id="s-eth">—</div><div class="stat-lbl">ETH Price</div></div>
    <div class="stat"><div class="stat-val" id="s-trades">—</div><div class="stat-lbl">Successful Buys</div></div>
  </div>
</section>

<section class="section" id="how">
  <div class="section-label">How it works</div>
  <div class="section-title">Three steps.<br>Fully autonomous.</div>
  <div class="steps">
    <div class="step" data-n="01">
      <div class="step-icon">📡</div>
      <h3>Fetch Prices</h3>
      <p>Every hour, the agent calls the Zerion API to get the current ETH price and your portfolio value. If prices dropped more than 20%, the circuit breaker activates and the cycle is skipped.</p>
    </div>
    <div class="step" data-n="02">
      <div class="step-icon">⚡</div>
      <h3>Execute Swap</h3>
      <p>The agent runs <code style="color:var(--accent);font-family:monospace">zerion swap base USDC ETH</code> via the Zerion CLI, which routes the trade through the best DEX on Base chain with minimal slippage.</p>
    </div>
    <div class="step" data-n="03">
      <div class="step-icon">📊</div>
      <h3>Log & Repeat</h3>
      <p>Every trade is logged with timestamp, amount, tx hash, and status. The agent persists state across restarts and shows a live dashboard with full trade history.</p>
    </div>
  </div>
</section>

<div class="tech" id="tech">
  <div class="tech-inner">
    <div class="section-label">Tech Stack</div>
    <div class="section-title" style="font-size:36px;margin-bottom:0">Built on Zerion</div>
    <div class="tech-grid">
      <div class="tech-pill">⚡ Zerion CLI</div>
      <div class="tech-pill">🔌 Zerion REST API v1</div>
      <div class="tech-pill">🔵 Base Chain</div>
      <div class="tech-pill">🟢 Node.js ESM</div>
      <div class="tech-pill">🔒 Agent Tokens</div>
      <div class="tech-pill">🛡️ Circuit Breaker</div>
      <div class="tech-pill">💾 Persistent State</div>
      <div class="tech-pill">🖥️ Live Dashboard</div>
    </div>
  </div>
</div>

<div class="terminal-wrap">
  <div class="terminal">
    <div class="terminal-header">
      <div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div>
    </div>
    <div class="terminal-body">
      <div><span class="t-muted">$</span> <span class="t-cyan">ZERION_API_KEY=zk_... node index.mjs</span></div>
      <div><span class="t-green">[INFO]</span> 🚀 Zerion DCA Agent starting</div>
      <div><span class="t-green">[INFO]</span>    Wallet  : dca-agent</div>
      <div><span class="t-green">[INFO]</span>    Budget  : $5/cycle</div>
      <div><span class="t-green">[INFO]</span>    Interval: 60 min</div>
      <div>&nbsp;</div>
      <div><span class="t-green">[INFO]</span> ━━━ Cycle #1 — 2026-05-09T10:00:00Z ━━━</div>
      <div><span class="t-green">[INFO]</span> 💼 Portfolio: $47.23</div>
      <div><span class="t-green">[INFO]</span>    ETH: $2312.40</div>
      <div><span class="t-green">[INFO]</span> 🛒 Buying $5.00 of ETH on base</div>
      <div><span class="t-green">[INFO]</span> ✅ Done | tx: 0x4fa2b3...</div>
      <div><span class="t-green">[INFO]</span> ✨ Cycle done — spent $5.00 | total $5.00</div>
    </div>
  </div>
</div>

<footer>
  Built for <a href="https://superteam.fun/earn/listing/build-a-autonomous-onchain-agent-using-zerion-cli" target="_blank">Frontier Hackathon</a> · 
  Powered by <a href="https://zerion.io" target="_blank">Zerion</a> · 
  <a href="/dash">Dashboard</a>
</footer>

<script>
async function loadStats() {
  try {
    const d = await fetch('/api').then(r => r.json());
    document.getElementById('s-spent').textContent = '$' + d.stats.totalSpentUSD.toFixed(2);
    document.getElementById('s-cycles').textContent = d.stats.totalCycles;
    document.getElementById('s-trades').textContent = d.stats.successfulTrades;
    const eth = d.stats.lastPrices?.ETH;
    document.getElementById('s-eth').textContent = eth ? '$' + eth.toLocaleString() : '—';
  } catch {}
}
loadStats();
setInterval(loadStats, 15000);
</script>
</body>
</html>`;

// ── Dashboard ─────────────────────────────────────────────────────────────────
const DASHBOARD = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ZerionDCA Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#080b10;--surface:#0f1520;--border:#1e2d40;--accent:#00d4ff;--green:#00e676;--red:#ff5252;--text:#e8f4f8;--muted:#4a6080;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Space Mono',monospace;background:var(--bg);color:var(--text);min-height:100vh;}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:.2;pointer-events:none;}

header{padding:20px 32px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,16,.95);position:sticky;top:0;z-index:10;}
.logo{font-size:16px;font-weight:700;color:var(--accent);}
.live-dot{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);}
.dot{width:8px;height:8px;background:var(--green);border-radius:50%;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
#ts{font-size:11px;color:var(--muted);}

.container{max-width:1200px;margin:0 auto;padding:32px;}
.grid4{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;}
.card-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.15em;margin-bottom:12px;}
.card-val{font-size:32px;font-weight:700;line-height:1;}
.card-sub{font-size:11px;color:var(--muted);margin-top:8px;}
.c-cyan .card-val{color:var(--accent);}
.c-green .card-val{color:var(--green);}
.c-purple .card-val{color:#7b61ff;}
.c-yellow .card-val{color:#ffbd2e;}

.section{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:24px;}
.section-hdr{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.15em;margin-bottom:20px;}
table{width:100%;border-collapse:collapse;}
th{text-align:left;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;padding:8px 12px;border-bottom:1px solid var(--border);}
td{padding:12px;border-bottom:1px solid rgba(30,45,64,.5);font-size:12px;}
tr:last-child td{border-bottom:none;}
.ok{color:var(--green);}.err{color:var(--red);}
.hash{color:var(--muted);font-size:11px;}
.empty{text-align:center;color:var(--muted);padding:48px;font-size:13px;}

.bar-row{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.bar-lbl{width:60px;font-size:12px;}
.bar-track{flex:1;background:rgba(0,212,255,.08);border-radius:4px;height:8px;overflow:hidden;}
.bar-fill{height:100%;background:linear-gradient(90deg,var(--accent),#7b61ff);border-radius:4px;transition:width .5s;}
.bar-pct{font-size:11px;color:var(--muted);width:40px;text-align:right;}
</style>
</head>
<body>
<header>
  <div class="logo">⚡ ZerionDCA Dashboard</div>
  <div style="display:flex;align-items:center;gap:24px;">
    <div class="live-dot"><div class="dot"></div> Live</div>
    <div id="ts"></div>
    <a href="/" style="color:var(--muted);font-size:12px;text-decoration:none;">← Landing</a>
  </div>
</header>

<div class="container">
  <div class="grid4" id="cards"></div>

  <div class="section">
    <div class="section-hdr">🎯 DCA Allocation</div>
    <div id="alloc"></div>
  </div>

  <div class="section">
    <div class="section-hdr">📜 Recent Trades</div>
    <div id="trades"></div>
  </div>
</div>

<script>
async function refresh() {
  const d = await fetch('/api').then(r=>r.json()).catch(()=>null);
  if (!d) return;

  document.getElementById('ts').textContent = new Date().toLocaleTimeString();
  const s = d.stats;

  document.getElementById('cards').innerHTML = \`
    <div class="card c-cyan"><div class="card-lbl">Total Invested</div><div class="card-val">$\${s.totalSpentUSD.toFixed(2)}</div><div class="card-sub">across all cycles</div></div>
    <div class="card c-purple"><div class="card-lbl">Cycles Run</div><div class="card-val">\${s.totalCycles}</div><div class="card-sub">\${s.skippedCycles} skipped</div></div>
    <div class="card c-green"><div class="card-lbl">Successful Buys</div><div class="card-val">\${s.successfulTrades}</div><div class="card-sub">\${s.failedTrades} failed</div></div>
    <div class="card c-yellow"><div class="card-lbl">ETH Price</div><div class="card-val">$\${s.lastPrices?.ETH ? Number(s.lastPrices.ETH).toLocaleString() : '—'}</div><div class="card-sub">last cycle</div></div>
  \`;

  document.getElementById('alloc').innerHTML = d.targets.map(t=>\`
    <div class="bar-row">
      <div class="bar-lbl">\${t.symbol}</div>
      <div class="bar-track"><div class="bar-fill" style="width:\${t.pct}%"></div></div>
      <div class="bar-pct">\${t.pct}%</div>
    </div>
  \`).join('') || '<div class="empty">No targets configured</div>';

  const trades = [...(d.trades||[])].reverse().slice(0,30);
  if (!trades.length) {
    document.getElementById('trades').innerHTML = '<div class="empty">No trades yet — agent is running...</div>';
  } else {
    document.getElementById('trades').innerHTML = '<table><thead><tr><th>Time</th><th>Token</th><th>Amount</th><th>Chain</th><th>Status</th><th>Tx Hash</th></tr></thead><tbody>'
      + trades.map(t=>\`<tr>
        <td>\${new Date(t.timestamp).toLocaleString()}</td>
        <td style="font-weight:700;color:var(--accent)">\${t.symbol}</td>
        <td>$\${(t.amountUSD||0).toFixed(2)}</td>
        <td>\${t.chain}</td>
        <td class="\${t.status==='success'?'ok':'err'}">\${t.status==='success'?'✅ OK':'❌ Fail'}</td>
        <td class="hash">\${t.txHash?t.txHash.slice(0,16)+'...':t.error?.slice(0,40)||'—'}</td>
      </tr>\`).join('')
      + '</tbody></table>';
  }
}
refresh();
setInterval(refresh, 10000);
</script>
</body>
</html>`;

// ── Server ────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (url === "/api") {
    const state = new StateManager();
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify({
      stats:   state.getStats(),
      trades:  state.getAllTrades(),
      targets: CONFIG.TARGETS,
    }));
    return;
  }

  if (url === "/dash") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(DASHBOARD);
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(LANDING);
});

server.listen(PORT, () => {
  console.log(`\n🌐 ZerionDCA Web`);
  console.log(`   Landing   → http://localhost:${PORT}`);
  console.log(`   Dashboard → http://localhost:${PORT}/dash`);
  console.log(`   API       → http://localhost:${PORT}/api\n`);
});
