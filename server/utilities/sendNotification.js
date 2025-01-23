import admin from 'firebase-admin';
import fireBasePushNotification from '../../config/fireBasePushNotification.js';

export const firebase = admin.initializeApp({
    credential: admin.credential.cert(fireBasePushNotification),
});

// Generate an access token
admin.credential
    .cert(fireBasePushNotification)
    .getAccessToken()
    .then((accessToken) => {
        // console.log('Access Token:', accessToken.access_token);
    })
    .catch((err) => {
        // console.error('Error generating access token:', err);
    });

export const sendNotification = (message) => {
    console.log(message, 'message');
    // send message
    return admin
        .messaging()
        .sendEachForMulticast(message)
        .then((response) => {
            console.log(
                'Successfully sent firebase message:',
                JSON.stringify(response),
            );
        })
        .catch((error) => {
            console.log('Error sending firebase message:', error);
        });
};
