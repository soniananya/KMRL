const express = require('express');
const router = express.Router();

const User = require('../models/User');

const {sendOTP, signup, login} = require('../controllers/Auth');

const { auth, isAdmin, isReviewer, isEmployee, isAIAgent } = require('../middlewares/auth');

router.post('/auth/send-otp', sendOTP);
router.post('/auth/signup', signup);
router.post('/auth/login', login);

router.get('/auth/me', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
});

router.get('/users', auth, isAdmin, async (req, res) => {
    const users = await User.find();
    res.json({ users });
});

module.exports = router;