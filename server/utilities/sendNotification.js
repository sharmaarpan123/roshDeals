import admin from 'firebase-admin';
import fireBasePushNotification from '../config/fireBasePushNotification.js';

export const firebase = admin.initializeApp({
    credential: admin.credential.cert(fireBasePushNotification),
});


// Generate an access token
admin.credential
    .cert(fireBasePushNotification)
    .getAccessToken()
    .then((accessToken) => {
        console.log('Access Token:', accessToken.access_token);
    })
    .catch((err) => {
        console.error('Error generating access token:', err);
    });

const sendNotification = (message) => {
    // send message
    admin
        .messaging()
        .send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
};


