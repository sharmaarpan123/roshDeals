import mongoose from 'mongoose';
import Admin from '../database/models/Admin.js';
import redis from '../lib/redis.js';
import { ADMIN_ROLE_TYPE_ENUM } from './commonTypes.js';

export function randomOtp() {
    const randomNum = Math.random() * 9000;
    return Math.floor(1000 + randomNum);
}
export const isUrlValid = (data) =>
    /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi.test(
        data,
    );
//# sourceMappingURL=utilitis.js.map

export const getIp = (req) =>
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    '';

export const waitRequest = (waitTiming) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve('ok');
        }, waitTiming);
    });

export const getAllAdminsFromCache = async () => {
    const redisData = await redis.get('admins');

    const redisParseData = JSON.parse(redisData || '[]');

    if (!redisParseData?.length) {
        const allAdmins = await Admin.find({ isActive: true });

        return allAdmins;
    } else {
        return redisParseData;
    }
};

export const isAdminOrSubAdminAccessingApi = (req) =>
    req?.user?.roles?.some((role) =>
        [ADMIN_ROLE_TYPE_ENUM.ADMIN, ADMIN_ROLE_TYPE_ENUM.SUBADMIN].includes(
            role,
        ),
    )
        ? req?.user?._id
        : null;

export const isSuperAdminSuperSubAdminAccessingApi = (req) =>
    req?.user?.roles?.some((role) =>
        [
            ADMIN_ROLE_TYPE_ENUM.SUPERADMIN,
            ADMIN_ROLE_TYPE_ENUM.SUPERSUBADMIN,
        ].includes(role),
    )
        ? req?.user?._id
        : null;

export const isAdminAccessingApi = (req) =>
    req?.user?.roles?.includes(ADMIN_ROLE_TYPE_ENUM.ADMIN)
        ? req?.user?._id
        : null;

export const isSuperAdminAccessingApi = (req) =>
    req?.user?.roles?.includes(ADMIN_ROLE_TYPE_ENUM.SUPERADMIN)
        ? req?.user?._id
        : null;

export const getAccessorId = (req) => req?.user?._id;
export const toUTC = (date) => {
    const offsetMinutes = 330; // IST is UTC+5:30
    return new Date(date.getTime() - offsetMinutes * 60 * 1000);
};

export const getCurrentAdminReferencesId = (req) =>
    req?.user?.currentAdminReference?._id;

export const MongooseObjectId = (id) =>
    mongoose.Types.ObjectId.createFromHexString(id);

export const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};
