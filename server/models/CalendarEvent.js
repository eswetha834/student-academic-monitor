const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, enum: ["Exam", "Assignment", "Review", "Holiday", "Notice"], default: "Notice" },
    description: { type: String }
});

module.exports = mongoose.model("CalendarEvent", eventSchema);
