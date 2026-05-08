const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { errorResponse } = require('../utils');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, jwtSecret);

            req.user = decoded;
            next();
        } catch (error) {
            return errorResponse(res, 'Not authorized, token failed', 401);
        }
    }

    if (!token) {
        return errorResponse(res, 'Not authorized, no token', 401);
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return errorResponse(res, `User role ${req.user.role} is not authorized`, 403);
        }
        next();
    };
};

module.exports = { protect, authorize };