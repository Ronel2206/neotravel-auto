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
const { calculerDevis } = require('./pricing/calculer_devis');

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
app.post('/api/agent/chat', (req, res) => {
  // Pour l'instant, juste un echo (connecté plus tard à n8n)
  const { message } = req.body;
  res.json({ 
    reply: "Je suis l'agent Neotravel. Je suis en cours de développement.",
    status: "ok"
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend Neotravel démarré sur http://localhost:${PORT}`);
});