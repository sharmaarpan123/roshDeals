
export const successResponse = ({ message, data, others, statusCode, total, }) => ({
    statusCode: statusCode || 200,
    success: true,
    message: message,
    total,
    ...(data && { data }),
    ...(others && others),
});
export const errorResponse = ({ message, others, statusCode, errorInfo, }) => ({
    statusCode: statusCode || 400,
    success: false,
    message,
    ...(others && others),
    ...(errorInfo && { errorInfo }),
});
//# sourceMappingURL=Responses.js.map