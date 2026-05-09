/**
 * Zerion REST API v1 client
 */

export class ZerionAPI {
  constructor(apiKey) {
    this.base    = "https://api.zerion.io/v1";
    this.headers = {
      accept: "application/json",
      authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    };
  }

  async _fetch(path, params = {}) {
    const url = new URL(this.base + path);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url.toString(), { headers: this.headers });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return res.json();
  }

  /** Get total portfolio USD value for a wallet address */
  async getPortfolio(address) {
    try {
      const data = await this._fetch(`/wallets/${encodeURIComponent(address)}/portfolio`);
      return { totalUSD: data?.data?.attributes?.total?.positions ?? 0 };
    } catch {
      return { totalUSD: 0 };
    }
  }

  /** Get current USD price of a token by symbol */
  async getPrice(symbol) {
    const data = await this._fetch("/fungibles", {
      "filter[search_query]": symbol,
      "sort": "-market_data.market_cap",
      "page[size]": "1",
      "currency": "usd",
    });
    const price = data?.data?.[0]?.attributes?.market_data?.price;
    if (!price) throw new Error(`No price data for ${symbol}`);
    return price;
  }

  /** Get wallet positions */
  async getPositions(address) {
    try {
      const data = await this._fetch(`/wallets/${encodeURIComponent(address)}/positions`, {
        "filter[position_types]": "wallet",
        "currency": "usd",
        "sort": "-value",
      });
      return (data?.data ?? []).map(p => ({
        symbol:    p.attributes?.fungible_info?.symbol,
        valueUSD:  p.attributes?.value ?? 0,
        quantity:  p.attributes?.quantity?.float ?? 0,
        price:     p.attributes?.price ?? 0,
        change24h: p.attributes?.changes?.percent_1d ?? 0,
      }));
    } catch {
      return [];
    }
  }
}
