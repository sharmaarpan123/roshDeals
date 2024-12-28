import Admin from '../database/models/Admin.js';
import redis from '../lib/redis.js';

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

    const redisParseData = JSON.parse(redisData || "[]");

    if (!redisParseData?.length) {
        const allAdmins = await Admin.find({ isActive: true });

        return allAdmins;
    } else {
        return redisParseData;
    }
};

export const toUTC = (date) => {
    const offsetMinutes = 330; // IST is UTC+5:30
    return new Date(date.getTime() - offsetMinutes * 60 * 1000);
};