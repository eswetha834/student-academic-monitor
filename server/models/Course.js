const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    department: { type: String },
    teacher: { type: String }
});

module.exports = mongoose.model("Course", courseSchema);
