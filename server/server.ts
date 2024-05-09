/* eslint-disable @typescript-eslint/no-unused-vars */
import './init-aliases';
import { config } from 'dotenv';
config();
import express, { NextFunction, Response, Request } from 'express';
import cors from 'cors';
import AuthRouter from './routes/AuthRouter';
import logger from 'morgan';
import path from 'path';
import mongoInit from './models/mongoInit';
import catchErrorHandler from './utilities/catchErrorHandler';
import AdminRouter from './routes/AdminRouter';
import { ROLE_TYPE_ENUM } from './utilities/commonTypes';
import AuthMiddleware from './utilities/AuthMiddleware';
import { UserType } from './models/User';
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
    // app.use('/platForm/', AuthMiddleware(ROLE_TYPE_ENUM.USER), PlatFormRouter)
    // app.use('/platForm',)

    app.use(catchErrorHandler);

    app.listen(PORT || 8000, () => {
        console.log(`server start on the ${PORT}`);
    });
};

init();
