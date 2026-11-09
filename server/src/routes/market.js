import express from 'express';
import { readDB } from '../db.js';

const router = express.Router();

// In-memory cache for fast, non-blocking delivery
let cachedMarketData = {
  updatedAt: new Date().toISOString(),
  rates: {
    BTC: { price: 88450, change24h: 1.45, symbol: 'BTC', name: 'BITCOIN' },
    ETH: { price: 2435, change24h: -0.52, symbol: 'ETH', name: 'ETHEREUM' },
    SOL: { price: 184.5, change24h: 4.12, symbol: 'SOL', name: 'SOLANA' },
    GT: { price: 1200, amount: 5200, change24h: 12.4, symbol: 'GT', name: 'GT' }
  }
};
let lastFetchTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds

async function refreshMarketPrices() {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_TTL_MS) {
    return cachedMarketData;
  }

  try {
    const products = ['BTC-USD', 'ETH-USD', 'SOL-USD'];
    const fetchPromises = products.map(async (product) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`https://api.exchange.coinbase.com/products/${product}/ticker`, {
          headers: { 'User-Agent': 'GT-Network/1.0' },
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const price = parseFloat(data.price);
          const open24h = parseFloat(data.open_24h || data.price);
          const change24h = open24h > 0 ? ((price - open24h) / open24h) * 100 : 0;
          return { product, price, change24h: parseFloat(change24h.toFixed(2)) };
        }
      } catch (err) {
        // fallback to spot price if exchange ticker fails
        try {
          const controller2 = new AbortController();
          const timeout2 = setTimeout(() => controller2.abort(), 3000);
          const res2 = await fetch(`https://api.coinbase.com/v2/prices/${product}/spot`, {
            headers: { 'User-Agent': 'GT-Network/1.0' },
            signal: controller2.signal
          });
          clearTimeout(timeout2);
          if (res2.ok) {
            const data2 = await res2.json();
            const price = parseFloat(data2.data?.amount);
            return { product, price, change24h: 0 };
          }
        } catch (_) {}
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);
    results.forEach((item) => {
      if (!item) return;
      if (item.product === 'BTC-USD') {
        cachedMarketData.rates.BTC.price = item.price;
        if (item.change24h !== 0) cachedMarketData.rates.BTC.change24h = item.change24h;
      } else if (item.product === 'ETH-USD') {
        cachedMarketData.rates.ETH.price = item.price;
        if (item.change24h !== 0) cachedMarketData.rates.ETH.change24h = item.change24h;
      } else if (item.product === 'SOL-USD') {
        cachedMarketData.rates.SOL.price = item.price;
        if (item.change24h !== 0) cachedMarketData.rates.SOL.change24h = item.change24h;
      }
    });

    cachedMarketData.updatedAt = new Date().toISOString();
    lastFetchTime = now;
  } catch (err) {
    console.error('Error refreshing market prices:', err.message);
  }

  return cachedMarketData;
}

// GET /api/market/crypto - Public endpoint for live crypto overview
router.get('/crypto', async (req, res) => {
  try {
    // Read current platform settings if GT amount/price is configured
    const db = readDB();
    const settings = db?.settings || {};
    const gtValuation = Number(settings.gtTokenPrice || 1200);
    const gtSupplyDisplay = Number(settings.gtDisplaySupply || 5200);

    cachedMarketData.rates.GT = {
      price: gtValuation,
      amount: gtSupplyDisplay,
      change24h: 12.4,
      symbol: 'GT',
      name: 'GT'
    };

    // Trigger async refresh if cache expired (non-blocking)
    refreshMarketPrices().catch(() => {});

    return res.json({
      success: true,
      updatedAt: cachedMarketData.updatedAt,
      rates: cachedMarketData.rates
    });
  } catch (error) {
    return res.json({
      success: true,
      updatedAt: cachedMarketData.updatedAt,
      rates: cachedMarketData.rates
    });
  }
});

export default router;

