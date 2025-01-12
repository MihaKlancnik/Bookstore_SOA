
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;


app.use(bodyParser.json());
app.use(cors());

// Statistika obiskov - začasno shranjena v spremenljivki
let visitStats = { totalVisits: 0, pageVisits: {} };

// Beleženje obiska
app.post("/log-visit", (req, res) => {
  const { page } = req.body;
  if (!page) {
    return res.status(400).json({ error: "Page is required" });
  }

  visitStats.totalVisits += 1;
  visitStats.pageVisits[page] = (visitStats.pageVisits[page] || 0) + 1;

  res.json({ message: "Visit logged successfully", stats: visitStats });
});

// Pridobivanje statistike
app.get("/stats", (req, res) => {
  res.json(visitStats);
});

// Zaženemo strežnik
app.listen(PORT, () => {
  console.log(`Visit tracker server running on http://localhost:${PORT}`);
});