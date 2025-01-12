const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 5000;

// Define visit stats
let visitStats = { totalVisits: 0, pageVisits: {} };

// Define routes
app.post("/log-visit", (req, res) => {
  const { page } = req.body;
  if (!page) {
    return res.status(400).json({ error: "Page is required" });
  }

  visitStats.totalVisits += 1;
  visitStats.pageVisits[page] = (visitStats.pageVisits[page] || 0) + 1;

  res.json({ message: "Visit logged successfully", stats: visitStats });
});

app.get("/stats", (req, res) => {
  res.json(visitStats);
});

// Start server
app.listen(PORT, () => {
  console.log(`Visit tracker server running on http://localhost:${PORT}`);
});
