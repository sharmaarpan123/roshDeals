"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("./jwt");
const catchAsync_1 = __importDefault(require("./catchAsync"));
exports.default = (role) => {
    return (0, catchAsync_1.default)(async (req, res, next) => {
        const token = req?.headers?.authorization?.replace('Bearer ', '');
        const decodedUser = (0, jwt_1.verifyJwt)(token);
        let userIsAuthenticated = true;
        if (!decodedUser?.data) {
            userIsAuthenticated = false;
        }
        const roleIsAccepted = decodedUser?.data?.roles?.map((item) => role.includes(item));
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
//# sourceMappingURL=AuthMiddleware.js.map