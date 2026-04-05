const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    title: String,
    subject: String,
    category: { type: String, default: "Assignment" }, // "Assignment", "Project"
    instructions: String,
    deadline: String,
    status: { type: String, default: "Pending" },
    submissions: { type: Number, default: 0 },
    submittedFiles: [{
        studentId: String,
        studentName: String,
        filePath: String,
        submittedAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model("Assignment", assignmentSchema);
