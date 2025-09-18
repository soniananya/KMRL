const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = (req, res, next) => {
    let cookies = req.cookies || {};
    let token = req.body.token 
        || cookies.token
        || (req.headers["authorization"]?.startsWith("Bearer ") ? req.headers["authorization"].slice(7) : null);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token not found",
        });
    }
    try {
        let payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (e) {
        console.error("JWT verification failed:", e.message);
        return res.status(401).json({
            success: false,
            message: "Token is invalid or expired",
        });
    }
};

exports.isAdmin = (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "This is a protected route for Admin",
            });
        }
        next();
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Could not authorize access for Admin",
        });
    }
};

exports.isReviewer = (req, res, next) => {
    try {
        if (req.user.role !== "reviewer") {
            return res.status(403).json({
                success: false,
                message: "This is a protected route for Reviewer",
            });
        }
        next();
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Could not authorize access for Reviewer",
        });
    }
};

exports.isEmployee = (req, res, next) => {
    try {
        if (req.user.role !== "employee") {
            return res.status(403).json({
                success: false,
                message: "This is a protected route for Employee",
            });
        }
        next();
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Could not authorize access for Employee",
        });
    }
};

exports.isAIAgent = (req, res, next) => {
    try {
        if (req.user.role !== "ai_agent") {
            return res.status(403).json({
                success: false,
                message: "This is a protected route for AI Agent",
            });
        }
        next();
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Could not authorize access for AI Agent",
        });
    }
};