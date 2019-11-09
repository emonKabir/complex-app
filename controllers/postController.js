let Post = require("../models/Post")

exports.viewCreateScreen = function(req,res){

    res.render("create-post")
}

exports.create = function(req,res){

    console.log(req.session.user._id)
   let post = new Post(req.body,req.session.user._id)
    post.create().then(function(){

        res.send("post submit successfully")
    }).catch(function(err){
        res.send("something wrong : "+err)
    })
}

exports.createSinglePost = async function(req, res){
    
    try{

        let post = await Post.findSingleId(req.params.id)
        console.log("postController : "+post)
        //res.send("this is fucking beautiful day")
        res.render("post-single-screen",{post:post})


    }catch{

        res.render("404notFound")
    }

   
}