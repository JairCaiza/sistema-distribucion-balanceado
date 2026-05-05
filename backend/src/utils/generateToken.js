const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            rol_id: user.rol_id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

module.exports = generateToken;