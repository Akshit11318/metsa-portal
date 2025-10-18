// Standard response utilities

const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const sendError = (res, message = 'Error occurred', statusCode = 400, errors = null) => {
    const response = {
        success: false,
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

const sendCreated = (res, data, message = 'Resource created successfully') => {
    return sendSuccess(res, data, message, 201);
};

const sendNoContent = (res, message = 'Resource deleted successfully') => {
    return res.status(200).json({
        success: true,
        message,
    });
};

module.exports = {
    sendSuccess,
    sendError,
    sendCreated,
    sendNoContent,
};