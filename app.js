const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors({
  origin: [
    'https://client-1-c2zm4pmwc-abisheks-projects-d2e76424.vercel.app',
    'https://client-1-ten.vercel.app'
  ]
}));
app.use(express.json());

app.use("/", eventRoutes);
app.get("/", (req, res) => res.send("Event Logging Backend is running"));

module.exports = app;
