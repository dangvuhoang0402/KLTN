const CustomError = require("../error/CustomError");
const UserRepo = require("../repo/UserRepo");
const User = require("../models/User");
var bcrypt = require("bcrypt");

require("express-async-errors");

const getAllUser = async() => {
  const result = await UserRepo.getAllUser()
  return result

};
const createUser = async(req) => {
  console.log("User service: create User")
  const UserData=req.body
  UserData.Password = await bcrypt.hash(UserData.Password, 10);

  const task = await UserRepo.createUser(UserData);
  return task
};
const getUserbyId = async(req) => {
  const id = req.params.id;

  const result = await UserRepo.getUserById(id)
  return result
};
const updateUser = async(req) => {
  const id = req.params.id;
  const updatedData = req.body
  const result = await UserRepo.updateUser(id, updatedData)
  return result
};
const deleteUser = async(req) => {
  const id = req.params.id;
  // console.log(req.user)
  const result = await UserRepo.deleteUser(id,req.user.id)
  return result
};
module.exports = {
  getAllUser,
  getUserbyId,
  updateUser,
  deleteUser,
  createUser
};
