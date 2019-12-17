const Follow = require("../models/Follow")

exports.follow = function(req,res){
    let follow = new Follow(req.params.username,req.visitorId)
    follow.create().then(()=>{

        req.flash("success",`successfully follow ${req.params.username}`)
        req.session.save(function(){
            res.redirect(`/profile/${req.params.username}`)
        })
    }).catch((errors)=>{

        errors.forEach(element => {
            req.flash("errors","something  is wrong while follow")

        });
        req.session.save(function(){
            res.redirect("/")
        })

    })
}

exports.remove = function(req,res){
    let follow = new Follow(req.params.username,req.visitorId)
    follow.delete().then(()=>{

        req.flash("success",`successfully unfollow ${req.params.username}`)
        req.session.save(function(){
            res.redirect(`/profile/${req.params.username}`)
        })
    }).catch((errors)=>{

        errors.forEach(element => {
            req.flash("errors","something  is wrong while follow")

        });
        req.session.save(function(){
            res.redirect("/")
        })

    })
}