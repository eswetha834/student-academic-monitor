const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, required: true }, // PDF, PPT, Video, etc.
    filePath: { type: String }, // Path to uploaded file on server
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);
