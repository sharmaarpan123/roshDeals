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
