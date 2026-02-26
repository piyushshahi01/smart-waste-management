const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { name, email, password, passkey, vehicleNumber } = req.body;

        let role = "user";

        if (passkey === "admin123") {
            role = "admin";
        } else if (passkey === "pickup123") {
            role = "collector";
        }

        // check existing user
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // hash password
        const hashed = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashed,
            role,
            ...(role === 'collector' && vehicleNumber && { vehicleNumber })
        });

        await user.save();

        // generate token directly upon registration so they auto-login
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret123",
            { expiresIn: "7d" }
        );

        res.json({
            msg: "User registered successfully",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (err) {
        console.log("REGISTER ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, passkey } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

        if (user.role === "admin" && passkey !== "admin123") {
            return res.status(403).json({ msg: "Admin passkey required" });
        }

        if (user.role === "collector" && passkey !== "pickup123") {
            return res.status(403).json({ msg: "Collector passkey required" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret123",
            { expiresIn: "7d" }
        );

        res.json({ token, role: user.role, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        console.log("LOGIN ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getCollectors = async (req, res) => {
    try {
        const collectors = await User.find({ role: 'collector' }).select('-password');
        res.json(collectors);
    } catch (err) {
        console.log("GET COLLECTORS ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json(user);
    } catch (err) {
        console.log("GET ME ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
};
