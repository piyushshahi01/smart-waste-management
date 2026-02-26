const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/waste-management")
    .then(async () => {
        console.log("Connected to MongoDB for clearing.");

        // Clear Waste collection
        const Waste = require('./models/Waste');
        if (Waste) {
            await Waste.deleteMany({});
            console.log("Waste data cleared.");
        }

        mongoose.connection.close();
    })
    .catch(err => console.error(err));
