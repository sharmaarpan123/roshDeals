import redis from '../../lib/redis.js';
import catchAsync from '../catchAsync.js';
import { errorResponse } from '../Responses.js';
export default ({ uniqueSlug, key }) => {
    return catchAsync(async (req, res, next) => {
        const adminId = req?.user?._id;

        const result = await redis.get('admins');

        const admins = JSON.parse(result);

        const admin = admins?.find((item) => item?._id === adminId);

        if (admin?.roles?.includes('admin')) {
            return next();
        }

        const permissions = admin?.permissions;

        

        const permission = permissions?.find(
            (item) => item?.moduleId?.uniqueSlug === uniqueSlug,
        );

        if (!permission[key]) {
            return res.status(403).json(
                errorResponse({
                    message: "You dont't have permissioin access this api",
                }),
            );
        }
        return next();
    });
};
