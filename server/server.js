import './init-aliases.js';
import { config } from 'dotenv';
config();
import express from 'express';
import cors from 'cors';
import AuthRouter from './routes/AuthRouter.js';
import logger from 'morgan';
import path from 'path';
import mongoInit from './database/index.js';
import catchErrorHandler from './utilities/catchErrorHandler.js';
import AdminRouter from './routes/AdminRouter.js';
import { ROLE_TYPE_ENUM } from './utilities/commonTypes.js';
import AuthMiddleware from './utilities/AuthMiddleware.js';
import DealRouter from './routes/DealRouter.js';
import DealCategoryRouter from './routes/DealCategoryRouter.js';
import PlatFromRouter from './routes/PlatFromRouter.js';
import BrandRouter from './routes/BrandRouter.js';
import GetHomeResult from './controllers/GetHomeResult.js';
import activeDealByBrandAndCategory from './controllers/getDeals/activeDealByBrandAndCategory.js';
import UserRouter from './routes/UserRouter.js';
import OrderRouter from './routes/OrderRouter.js';
import fileUpload from './controllers/fileUpload.js';
import { upload } from './utilities/multer.js';
import admin from 'firebase-admin';
import fireBasePushNotification from '../config/fireBasePushNotification.js';

admin.initializeApp({
    credential: admin.credential.cert(fireBasePushNotification),
});

const init = async () => {
    const PORT = process.env.PORT;
    const app = express();
    app.use(cors());
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false, limit: '4mb' }));
    app.use(express.static(path.join('public')));
    await mongoInit();
    app.get('/health', (req, res) =>
        res.json({
            message: 'I m fine',
        }),
    );
    app.get('/', (req, res) =>
        res.json({
            message: 'Server is running!',
        }),
    );
    app.use('/auth', AuthRouter);
    app.use('/admin', AuthMiddleware([ROLE_TYPE_ENUM.ADMIN]), AdminRouter);
    app.use('/deal', DealRouter);
    app.use('/dealCategory', DealCategoryRouter);
    app.use('/platForm', PlatFromRouter);
    app.use('/brand', BrandRouter);
    app.get('/getHomeData', GetHomeResult);
    app.post(
        '/getDealsByIds',
        AuthMiddleware([ROLE_TYPE_ENUM.USER]),
        activeDealByBrandAndCategory,
    );
    app.use('/user', AuthMiddleware([ROLE_TYPE_ENUM.USER]), UserRouter);
    app.use('/order', AuthMiddleware([ROLE_TYPE_ENUM.USER]), OrderRouter);
    app.use(
        '/fileUpload',
        AuthMiddleware(Object.values(ROLE_TYPE_ENUM).map((i) => i)),
        upload.single('file'),
        fileUpload,
    );
    app.use(catchErrorHandler);
    app.listen(PORT || 8000, () => {
        console.log(`server start on the ${PORT}`);
    });

    //dummy message
    const message = {
        notification: {
            title: 'Test Notification',
            body: 'This is a test notification',
        },
        token: 'eeKDexvWQOao7upv0oyDp6:APA91bH4Py0qQKrW8VxXq-J5YUlPIY56pJDPACqDv2VpveCMKTexAPbDg78xFJ9s4XUA3gpx6tvgKLRD62WW3VS6wKbb-cAlSfCpgiTSx_71rtDtt_XwyX1pnvMK1p2osgmiLZ9ODIuf',
    };

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

    //send message
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
init();
//# sourceMappingURL=server.js.map
