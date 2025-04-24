const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Dossier de stockage
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Routes API
app.post('/api/invoices', (req, res) => {
  try {
    // Validation côté serveur
    if (!req.body.invoiceNumber) {
      return res.status(400).json({ error: 'Le numéro de facture est requis' });
    }

    const invoiceData = {
      ...req.body,
      submittedAt: new Date().toISOString(),
      status: 'pending_verification'
    };

    // Sauvegarde dans un fichier (pourrait être une base de données)
    const fileName = `invoice_${invoiceData.invoiceNumber}_${Date.now()}.json`;
    fs.writeFileSync(path.join(DATA_DIR, fileName), JSON.stringify(invoiceData, null, 2));

    res.status(201).json({
      message: 'Facture enregistrée avec succès',
      invoiceId: fileName.replace('.json', '')
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour la vérification (accès réservé)
app.get('/api/invoices/:id', (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath));
      res.json(data);
    } else {
      res.status(404).json({ error: 'Facture non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur backend en cours d'exécution sur http://localhost:${PORT}`);
});