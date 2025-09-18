const express = require("express");
const router = express.Router();

const { createWorkflow, getWorkflowById } = require("../controllers/workflow");
const { auth, isReviewer } = require("../middlewares/auth");

router.post("/workflows", auth, isReviewer, createWorkflow);
router.get("/workflows/:id", auth, getWorkflowById);

module.exports = router;