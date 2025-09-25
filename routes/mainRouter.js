const router = require("express").Router();

const userRoutes = require("./user");
const fileRoutes = require("./file");
const documentRoutes = require("./document");
const departmentRoutes = require("./department");
const workflowRoutes = require("./workflow");
const feedbackRoutes = require("./feedback");
const auditRoutes = require("./audit");

router.use("/auth", userRoutes);
router.use("/files", fileRoutes);
router.use("/documents", documentRoutes);
router.use("/departments", departmentRoutes);
router.use("/workflows", workflowRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/audit", auditRoutes);

module.exports = router; 