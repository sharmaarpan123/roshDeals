/* eslint-disable @typescript-eslint/no-unused-vars */
import './init-aliases';
import { config } from 'dotenv';
config();
import express from 'express';
import cors from 'cors';
import AuthRouter from './routes/AuthRouter';
import logger from 'morgan';
import path from 'path';
import mongoInit from './database';
import catchErrorHandler from './utilities/catchErrorHandler';
import AdminRouter from './routes/AdminRouter';
import { ROLE_TYPE_ENUM } from './utilities/commonTypes';
import AuthMiddleware from './utilities/AuthMiddleware';
import { UserType } from './database/models/User';
import dealCategoryController from './controllers/DealCategoryController/dealCategoryController';
import platFormController from './controllers/PlatFormController/platFormController';
import brandController from './controllers/BrandConroller/brandController';
import DealRouter from './routes/DealRouter';
import DealCategoryRouter from './routes/DealCategoryRouter';
import PlatFromRouter from './routes/PlatFromRouter';
import BrandRouter from './routes/BrandRouter';
import GetHomeResult from './controllers/GetHomeResult';
import activeDealByBrandAndCategory from './controllers/getDeals/activeDealByBrandAndCategory';
import UserRouter from './routes/UserRouter';
declare global {
    namespace Express {
        export interface Request {
            user: UserType;
        }
    }
}

const init = async () => {
    const PORT = process.env.PORT;
    const app = express();

    app.use(cors());
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join('public')));

    await mongoInit();

    app.use('/auth', AuthRouter);
    app.use('/admin', AuthMiddleware(ROLE_TYPE_ENUM.ADMIN), AdminRouter);
    app.use('/deal', DealRouter);
    app.use('/dealCategory', DealCategoryRouter);
    app.use('/platForm', PlatFromRouter);
    app.use('/brand', BrandRouter);
    app.use('/user', UserRouter);
    app.get('/getHomeData', GetHomeResult);
    app.post('/getDealsByIds', activeDealByBrandAndCategory);

    app.use(catchErrorHandler);

    app.listen(PORT || 8000, () => {
        console.log(`server start on the ${PORT}`);
    });
};

init();
