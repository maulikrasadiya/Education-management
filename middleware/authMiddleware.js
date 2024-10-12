const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Please log in first.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();  
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token. Authentication failed.' });
    }
};

const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. You don't have permission." });
        }
        next();
    };
};

module.exports = {
    authenticateUser,
    authorizeRoles
};
