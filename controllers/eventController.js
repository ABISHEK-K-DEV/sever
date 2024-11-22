const Event = require("../models/eventModel");
const { calculateHash } = require("../utils/hashUtils");
const Joi = require("joi");

exports.createEvent = async (req, res) => {
  try {
    const { eventType, timestamp, sourceAppId, dataPayload } = req.body;

    const schema = Joi.object({
      eventType: Joi.string().required(),
      timestamp: Joi.date().iso().required(),
      sourceAppId: Joi.string().required(),
      dataPayload: Joi.object().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const previousEvent = await Event.findOne().sort({ timestamp: -1 });
    const previousHash = previousEvent ? previousEvent.hash : null;

    const newEvent = new Event({
      eventType,
      timestamp: new Date(timestamp),
      sourceAppId,
      dataPayload,
      previousHash,
      hash: calculateHash({ eventType, timestamp, sourceAppId, dataPayload, previousHash }),
    });

    await newEvent.save();
    res.status(201).json({ message: "Event logged successfully", event: newEvent });
  } catch (error) {
    console.error("Error logging event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getEvents = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const events = await Event.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ timestamp: -1 });

    const totalEvents = await Event.countDocuments();
    res.status(200).json({
      events,
      pagination: { total: totalEvents, page: Number(page), pages: Math.ceil(totalEvents / limit) },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
