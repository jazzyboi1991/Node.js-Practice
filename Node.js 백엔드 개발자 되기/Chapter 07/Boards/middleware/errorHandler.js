const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.log(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = '리소스를 찾을 수 없습니다.';
        error = { message, status: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = '중복된 필드 값이 입력되었습니다.';
        error = { message, status: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, status: 400 };
    }

    // Multer file upload errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            error = { message: '파일 크기가 제한을 초과했습니다.', status: 400 };
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            error = { message: '파일 개수가 제한을 초과했습니다.', status: 400 };
        } else {
            error = { message: '파일 업로드 중 오류가 발생했습니다.', status: 400 };
        }
    }

    res.status(error.status || 500).json({
        success: false,
        message: error.message || '서버 오류가 발생했습니다.'
    });
};

module.exports = errorHandler;