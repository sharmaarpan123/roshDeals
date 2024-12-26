import catchAsync from '../catchAsync.js';
import { ADMIN_ROLE_TYPE_ENUM } from '../commonTypes.js';
import { errorResponse } from '../Responses.js';
import { getAllAdminsFromCache } from '../utilitis.js';
export default ({ uniqueSlug, key, canAdminAccess, canSubAdminAccess }) => {
    return catchAsync(async (req, res, next) => {
        const adminId = req?.user?._id;

        const admins = await getAllAdminsFromCache();

        const admin = admins?.find((item) => item?._id === adminId);

        const sendNotPermittedRes = () => {
            res.status(403).json(
                errorResponse({
                    message: "You dont't have permissioin access this api",
                }),
            );
        };

        if (admin?.roles?.includes(ADMIN_ROLE_TYPE_ENUM.SUPERADMIN)) {
            // where the king enters
            return next();
        } else if (admin?.roles?.includes(ADMIN_ROLE_TYPE_ENUM.SUPERSUBADMIN)) {
            const permissions = admin?.permissions;

            const permission = permissions?.find(
                (item) => item?.moduleId?.uniqueSlug === uniqueSlug,
            );

            if (!permission || !permission[key]) {
                return sendNotPermittedRes();
            }
            return next();
        } else if (admin?.roles?.includes(ADMIN_ROLE_TYPE_ENUM.ADMIN)) {
            if (!canAdminAccess) {
                return sendNotPermittedRes();
            }
            return next();
        } else if (admin?.roles?.includes(ADMIN_ROLE_TYPE_ENUM.SUBADMIN)) {
            if (!canSubAdminAccess) {
                return sendNotPermittedRes();
            }
            return next();
        } else {
            return sendNotPermittedRes();
        }
    });
};
