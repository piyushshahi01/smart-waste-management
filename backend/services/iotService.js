const admin = require("firebase-admin");
const db = require("../config/firebase");
const Pickup = require("../models/Pickup");
const User = require("../models/User");

const monitorBins = () => {
    console.log("🚀 IoT Auto-Dispatching Service Started...");

    const binRef = db.ref("/"); // Listening to root for all bins

    binRef.on("value", async (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Iterate through all bins (bin1, bin2, etc.)
        for (const binKey in data) {
            const binData = data[binKey];

            // Calculate fill percentage if not provided by hardware
            const fillLevel = binData.fill || Math.max(0, Math.min(100, ((13.0 - binData.distance) / 13.0) * 100));

            if (fillLevel > 80) {
                console.log(`⚠️ Bin ${binKey} is full (${fillLevel.toFixed(1)}%). Checking for existing pickups...`);

                // 1. Check if a pending pickup already exists for this bin location
                const location = binData.location || binKey;
                const existingPickup = await Pickup.findOne({
                    location: location,
                    status: { $in: ["Pending", "Assigned"] }
                });

                if (!existingPickup) {
                    console.log(`🚛 Auto-dispatching for ${location}...`);

                    // 2. Find an available collector (just picking the first one for now, could be smarter)
                    const collector = await User.findOne({ role: "collector" });

                    if (collector) {
                        try {
                            const newPickup = new Pickup({
                                userId: collector._id, // System assignment
                                wasteType: "Smart Bin (Auto)",
                                address: location,
                                date: new Date(),
                                timeSlot: "Immediate",
                                status: "Assigned",
                                assignedCollectorId: collector._id
                            });

                            await newPickup.save();
                            console.log(`✅ Pickup assigned to ${collector.name} for ${location}`);
                        } catch (err) {
                            console.error("❌ Failed to create auto-pickup:", err);
                        }
                    } else {
                        console.log("❌ No collectors found to assign.");
                    }
                } else {
                    console.log(`✅ Pickup already active for ${location}`);
                }
            }
        }
    });
};

module.exports = { monitorBins };
