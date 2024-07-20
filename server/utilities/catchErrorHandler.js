import { ZodError } from 'zod';
export default (err, _req, res, _next) => {
    console.log(err, 'error catch async ');
    if (err.name === 'CastError') {
        return res.status(404).json({
            success: false,
            statusCode: 404,
            message: 'InValid MongoDb ObjectId',
            errorInfo: err,
            type: 'validationError',
        });
    }
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: err.errors[0].message,
            errorInfo: err.errors[0],
            type: 'validationError',
        });
    }
    return res.status(500).json({
        success: false,
        statusCode: err.statusCode || 500,
        message: 'Server Error',
        errorInfo: err.message,
    });
};
//# sourceMappingURL=catchErrorHandler.js.map