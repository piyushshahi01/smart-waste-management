const webpush = require('web-push');
const dotenv = require('dotenv');

dotenv.config();

// Configure the VAPID details
webpush.setVapidDetails(
    'mailto:contact@wastesync.local',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

/**
 * Helper to send a push notification to a user's subscription
 * @param {Object} subscription - The pushSubscription object stored in DB
 * @param {Object} payload - Data to send ({ title, body, icon, url })
 */
const sendPushNotification = async (subscription, payload) => {
    try {
        if (!subscription) return;

        await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
        );
        console.log('Push notification sent successfully');
    } catch (err) {
        // A 410 or 404 means the user unsubscribed or their token expired
        if (err.statusCode === 410 || err.statusCode === 404) {
            console.log('Subscription has expired or is no longer valid.');
            // Ideally, we could delete this from the DB here if we passed the User object
        } else {
            console.error('Error sending push notification:', err);
        }
    }
};

module.exports = {
    webpush,
    sendPushNotification
};
