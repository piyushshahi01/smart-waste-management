const mongoose = require('mongoose');
const Reward = require('./models/Reward');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const rewards = [
    { title: 'Free Coffee', provider: 'Starbucks', points: 150, icon: 'Coffee', color: 'text-amber-600', bg: 'bg-amber-100', desc: 'Get a free tall coffee at any participating location.' },
    { title: 'Metro Pass', provider: 'City Transit', points: 300, icon: 'Train', color: 'text-blue-600', bg: 'bg-blue-100', desc: 'A free day pass for all city buses and subway lines.' },
    { title: 'Plant a Tree', provider: 'OneTreePlanted', points: 500, icon: 'TreePine', color: 'text-green-600', bg: 'bg-green-100', desc: 'We will plant a tree in your name in a deforested area.' },
    { title: '$10 Eco-Store Voucher', provider: 'WasteSync Market', points: 1000, icon: 'ShoppingBag', color: 'text-purple-600', bg: 'bg-purple-100', desc: 'A discount voucher for sustainable products in our store.' }
];

const seedRewards = async () => {
    try {
        await Reward.deleteMany();
        await Reward.insertMany(rewards);
        console.log('Rewards seeded successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedRewards();
