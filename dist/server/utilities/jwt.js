"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.jwtGen = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET_KEY;
const jwtGen = (data) => {
    return jsonwebtoken_1.default.sign({ data }, secret);
};
exports.jwtGen = jwtGen;
const verifyJwt = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        console.log('error while verifying the token', error);
    }
};
exports.verifyJwt = verifyJwt;
//# sourceMappingURL=jwt.js.map