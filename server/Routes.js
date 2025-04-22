import fileUpload from './controllers/fileUpload.js';
import './init-aliases.js';
import AdminRouter from './routes/AdminRouter.js';
import AuthRouter from './routes/AuthRouter.js';
import CommonRouter from './routes/CommonRoutes.js';
import SellerRouter from './routes/SellerRouter.js';
import SubAdminRouter from './routes/SubAdminRouter.js';
import UserRouter from './routes/UserRouter.js';
import catchErrorHandler from './utilities/catchErrorHandler.js';
import {
    ADMIN_ROLE_TYPE_ENUM,
    ROLE_TYPE_ENUM,
    SELLER_ROLE_TYPE_ENUM,
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
            ...Object.values(ADMIN_ROLE_TYPE_ENUM).map((role) => role),
            ...Object.values(SELLER_ROLE_TYPE_ENUM).map((role) => role),
        ]),
        AdminRouter,
    );

    app.use(
        '/subAdmin',
        AuthMiddleware(
            Object.values(ADMIN_ROLE_TYPE_ENUM)?.map((role) => role),
        ),
        SubAdminRouter,
    );

    app.use(
        '/seller',
        AuthMiddleware(
            Object.values(SELLER_ROLE_TYPE_ENUM)?.map((role) => role),
        ),
        SellerRouter,
    );

    app.use('/user', AuthMiddleware([ROLE_TYPE_ENUM.USER]), UserRouter);

    // commonApi means for  all roles like  admin ,  super-admin , and users

    app.use(
        '/commonApi',
        AuthMiddleware([
            ROLE_TYPE_ENUM.USER,
            ...Object.values(ADMIN_ROLE_TYPE_ENUM).map((i) => i),
        ]),
        CommonRouter,
    );

    app.use(
        '/fileUpload',
        AuthMiddleware([
            ...Object.values(ADMIN_ROLE_TYPE_ENUM).map((i) => i),
            ROLE_TYPE_ENUM.USER,
        ]),
        // SlowRateMiddleWare(),
        upload.single('file'),
        fileUpload,
    );
    app.use(catchErrorHandler);
};
