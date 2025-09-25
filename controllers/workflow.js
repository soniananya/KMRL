const Workflow = require("../models/Workflow");
const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");

// Create a new workflow document (reviewer only)
exports.createWorkflow = async (req, res) => {
    try {
        const { documentId, assignedTo, department, status, remarks } = req.body;
        if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Valid documentId is required" 
            });
        }
        if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid assignedTo user ID" 
            });
        }

        if (department && !mongoose.Types.ObjectId.isValid(department)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid department ID" 
            });
        }

        // Validate status enum values if given
        const validStatuses = ["pending", "in_review", "approved", "rejected", "archived"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status value" 
            });
        }

        // Optional: Validate assignedTo user exists
        if (assignedTo) {
            const userExists = await User.exists({ _id: assignedTo });
            if (!userExists) {
                return res.status(404).json({ 
                    success: false, 
                    message: "AssignedTo user not found" 
                });
            }
        }

        // Optional: Validate department exists
        if (department) {
            const deptExists = await Department.exists({ _id: department });
            if (!deptExists) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Department not found" 
                });
            }
        }

        const workflow = await Workflow.create({
            documentId,
            assignedTo,
            department,
            status: status || "pending",
            remarks,
            updatedAt: new Date(),
        });

        res.status(201).json({ 
            success: true, 
            workflow, 
            message: "Workflow created successfully" 
        });

    } catch (error) {
        console.error("Error creating workflow:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create workflow", 
            error: error.message 
        });
    }
};

exports.getWorkflowById = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id)
            .populate("assignedTo", "name email role")
            .populate("department", "name description");
        if (!workflow) {
            return res.status(404).json({ 
                success: false, 
                message: "Workflow not found" 
            });
        }
        res.json({ success: true, workflow });
    } catch (error) {
        console.error("Error fetching workflow: ", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch workflow", 
            error: error.message 
        });
    }
};