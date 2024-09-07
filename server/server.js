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
import AuthMiddleware from './utilities/Middlewares/AuthMiddleware.js';
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
import SlowRateMiddleWare from './utilities/Middlewares/SlowRateMiddleWare.js';

const init = async () => {
    const PORT = process.env.PORT;
    const app = express();
    app.use(cors());
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false, limit: '4mb' }));
    app.use(express.static(path.join('server/public')));
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
        SlowRateMiddleWare(),
        upload.single('file'),
        fileUpload,
    );
    app.use(catchErrorHandler);
    app.listen(PORT || 8000, () => {
        console.log(`server start on the ${PORT}`);
    });

    //dummy message
    // sendNotification({
    //     notification: {
    //         title: 'Test Notification',
    //         body: 'This is a test notification',
    //     },
    //     tokens: [
    //         'dnXSxSgwQZOfIpLGn097Ij:APA91bGau2K2xyKT2QL7rsiyQLF9FAG3Qh5Irg7sxvtsD9ukqgE0MWT7YNWdHTsqieGrlrDnscIDaRSP1rgg0Hco20I9yWMcutgCPdTdL9kzSAAkKb6q5SQ2tuvgyQtftoblq_ERBw3I',
    //     ],
    // });
    // const message = {
    //     notification: {
    //         title: 'Test Notification',
    //         body: 'This is a test notification',
    //     },
    //     token: 'dpSyLLEFRKyoIIc8Bys7Wl:APA91bGtHvYluZ6IY0qbi1cA3nl-NnIEx7WTmFEMn8PFGeLjkXdGkaMIvb2TtAlByifvO0LTmhg_ywSJ94ANaDoqgnG-IxYAB4geSWGkVLuBcEMX5XQnk-HUfvCz0XLJYoGoPWsyDqix',
    // };
};
init();

//# sourceMappingURL=server.js.map
