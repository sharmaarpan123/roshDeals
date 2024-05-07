import { NextFunction, Response, Request } from 'express';
import { ROLE_TYPE_ENUM } from './commonTypes';
import { verifyJwt } from './jwt';
import catchAsync from './catchAsync';

export default (role: ROLE_TYPE_ENUM) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const token = req?.headers?.authorization?.replace('Bearer ', '');

            const decodedUser = verifyJwt(token);

            if (
                !decodedUser?.data ||
                !decodedUser?.data?.roles?.includes(role)
            ) {
                return res.status(401).json({
                    success: false,
                    message: 'You are not Authorized',
                });
            }
            req.user = decodedUser.data;
            next();
        },
    );
};
