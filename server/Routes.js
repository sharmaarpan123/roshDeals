import fileUpload from './controllers/fileUpload.js';
import activeDealByBrandAndCategory from './controllers/getDeals/activeDealByBrandAndCategory.js';
import GetHomeResult from './controllers/GetHomeResult.js';
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

export default (app) => {
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
            // ADMIN_ROLE_TYPE_ENUM.SUPERADMIN,
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
};
