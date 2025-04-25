const User = require("../models/User");
require("express-async-errors");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');

const createUser = async (userData) => {
  const newUser = await User.create(userData);
  return newUser;
};
const createReaderUser = async (readerID) => {
  let Password=bcrypt.hashSync("123456", 10);
  const newUser = await User.create({Password:Password,Role:"reader",UserName:readerID});
  return newUser;
}


const getAllUser = async () => {
  const allUsers = await User.find();
  return allUsers;
};

const login = async (username, password) => {
  const user = await User.findOne({ UserName: username });

  if (!user) {
    return null; // User not found
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.Password);

  if (!isPasswordCorrect) {
    return null; // Incorrect password
  }

  return user;
};

const getUserById = async (id) => {

  const user = await User.findById(id).exec();
  if (!user) {
    throw new CustomError("User not found",400);
  }
  return user;
};

const updateUser = async (id, updatedData) => {
  const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
    new: true,
  });
  if (!updatedUser) {
    throw new CustomError("User not found",400);
  }
  return updatedUser;
};

const deleteUser = async (id,deletedById) => {
  const deletedUser = await User.deleteById(id, deletedById);
  if (!deletedUser) {
    throw new CustomError("User not found",400);
  }
  return deletedUser;
};

module.exports = {
  getAllUser,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  login,
  createReaderUser
};
