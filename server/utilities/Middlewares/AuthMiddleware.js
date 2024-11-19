import { verifyJwt } from '../jwt.js';
import catchAsync from '../catchAsync.js';
export default (role) => {
    return catchAsync(async (req, res, next) => {
        const token = req?.headers?.authorization?.replace('Bearer ', '');
        const decodedUser = verifyJwt(token);
        let userIsAuthenticated = true;
        if (!decodedUser?.data) {
            userIsAuthenticated = false;
        }

        const roleIsAccepted = decodedUser?.data?.roles?.some((item) =>
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
    });
};
