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
        console.log('Access Token:', accessToken.access_token);
    })
    .catch((err) => {
        // console.error('Error generating access token:', err);
    });

export const sendNotification = (message) => {

    try{

        console.log(message, 'message');
        // send message
        admin
            .messaging()
            .sendEachForMulticast(message)
            .then((response) => {
                console.log(
                    'Successfully sent firebase message:',
                    response,
                    response.responses[0].error,
                );
            })
            .catch((error) => {
                console.log('Error sending firebase message:', error);
            });
            
        }catch(error){
            console.log("sendNotification erro---",error)
        }
    }; 

