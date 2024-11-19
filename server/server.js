import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import fileUpload from './controllers/fileUpload.js';
import activeDealByBrandAndCategory from './controllers/getDeals/activeDealByBrandAndCategory.js';
import GetHomeResult from './controllers/GetHomeResult.js';
import mongoInit from './database/index.js';
import './init-aliases.js';
import AdminRouter from './routes/AdminRouter.js';
import AuthRouter from './routes/AuthRouter.js';
import BrandRouter from './routes/BrandRouter.js';
import DealCategoryRouter from './routes/DealCategoryRouter.js';
import DealRouter from './routes/DealRouter.js';
import OrderRouter from './routes/OrderRouter.js';
import PlatFromRouter from './routes/PlatFromRouter.js';
import UserRouter from './routes/UserRouter.js';
import catchErrorHandler from './utilities/catchErrorHandler.js';
import {
    ADMIN_ROLE_TYPE_ENUM,
    ROLE_TYPE_ENUM,
} from './utilities/commonTypes.js';
import AuthMiddleware from './utilities/Middlewares/AuthMiddleware.js';
import { upload } from './utilities/multer.js';
import getInitialCacheValues from './utilities/getInitialCacheValues.js';
config();

const init = async () => {
    const PORT = process.env.PORT;
    const app = express();
    app.use(cors());
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false, limit: '4mb' }));
    app.use(express.static(path.join('server/public')));
    await mongoInit();
     getInitialCacheValues();
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
    app.use(
        '/admin',
        AuthMiddleware([
            ADMIN_ROLE_TYPE_ENUM.ADMIN,
            ADMIN_ROLE_TYPE_ENUM.SUBADMIN,
        ]),
        AdminRouter,
    );
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
        // SlowRateMiddleWare(),
        upload.single('file'),
        fileUpload,
    );
    app.use(catchErrorHandler);
    app.listen(PORT || 8000, () => {
        console.log(`server start on the ${PORT}`);
    });
};
init();

//# sourceMappingURL=server.js.map
