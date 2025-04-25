const userController = require("../controllers/UserController");
const express = require("express");
const router = express.Router();

router.get("/", userController.getAllUser);
router.post("/", userController.createUser);

router
  .route("/:id")
  .delete(userController.deleteUser)
  .put(userController.updateUser)
  .get(userController.getUserbyId);

module.exports = router;
