import catchAsync from '../catchAsync.js';
import { ADMIN_ROLE_TYPE_ENUM, SELLER_ROLE_TYPE_ENUM } from '../commonTypes.js';
import { errorResponse } from '../Responses.js';
import { getAllAdminsFromCache } from '../utilitis.js';
export default ({ canAdminAccess, canSubAdminAccess }) => {
    return catchAsync(async (req, res, next) => {
        // seller check
        const isSeller = req?.user?.roles?.includes(
            SELLER_ROLE_TYPE_ENUM.SELLER,
        );

        if (isSeller) {
            return next();
        }

        // super admin , agency , mediator check
        const adminId = req?.user?._id;

        const admins = await getAllAdminsFromCache();

        const admin = admins?.find((item) => item?._id?.toString() === adminId);

        const sendNotPermittedRes = () => {
            res.status(401).json(
                errorResponse({
                    message: "You don't have permission to access this API.",
                }),
            );
        };

        if (!admin || !admin?.isActive) {
            return res.status(403).json(
                errorResponse({
                    message:
                        'Your account has been deactivated by the super admin. Please contact the super admin for assistance. ',
                }),
            );
        } else if (admin?.roles?.includes(ADMIN_ROLE_TYPE_ENUM.SUPERADMIN)) {
            // where the king enters
            return next();
        }
        // else if (admin?.roles?.includes(ADMIN_ROLE_TYPE_ENUM.SUPERSUBADMIN)) {
        //     const permissions = admin?.permissions;

        //     const permission = permissions?.find(
        //         (item) => item?.moduleId?.uniqueSlug === uniqueSlug,
        //     );

        //     if (!permission || !permission[key]) {
        //         return sendNotPermittedRes();
        //     }
        //     return next();
        // }
        else if (admin?.roles?.includes(ADMIN_ROLE_TYPE_ENUM.ADMIN)) {
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
