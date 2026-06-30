const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import du moteur de pricing (Christen)
const calculerDevis = require('./pricing/calculer_devis');

// Route : calculer un devis
app.post('/api/pricing/calculate', (req, res) => {
  try {
    const params = req.body;
    const result = calculerDevis(params);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route : statut de l'agent (Ronel)
console.log("✅ Enregistrement de la route /api/agent/chat");
app.post('/api/agent/chat', async (req, res) => {
  const webhook = process.env.N8N_CHAT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
  if (!webhook) {
    return res.status(404).json({ error: 'N8N chat webhook not configured on server.' });
  }

  let fetcher = global.fetch || require('node-fetch');
  if (!fetcher) {
    try {
      fetcher = require('node-fetch');
    } catch (e) {
      return res.status(500).json({ error: 'No fetch available on server. Install node-fetch or use Node 18+.' });
    }
  }

  try {
    const upstream = await fetcher(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: req.body?.prompt ?? req.body?.message ?? '',
        message: req.body?.message ?? req.body?.prompt ?? '',
      }),
    });

    const text = await upstream.text();
    try {
      const json = JSON.parse(text);
      return res.status(upstream.status).json(json);
    } catch (e) {
      return res.status(upstream.status).send(text);
    }
  } catch (error) {
    return res.status(502).json({ error: error.message || String(error) });
  }
});

// Proxy endpoint for dashboard metrics — fetches from n8n webhook configured server-side
app.get('/api/agent/dashboard', async (req, res) => {
  const webhook = process.env.N8N_DASHBOARD_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
  if (!webhook) {
    return res.status(404).json({ error: 'N8N dashboard webhook not configured on server.' });
  }

  // Try to use global fetch, otherwise fall back to node-fetch if available
  let fetcher = global.fetch;
  if (!fetcher) {
    try {
      // node-fetch v2/v3
      fetcher = require('node-fetch');
    } catch (e) {
      return res.status(500).json({ error: 'No fetch available on server. Install node-fetch or use Node 18+.' });
    }
  }

  try {
    const upstream = await fetcher(webhook, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const text = await upstream.text();
    try {
      const json = JSON.parse(text);
      return res.json(json);
    } catch (e) {
      // not json, return raw
      return res.send(text);
    }
  } catch (error) {
    return res.status(502).json({ error: error.message || String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend Neotravel démarré sur http://localhost:${PORT}`);
});