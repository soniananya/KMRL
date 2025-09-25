const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
    filename: { 
        type: String, 
        required: true 
    },
    fileUrl: { 
        type: String, 
        required: true 
    },
    fileType: { 
        type: String, 
        enum: ["pdf", "image", "docx"], 
        required: true 
    },
    source: { 
        type: String, 
        enum: ["email", "whatsapp", "scan", "manual"], 
        required: true 
    },
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    status: { 
        type: String, 
        enum: ["uploaded", "processing", "completed", "error"], 
        default: "uploaded" 
    },
    metadata: {
        size: Number,
        pages: Number,
        language: [String], // e.g. ["en", "ml"]
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("File", fileSchema);