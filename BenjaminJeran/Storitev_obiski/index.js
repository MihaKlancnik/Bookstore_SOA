/* const express = require("express");
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
 */


const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");

console.log('Mongo URI:', process.env.MONGO_URL);

const app = express();
const PORT = 5000;

// MongoDB Connection URL - nevem zaka ne dela prek env
const mongoUrl = MONGO_URL
const dbName = "Projekt_SOA";
const collectionName = "views";

let db;

// Connect to MongoDB
async function connectToMongo() {
    try {
        const client = await MongoClient.connect(mongoUrl);
        db = client.db(dbName);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log visit route
app.post("/log-visit", async (req, res) => {
    try {
        const { page } = req.body;
        
        if (!page) {
            return res.status(400).json({ error: "Page is required" });
        }

        // Get the views collection
        const collection = db.collection(collectionName);

        // Update or create the stats document
        const result = await collection.updateOne(
            { _id: "visitStats" },
            {
                $inc: {
                    totalVisits: 1,
                    [`pageVisits.${page}`]: 1
                }
            },
            { upsert: true }
        );

        // Fetch updated stats
        const updatedStats = await collection.findOne({ _id: "visitStats" });

        res.json({
            message: "Visit logged successfully",
            stats: updatedStats
        });
    } catch (error) {
        console.error("Error logging visit:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get stats route
app.get("/stats", async (req, res) => {
    try {
        const collection = db.collection(collectionName);
        const stats = await collection.findOne({ _id: "visitStats" });
        
        if (!stats) {
            return res.json({
                totalVisits: 0,
                pageVisits: {}
            });
        }

        res.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start server
async function startServer() {
    await connectToMongo();
    
    app.listen(PORT, () => {
        console.log(`Visit tracker server running on http://localhost:${PORT}`);
    });
}

// Handle errors and cleanup
process.on("SIGINT", async () => {
    try {
        await client.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
    } catch (error) {
        console.error("Error during cleanup:", error);
        process.exit(1);
    }
});

startServer().catch(console.error);