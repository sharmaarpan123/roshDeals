import admin from 'firebase-admin';
import fireBasePushNotification from '../../config/fireBasePushNotification.js';

let firebase;

try {
    firebase = admin.initializeApp({
        credential: admin.credential.cert(fireBasePushNotification),
    });
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

// Generate an access token
(async () => {
    try {
        const credential = admin.credential.cert(fireBasePushNotification);
        const accessToken = await credential.getAccessToken();
        // console.log('Access Token:', accessToken.access_token);
    } catch (error) {
        console.error('Error generating access token:', error);
    }
})();

export const sendNotification = async (message) => {
    try {
        console.log(message, 'message');
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log('Successfully sent firebase message:', JSON.stringify(response));
        return response;
    } catch (error) {
        console.error('Error sending firebase message:', error);
        throw error; // Rethrow the error if needed
    }
};
