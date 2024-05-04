import { NextFunction, Request, Response } from 'express-serve-static-core';

const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) =>
        fn(req, res, next).catch(next);
};

export default catchAsync;
