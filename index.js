// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const crypto = require("crypto");
// const Joi = require("joi");

// const app = express();
// const PORT = 5000;

// // Middleware
// app.use(cors()); 
// app.use(express.json());

// // MongoDB Schema & Model
// const eventSchema = new mongoose.Schema({
//   eventType: { type: String, required: true },
//   timestamp: { type: Date, required: true },
//   sourceAppId: { type: String, required: true },
//   dataPayload: { type: Object, default: {} },
//   previousHash: { type: String, default: null },
//   hash: { type: String, required: true },
// });

// const Event = mongoose.model("Event", eventSchema);

// // Connect to MongoDB
// mongoose
//   .connect(
//     "mongodb+srv://abishek1071996:vpoLByU8CZf9SBiK@cluster0.mtbzjg0.mongodb.net/estate?retryWrites=true&w=majority&appName=Cluster0",
//     { useNewUrlParser: true, useUnifiedTopology: true }
//   )
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Helper function to calculate hash of event
// const calculateHash = (event) => {
//   return crypto
//     .createHash("sha256")
//     .update(JSON.stringify(event))
//     .digest("hex");
// };

// // Routes
// app.post("/api/events", async (req, res) => {
//   try {
//     const { eventType, timestamp, sourceAppId, dataPayload } = req.body;

//     // Validate request data using Joi
//     const schema = Joi.object({
//       eventType: Joi.string().required(),
//       timestamp: Joi.date().iso().required(), // Ensure ISO 8601 date format
//       sourceAppId: Joi.string().required(),
//       dataPayload: Joi.object().optional(),
//     });

//     const { error } = schema.validate(req.body);
//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }

//     // Get previous log hash
//     const previousEvent = await Event.findOne().sort({ timestamp: -1 });
//     const previousHash = previousEvent ? previousEvent.hash : null;

//     // Create new event
//     const newEvent = new Event({
//       eventType,
//       timestamp: new Date(timestamp), // Ensure timestamp is converted to a Date object
//       sourceAppId,
//       dataPayload,
//       previousHash,
//       hash: calculateHash({ eventType, timestamp, sourceAppId, dataPayload, previousHash }),
//     });

//     // Save the log
//     await newEvent.save();
//     res.status(201).json({ message: "Event logged successfully", event: newEvent });
//   } catch (error) {
//     console.error("Error logging event:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.get("/api/events", async (req, res) => {
//   const { page = 1, limit = 10 } = req.query;
//   try {
//     const events = await Event.find()
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ timestamp: -1 });

//     const totalEvents = await Event.countDocuments();
//     res.status(200).json({
//       events,
//       pagination: {
//         total: totalEvents,
//         page: Number(page),
//         pages: Math.ceil(totalEvents / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching events:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const Joi = require("joi");
require("dotenv").config(); // Load environment variables

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

// MongoDB Schema & Model
const eventSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true },
  sourceAppId: { type: String, required: true },
  dataPayload: { type: Object, default: {} },
  previousHash: { type: String, default: null },
  hash: { type: String, required: true },
});

const Event = mongoose.model("Event", eventSchema);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  });

// Helper function to calculate hash of event
const calculateHash = (event) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(event))
    .digest("hex");
};

// Routes

// POST: Add a new event log
app.post("/api/events", async (req, res) => {
  try {
    const { eventType, timestamp, sourceAppId, dataPayload } = req.body;

    // Validate request data using Joi
    const schema = Joi.object({
      eventType: Joi.string().required(),
      timestamp: Joi.date().iso().required(), // Ensure ISO 8601 date format
      sourceAppId: Joi.string().required(),
      dataPayload: Joi.object().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get the previous log's hash
    const previousEvent = await Event.findOne().sort({ timestamp: -1 });
    const previousHash = previousEvent ? previousEvent.hash : null;

    // Create new event
    const newEvent = new Event({
      eventType,
      timestamp: new Date(timestamp), // Ensure timestamp is converted to a Date object
      sourceAppId,
      dataPayload,
      previousHash,
      hash: calculateHash({ eventType, timestamp, sourceAppId, dataPayload, previousHash }),
    });

    // Save the log
    await newEvent.save();
    res.status(201).json({ message: "Event logged successfully", event: newEvent });
  } catch (error) {
    console.error("Error logging event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET: Fetch event logs with pagination
app.get("/api/events", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const events = await Event.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ timestamp: -1 });

    const totalEvents = await Event.countDocuments();
    res.status(200).json({
      events,
      pagination: {
        total: totalEvents,
        page: Number(page),
        pages: Math.ceil(totalEvents / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Default Route
app.get("/", (req, res) => {
  res.status(200).send("Event Logging Backend is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});