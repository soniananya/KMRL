const mongoose = require('mongoose');
const workflowSchema = new mongoose.Schema({
    documentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Document", 
        required: true 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }, // reviewer or dept
    department: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Department" 
    }],
    status: { 
        type: String, 
        enum: ["pending", "in_review", "approved", "rejected", "archived"], 
        default: "pending" 
    },
    remarks: {
        type: String,
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Workflow", workflowSchema);