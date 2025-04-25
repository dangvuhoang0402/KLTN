const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
            ? req.headers.authorization.split(' ')[1] 
            : null);

        if (!token) {
            req.responseData = {
                status: 401,
                message: 'No token provided',
                data: null
            };
            return res.redirect('/auth/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { id, username, role, expirationDate } = decoded;

        const currentTimestamp = Date.now();
        const tokenExpiration = new Date(expirationDate).getTime();
        
        if (currentTimestamp > tokenExpiration) {
            res.clearCookie('jwt');
            req.responseData = {
                status: 401,
                message: 'Token expired',
                data: null
            };
            return res.redirect('/auth/login');
        }

        req.user = { id, username, role };
        req.responseData = {
            status: 200,
            message: 'Token verified',
            data: { user: req.user }
        };
        next();

    } catch (error) {
        res.clearCookie('jwt');
        req.responseData = {
            status: 401,
            message: error.message || 'Invalid token',
            data: null
        };
        return res.redirect('/auth/login');
    }
};

module.exports = verifyToken;