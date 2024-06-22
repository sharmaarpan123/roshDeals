import { NextFunction, Response, Request } from 'express';
import { ROLE_TYPE_ENUM } from './commonTypes';
import { verifyJwt } from './jwt';
import catchAsync from './catchAsync';

export default (role: ROLE_TYPE_ENUM[]) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const token = req?.headers?.authorization?.replace('Bearer ', '');

            const decodedUser = verifyJwt(token);

            let userIsAuthenticated = true;

            if (!decodedUser?.data) {
                userIsAuthenticated = false;
            }

            const roleIsAccepted = decodedUser?.data?.roles?.map((item) =>
                role.includes(item),
            );

            if (!roleIsAccepted) {
                userIsAuthenticated = false;
            }

            if (!userIsAuthenticated) {
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
