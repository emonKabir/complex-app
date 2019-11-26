
let User = require("../models/User")
let Post = require("../models/Post")

exports.home = function (req, res) {

    if (req.session.user) {

        res.render("home-dashboard")

    } else {

        res.render('home-guest',{regError:req.flash("regError")})
    }

}



exports.logout = function (req, res) {

    //res.render('home-guest')
    req.session.destroy()
    res.redirect("/")
}

exports.register = function(req,res){

    console.log(req.body)
    let user = new User(req.body)
     user.register().then(function(){
       
        req.session.user = {username:user.data.username,avatar:user.avatar,_id:user.data._id}
        req.session.save(function(){
            res.redirect("/")
        })
     }).catch(function(regError){
        regError.forEach(function(message){
            
            req.flash("regError",message)
            
         })
         req.session.save(function(){
             res.redirect("/")
         })
     })
     
   
}
exports.login = function(req,res){
    
    let user = new User(req.body)
    user.login().then(function() {
        req.session.user = {username:user.data.username,avatar:user.avatar,_id:user.data._id}
        req.session.save(function(){
            res.redirect("/")
        })
        //res.send(result)
    }).catch(function(e){
        req.flash("errors",e)
        req.session.save(function(){
            res.redirect("/")
        })
        
    })
}

exports.mustBeLoggedIn = function(req , res, next){

    if(req.session.user){
        next()
    }else{
        req.flash("errors","You must be log in")
        req.session.save(function(){
            res.redirect("/")
        })
    }
}

exports.ifUserExists = function(req,res,next){

    User.findUserByUserName(req.params.username).then(function(userExists){

        req.profile = userExists
        console.log("User controller : "+userExists.avatar)
        next()

    }).catch(function(){

            res.send("sorry..coudnt found")
    })

}


exports.createUserProfile = function(req,res){
    

    Post.findByAuthorId(req.profile._id,req.visitorId).then(function(posts){
        res.render("profile-post",{
            post:posts,
            proUsername:req.profile.username,
            proAvatar:req.profile.avatar})
    

    }).catch()


    console.log("rendering profile post "+req.profile.avatar+" "+req.profile.username)
    }
