const express = require("express");
const { createEvent, getEvents } = require("../controllers/eventController");

const router = express.Router();

router.post("/api/events", createEvent);
router.get("/api/events", getEvents);

module.exports = router;
