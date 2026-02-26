const express = require("express");
const router = express.Router();
const { register, login, getCollectors, getMe } = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/collectors", getCollectors); // Simple route to fetch driver list
router.get("/me", auth, getMe);

module.exports = router;
