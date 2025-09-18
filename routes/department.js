const express = require("express");
const router = express.Router();

const { listDepartments, createDepartment } = require("../controllers/department");
const { auth, isAdmin } = require("../middlewares/auth");

router.get("/departments", auth, listDepartments);
router.post("/departments", auth, isAdmin, createDepartment);

module.exports = router;