const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const userExists = await User.findOne({ where: { username } });
        if (userExists) {
            return errorResponse(res, 'Username sudah terdaftar', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            password: hashedPassword,
            role
        });

        const userRes = user.toJSON();
        delete userRes.password;

        return successResponse(res, 'Registrasi berhasil', userRes, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return errorResponse(res, 'Username atau password salah', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return errorResponse(res, 'Username atau password salah', 401);
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            jwtSecret,
            { expiresIn: '1d' }
        );

        return successResponse(res, 'Login berhasil', {
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

module.exports = { register, login };