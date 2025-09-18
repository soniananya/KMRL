const Audit = require("../models/Audit");

// Get audit logs (admin only)
exports.listAuditLogs = async (req, res) => {
    try {
        const logs = await Audit.find()
        .sort({ timestamp: -1 })
        .populate("userId", "name email role")
        .populate("documentId", "title")
        .populate("fileId", "filename");

        res.json({
            success: true,
            logs
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch audit logs",
            error: error.message
        });
    }
};
