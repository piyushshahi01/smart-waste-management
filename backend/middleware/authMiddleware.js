const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization) {
        try {
            // Get token from header (handle both "Bearer token" and "token" formats)
            token = req.headers.authorization;
            if (token.startsWith("Bearer ")) {
                token = token.split(" ")[1];
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");

            // Get user from token
            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as an admin" });
    }
};

module.exports = { protect, admin };
