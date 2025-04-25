var dotenv = require('dotenv');
var jwt = require("jsonwebtoken");
var env = process.env.NODE_ENV;
dotenv.config({ path: `.env.${env}` });
exports.generateToken = (user) => {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 1000 * 60 * 120);
    return jwt.sign({ 
        username:user.UserName,
        id:user._id,
        role:user.Role, 
        expirationDate }, process.env.JWT_SECRET_KEY);
};
