const CustomError = require("../error/CustomError");
const userRepo = require("../repo/UserRepo");
const jwtUtil = require("../utils/generateJwt")
require("express-async-errors");

const login = async(authData)=>{
    const user = await userRepo.login(authData.userName,authData.password);
    if(user){
        let token = jwtUtil.generateToken(user);
        return {
            user,
            token
        }
    }
    else{
        throw new CustomError("Sai tài khoản hoặc mật khẩu",401)
    }
}
module.exports={
    login
}