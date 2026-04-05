const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    date: String,
    subject: String,
    status: String,
    remark: String
});

module.exports = mongoose.model("AttendanceRecord", attendanceSchema);
