const auth = require('./authMiddleware');
const error = require('./errorMiddleware');
const validation = require('./validationMiddleware');

module.exports = {
    ...auth,
    ...error,
    ...validation
};