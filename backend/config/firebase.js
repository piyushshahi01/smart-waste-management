const admin = require("firebase-admin");

let serviceAccount;
try {
    serviceAccount = require("./firebase-key.json");
} catch (e) {
    // If file doesn't exist (production), use environment variables
    serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL
    };
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://smart-waste-management-e1235-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

module.exports = db;
