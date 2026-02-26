const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// routes
app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/api/iot-data", async (req, res) => {
    try {
        console.log(req.body);

        res.status(200).json({ message: "Data received" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/waste", require("./routes/wasteRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/centers", require("./routes/centerRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/bins", require("./routes/binRoutes"));
app.use("/api/pickups", require("./routes/pickupRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/iot", require("./routes/iotRoutes"));

// Start IoT Real-time monitoring service
require("./services/iotService").monitorBins();

app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);
