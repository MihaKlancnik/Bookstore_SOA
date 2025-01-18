require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const notificationRoutes = require("./routes/notifications");

const app = express();
app.use(cors());
const PORT = 4003;
app.use(bodyParser.json());

app.use("/api/notifications", notificationRoutes);


app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
});
