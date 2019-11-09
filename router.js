const express = require("express")
const router = express.Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")

//User Related routes
router.get("/",userController.home)
router.post("/register",userController.register)
router.post("/login",userController.login)
router.post("/logout",userController.logout)

//profile related routes
router.get("/profile/:username",userController.ifUserExists,userController.createUserProfile)

//Post related routes
router.get("/create-post",userController.mustBeLoggedIn,postController.viewCreateScreen)
router.post("/create-post",userController.mustBeLoggedIn,postController.create)
router.get("/post/:id",postController.createSinglePost)
 
module.exports = router