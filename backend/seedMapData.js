const mongoose = require('mongoose');
const Bin = require('./models/Bin');
const Center = require('./models/Center');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const sampleBins = [
    { location: 'Sector 62, Noida', lat: 28.6273, lng: 77.3725, fillLevel: 45, gasLevel: 120, temperature: 28, status: 'Normal' },
    { location: 'Botanical Garden, Noida', lat: 28.5641, lng: 77.3391, fillLevel: 85, gasLevel: 450, temperature: 32, status: 'Full' },
    { location: 'Rajiv Chowk, Delhi', lat: 28.6328, lng: 77.2197, fillLevel: 20, gasLevel: 80, temperature: 26, status: 'Normal' },
    { location: 'Indirapuram, Ghaziabad', lat: 28.6385, lng: 77.3692, fillLevel: 92, gasLevel: 600, temperature: 42, status: 'Fire Risk' },
    { location: 'Sector 18, Noida', lat: 28.5708, lng: 77.3261, fillLevel: 65, gasLevel: 200, temperature: 30, status: 'Normal' }
];

const sampleCenters = [
    { name: 'Noida E-Waste Hub', lat: 28.6273, lng: 77.3725, type: 'E-Waste', status: 'Active' },
    { name: 'Delhi Plastic Recycle', lat: 28.6139, lng: 77.2090, type: 'Plastic', status: 'Active' },
    { name: 'NCR Bio-Compost', lat: 28.5355, lng: 77.3910, type: 'Organic', status: 'Maintenance' }
];

const seedMapData = async () => {
    try {
        await Bin.deleteMany();
        await Center.deleteMany();

        await Bin.insertMany(sampleBins);
        await Center.insertMany(sampleCenters);

        console.log('Map data seeded successfully with coordinates');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedMapData();
