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
import { ZodError } from 'zod';

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

    app.use(
        (
            err: Record<string, string>,
            _req: Request,
            res: Response,
            _next: NextFunction,
        ) => {
            console.log(err, 'global error');
            if (err instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: err.errors[0].message,
                    errorInfo: err.errors[0],
                    type: 'validationError',
                });
            }
            return res.status(500).json({
                success: false,
                statusCode: err.statusCode || 500,
                message: 'Server Error',
                errorInfo: err.message,
            });
        },
    );

    app.listen(PORT || 8000, () => {
        console.log(`server start on the ${PORT}`);
    });
};

init();
