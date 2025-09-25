const File = require("../models/File");
const mongoose = require("mongoose");
const supabase = require("../config/supabase");

exports.uploadFile = async (req, res) => {
  try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "No file uploaded" 
            });
        }

        const { originalname, buffer, mimetype, size } = req.file;
        const fileName = req.body.filename || originalname;
        const fileType = req.body.fileType || mimetype;

        let fileTypeOfFile = null;
        if (fileType.includes("pdf")) fileTypeOfFile = "pdf";
        else if (fileType.includes("image")) fileTypeOfFile = "image";
        else if (fileType.includes("officedocument") || fileType.includes("msword") || fileType.includes("wordprocessingml")) {
        fileTypeOfFile = "docx";
        } else {
            return res.status(400).json({ 
                success: false, 
                message: "Unsupported file type" 
            });
        }

        // source is expected from req.body (e.g. "email", "whatsapp", "scan", "manual")
        const { source, metadata } = req.body;
        if (!source || !["email", "whatsapp", "scan", "manual"].includes(source)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid or missing source" 
            });
        }

        // Compose unique file path for Supabase upload
        const filePath = `uploads/${Date.now()}_${fileName}`;

        // Upload file buffer to Supabase
        const { data, error } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).upload(filePath, buffer, {
            contentType: fileType,
            upsert: false,
        });

        if (error) {
            throw new Error(`Supabase upload error: ${error.message}`);
        }

        // Get public URL of uploaded file
        const { publicURL, error: urlError } = supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).getPublicUrl(filePath);

        if (urlError) {
            throw new Error(`Supabase public URL error: ${urlError.message}`);
        }

        // Save info in MongoDB File document
        const fileDoc = await File.create({
        filename: fileName,
        fileUrl: publicURL,
        fileType,
        source,
        uploadedBy: req.user.id,
        status: "uploaded",
        metadata: {
            size,
            pages: metadata?.pages || null,
            language: metadata?.language || []
        },
        createdAt: new Date(),
        });

        res.status(201).json({
        success: true,
        file: fileDoc,
        message: "File uploaded and metadata saved successfully.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "File upload failed", 
            error: error.message 
        });
    }
};

exports.getFileById = async (req, res) => {
    try {
        const file = await File.findById(req.params.id).populate("uploadedBy", "name email role department");
        if (!file) {
            return res.status(404).json({ 
                success: false, 
                message: "File not found" 
            });
        }
        res.json({ 
            success: true, 
            file 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error retrieving file", 
            error: error.message 
        });
    }
};

// List files with optional filters
exports.listFiles = async (req, res) => {
    try {
        const filters = {};
        if (req.query.department) filters["metadata.department"] = req.query.department;
        if (req.query.fileType) filters.fileType = req.query.fileType;
        if (req.query.status) filters.status = req.query.status;

        const files = await File.find(filters).populate("uploadedBy", "name email");
        res.json({ 
            success: true, 
            files 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error listing files", 
            error: error.message 
        });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findByIdAndDelete(req.params.id);
        if (!file) {
            return res.status(404).json({ 
                success: false, 
                message: "File not found" 
            });
        }
        // Optional: implement Supabase storage deletion if needed

        res.json({ 
            success: true, 
            message: "File metadata deleted" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error deleting file", 
            error: error.message 
        });
    }
};
