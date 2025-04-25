const express = require('express')
const router = express.Router();
const authController = require('../controllers/AuthController')

router.post("/login",authController.login)

router.get("/login", authController.loginPage)

router.get("/logout", authController.logout)

module.exports = router