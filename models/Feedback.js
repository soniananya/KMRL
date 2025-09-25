const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({
    documentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Document", 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    feedbackType: { 
        type: String, 
        enum: ["classification", "summary", "routing"] 
    },
    originalValue: {
        type: String,
    },
    correctedValue: {
        type: String,
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
