const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    text: String,
    type: String, // Exam, Notice, Urgent
    target: String, // All Students, Specific, etc.
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Announcement", announcementSchema);
