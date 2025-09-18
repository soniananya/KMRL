const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ["admin", "reviewer", "employee", "ai_agent"], 
        default: "employee" 
    },
    department: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("User", userSchema);