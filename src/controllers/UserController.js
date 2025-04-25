const UserService = require('../services/UserService')
const getAllUser =async (req,res ,next)=>{
    const User = await UserService.getAllUser()
    req.responseData = {
        status: 200, 
        message: 'Successfully! Get all user', 
        data: User
    };
    next();
  
}
const createUser = async (req,res ,next)=>{

    const User = await UserService.createUser(req)
    req.responseData = {
        status: 201,
        message: 'Successfully! Create user',
        data: User 
    };
    next();
}
const getUserbyId = async (req,res ,next)=>{
    const User = await UserService.getUserbyId(req)
    req.responseData = {
        status: 200, 
        message: 'Successfully! Get user by id', 
        data: User
    };
    next();
}
const updateUser = async (req,res ,next)=>{
    const User = await UserService.updateUser(req)
    req.responseData = {
        status: 200, 
        message: 'Successfully! Update user by id', 
        data: User
    };
    next();

}
const deleteUser = async (req,res ,next)=>{
    const User = await UserService.deleteUser(req)
    req.responseData = {
        status: 200, 
        message: 'Successfully! Delete user by id', 
        data: User
    };
    next();
}
module.exports = {
    getAllUser,
    getUserbyId,
    updateUser,
    deleteUser,
    createUser
}