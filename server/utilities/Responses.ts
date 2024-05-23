/* eslint-disable @typescript-eslint/no-explicit-any */
export const successResponse = ({
    message,
    data,
    others,
    statusCode,
    total,
}: {
    message: string;
    data?: unknown;
    others?: Record<string, unknown>;
    statusCode?: number;
    total?: number;
}) => ({
    statusCode: statusCode || 200,
    success: true,
    message: message,
    total,
    ...(data && { data }),
    ...(others && others),
});

export const errorResponse = ({
    message,
    others,
    statusCode,
    errorInfo,
}: {
    message: string;
    others?: Record<string, unknown>;
    errorInfo?: unknown;
    statusCode?: number;
}) => ({
    statusCode: statusCode || 400,
    success: false,
    message,
    ...(others && others),
    ...(errorInfo && { errorInfo }),
});
