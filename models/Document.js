const mongoose = require('mongoose');
const documentSchema = new mongoose.Schema({
    fileId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "File", required: true 
    },
    content: { 
        type: String 
    }, // full extracted text
    summary: { 
        type: String 
    }, // AI-generated summary
    embeddings: { 
        type: [Number] 
    }, // vector representation for semantic search
    categories: [{ 
        type: String 
    }], // classification tags (e.g. "finance", "legal")
    keywords: [{ 
        type: String 
    }], 
    createdAt: { 
        type: Date, default: Date.now 
    }
});

module.exports = mongoose.model("Document", documentSchema);