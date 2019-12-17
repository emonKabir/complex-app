
let User = require("../models/User")
let Post = require("../models/Post")
let Follow = require("../models/Follow")

exports.home = function (req, res) {

    if (req.session.user) {

        res.render("home-dashboard")

    } else {

        res.render('home-guest', { regError: req.flash("regError") })
    }

}



exports.logout = function (req, res) {

    //res.render('home-guest')
    req.session.destroy()
    res.redirect("/")
}

exports.register = function (req, res) {

    console.log(req.body)
    let user = new User(req.body)
    user.register().then(function () {

        req.session.user = { username: user.data.username, avatar: user.avatar, _id: user.data._id }
        req.session.save(function () {
            res.redirect("/")
        })
    }).catch(function (regError) {
        regError.forEach(function (message) {

            req.flash("regError", message)

        })
        req.session.save(function () {
            res.redirect("/")
        })
    })


}
exports.login = function (req, res) {

    let user = new User(req.body)
    user.login().then(function () {
        req.session.user = { username: user.data.username, avatar: user.avatar, _id: user.data._id }
        req.session.save(function () {
            res.redirect("/")
        })
        //res.send(result)
    }).catch(function (e) {
        req.flash("errors", e)
        req.session.save(function () {
            res.redirect("/")
        })

    })
}

exports.mustBeLoggedIn = function (req, res, next) {

    if (req.session.user) {
        next()
    } else {
        req.flash("errors", "You must be log in")
        req.session.save(function () {
            res.redirect("/")
        })
    }
}

exports.ifUserExists = function (req, res, next) {

    User.findUserByUserName(req.params.username).then(function (userExists) {

        req.profile = userExists
        console.log("User controller : " + userExists.avatar)
        next()

    }).catch(function () {

        res.send("sorry..coudnt found")
    })

}


exports.createUserProfile = function (req, res) {


    Post.findByAuthorId(req.profile._id, req.visitorId).then(function (posts) {
        res.render("profile-post", {
            currentPage:"posts",
            post: posts,
            proUsername: req.profile.username,
            proAvatar: req.profile.avatar,
            isFollowing: req.isFollowing,
            isOwnerFollowing:req.isOwnerFollowing,
            count:{postCount:req.postCount,followerCount:req.followerCount,followingCount:req.followingCount}
        })


    }).catch()


    console.log("rendering profile post " + req.profile.avatar + " " + req.profile.username)
}


exports.sharedProfileData = async function (req, res, next) {

    let isOwnerFollowing = false
    let isFollowing = false
    if (req.session.user) {

        isOwnerFollowing = req.profile._id.equals(req.session.user._id)
        isFollowing = await Follow.isVisitorFollowing(req.profile._id, req.visitorId)
    }
    console.log(isFollowing)
    req.isOwnerFollowing = isOwnerFollowing
    req.isFollowing = isFollowing

    let postCountPromise = Post.postCountById(req.profile._id)
    let followerCountPromise = Follow.followerCountById(req.profile._id)
    let followingCountPromise = Follow.followingCountById(req.profile._id)
    let [postCount,followerCount,followingCount] = await Promise.all([postCountPromise,followerCountPromise,followingCountPromise])
    
    req.postCount = postCount
    req.followerCount = followerCount
    req.followingCount = followingCount
    next()
}

exports.profileFollower = async function(req,res){
    try {
        console.log(`profile id 20 ${req.profile._id}`)
    let followers = await Follow.followerById(req.profile._id)
    console.log(`profile id 2 ${followers}`)
    res.render('profile-follower',{
        currentPage:"follower",
        followers:followers,
        proUsername: req.profile.username,
        proAvatar: req.profile.avatar,
        isFollowing: req.isFollowing,
        isOwnerFollowing:req.isOwnerFollowing,
        count:{postCount:req.postCount,followerCount:req.followerCount,followingCount:req.followingCount}
    })
    console.log(`profile id 3 ${req.profile._id}`)
    } catch  {
       res.render("404notFound")
    }
}

exports.profileFollowing = async function(req,res){
    try {
        
        //console.log(`profile id 20 ${req.profile._id}`)
    let following = await Follow.followingById(req.profile._id)
    //console.log(`profile following ${followers}`)
    console.log(following)
    res.render('profile-following',{
        currentPage:"following",
        following:following,
        proUsername: req.profile.username,
        proAvatar: req.profile.avatar,
        isFollowing: req.isFollowing,
        isOwnerFollowing:req.isOwnerFollowing,
        count:{postCount:req.postCount,followerCount:req.followerCount,followingCount:req.followingCount}
    })
   // console.log(`profile id 3 ${req.profile._id}`)

    } catch  {
       res.render("404notFound")
    }
}