const express = require("express")
const router = express.Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")
const followController = require("./controllers/followController")
//User Related routes
router.get("/",userController.home)
router.post("/register",userController.register)
router.post("/login",userController.login)
router.post("/logout",userController.logout)

//profile related routes
router.get("/profile/:username",userController.ifUserExists,userController.sharedProfileData,userController.createUserProfile)
router.get("/profile/:username/follower",userController.ifUserExists,userController.sharedProfileData,userController.profileFollower)
router.get("/profile/:username/following",userController.ifUserExists,userController.sharedProfileData,userController.profileFollowing)
//Post related routes
router.get("/create-post",userController.mustBeLoggedIn,postController.viewCreateScreen)
router.post("/create-post",userController.mustBeLoggedIn,postController.create)
router.get("/post/:id",postController.createSinglePost)
router.get("/post/:id/edit",userController.mustBeLoggedIn, postController.editPost)
router.post("/post/:id/edit",userController.mustBeLoggedIn,postController.editSinglePost)
router.post("/post/:id/delete",userController.mustBeLoggedIn,postController.deletePost)
router.post("/search",postController.search)

//follow related routes
router.post("/addFollow/:username",userController.mustBeLoggedIn,followController.follow)
router.post("/removeFollow/:username",userController.mustBeLoggedIn,followController.remove)
module.exports = router