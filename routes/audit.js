const express = require("express");
const router = express.Router();

const { listAuditLogs } = require("../controllers/audit");
const { auth, isAdmin } = require("../middlewares/auth");

router.get("/audit", auth, isAdmin, listAuditLogs);

module.exports = router;