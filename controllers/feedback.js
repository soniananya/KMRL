const Feedback = require("../models/Feedback");
const mongoose = require("mongoose");
const User = require("../models/User");
const Document = require("../models/Document");

// Submit feedback for correction/training
exports.submitFeedback = async (req, res) => {
    try {
        const { documentId, userId, feedbackType, originalValue, correctedValue } = req.body;

        if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Valid documentId is required" 
            });
        }
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Valid userId is required" 
            });
        }
        if (!["classification", "summary", "routing"].includes(feedbackType)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid feedback type" 
            });
        }
        if (!correctedValue) {
            return res.status(400).json({ 
                success: false, 
                message: "Corrected value is required" 
            });
        }

        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        const docExists = await Document.exists({ _id: documentId });
        if (!docExists) {
            return res.status(404).json({ 
                success: false, 
                message: "Document not found" 
            });
        }

        const feedback = await Feedback.create({
           documentId,
           userId,
           feedbackType,
           originalValue: originalValue || null,
           correctedValue,
           createdAt: new Date()
        });

        res.status(201).json({ 
            success: true, 
            feedback, 
            message: "Feedback submitted successfully" 
        });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({
            success: false, 
            message: "Failed to submit feedback", 
            error: error.message 
        });
    }
};