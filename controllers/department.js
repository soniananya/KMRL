const Department = require("../models/Department");
const mongoose = require("mongoose");

exports.listDepartments = async (req, res) => {
    try {
        const departments = await Department.find().populate("head", "name email role");
        res.json({ success: true, departments });
    } catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch departments", 
            error: error.message 
        });
    }
};

// Create a new department (admin only)
exports.createDepartment = async (req, res) => {
    try {
        const { name, description, head } = req.body;

        if (!name) {
            return res.status(400).json({ 
                success: false, 
                message: "Department name is required" 
            });
        }

        // Validate head user ID if provided
        if (head) {
            if (!mongoose.Types.ObjectId.isValid(head)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid head user ID" 
                });
            }
            const userExists = await User.exists({ _id: head });
            if (!userExists) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Head user not found" 
                });
            }
        }

        const existing = await Department.findOne({ name });
        if (existing) {
            return res.status(409).json({ 
                success: false, 
                message: "Department name already exists" 
            });
        }

        const department = await Department.create({
            name,
            description: description || "",
            head,
            createdAt: new Date(),
        });

        res.status(201).json({ 
            success: true, 
            department, 
            message: "Department created successfully" 
        });

    } catch (error) {
        console.error("Error creating department:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create department", 
            error: error.message 
        });
    }
};
