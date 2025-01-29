export const successResponse = ({
    message,
    data,
    others,
    statusCode,
    total,
}) => ({
    statusCode: statusCode || 200,
    success: true,
    message: message,
    total,
    ...(data && { data }),
    ...(others && others),
});

export const errorResponse = ({ message, others, statusCode, errorInfo }) => ({
    statusCode: statusCode || 400,
    success: false,
    message,
    ...(others && others),
    ...(errorInfo && { errorInfo }),
});

export const sendErrorResponse = ({
    message,
    others,
    statusCode = 400,
    error,
    res,
}) => {
    return res
        .status(statusCode)
        .json(errorResponse({ message, others, statusCode, error }));
};

export const sendSuccessResponse = ({
    message,
    data,
    others,
    statusCode = 200,
    total,
    res,
}) => {
    return res
        .status(statusCode)
        .json(successResponse({ message, data, others, statusCode, total }));
};
