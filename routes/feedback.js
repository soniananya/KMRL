const express = require("express");
const router = express.Router();

const { submitFeedback } = require("../controllers/feedback");
const { auth } = require("../middlewares/auth");

router.post("/feedback", auth, submitFeedback);

module.exports = router;
