"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUrlValid = exports.randomOtp = void 0;
function randomOtp() {
    const randomNum = Math.random() * 9000;
    return Math.floor(1000 + randomNum);
}
exports.randomOtp = randomOtp;
const isUrlValid = (data) => /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi.test(data);
exports.isUrlValid = isUrlValid;
//# sourceMappingURL=utilitis.js.map