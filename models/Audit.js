const mongoose = require('mongoose');
const auditSchema = new mongoose.Schema({
    action: { 
        type: String, 
        required: true 
    }, // e.g. "upload", "delete", "approve"
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    documentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Document" 
    },
    fileId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "File" 
    },
    details: { 
        type: Object 
    },
    timestamp: { 
        type: Date, default: Date.now 
    }
});

module.exports = mongoose.model("Audit", auditSchema);