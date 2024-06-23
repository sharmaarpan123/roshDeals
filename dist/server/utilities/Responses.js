"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const successResponse = ({ message, data, others, statusCode, total, }) => ({
    statusCode: statusCode || 200,
    success: true,
    message: message,
    total,
    ...(data && { data }),
    ...(others && others),
});
exports.successResponse = successResponse;
const errorResponse = ({ message, others, statusCode, errorInfo, }) => ({
    statusCode: statusCode || 400,
    success: false,
    message,
    ...(others && others),
    ...(errorInfo && { errorInfo }),
});
exports.errorResponse = errorResponse;
//# sourceMappingURL=Responses.js.map