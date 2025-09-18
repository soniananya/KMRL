const Document = require("../models/Document");
const File = require("../models/File");
const mongoose = require("mongoose");

// Placeholder for AI enrichment utilities
async function extractTextFromFile(fileUrl) {
    // Implement OCR/parsing via external service or library
    return "Extracted full text from file";
}
async function generateSummary(text, role) {
    // Implement your LLM/AI summary generation logic here with role-awareness
    return "Generated summary for document";
}
async function generateEmbeddings(text) {
    // Use e.g. a multilingual embedding model and return float vector array
    return [0.1, 0.2, 0.3]; // dummy example
}

// POST /documents - create + enrich document from uploaded file
exports.createDocument = async (req, res) => {
    try {
        const { fileId, role } = req.body;
        if (!fileId || !mongoose.isValidObjectId(fileId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Valid fileId is required" 
            });
        }

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ 
                success: false, 
                message: "File not found" 
            });
        }

        // Extract full text from file URL (Supabase public URL)
        const fullText = await extractTextFromFile(file.fileUrl);

        // Generate summary based on role and extracted text
        const summary = await generateSummary(fullText, role);

        // Generate embeddings vector for semantic search
        const embeddings = await generateEmbeddings(fullText);

        const document = await Document.create({
            fileId,
            content: fullText,
            summary,
            embeddings,
            categories: [], // Categorization logic - can be added later
            keywords: [],   // Keyword extraction logic
            createdAt: new Date(),
        });

        res.status(201).json({
            success: true,
            document,
            message: "Document created and enriched successfully"
        });
    } catch (error) {
        console.error("Error creating document:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create document", 
            error: error.message 
        });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).populate("fileId");
        if (!document) {
            return res.status(404).json({ 
                success: false, 
                message: "Document not found" 
            });
        }
        res.json({ success: true, document });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error retrieving document", 
            error: error.message 
        });
    }
};
