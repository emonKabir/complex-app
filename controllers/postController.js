let Post = require("../models/Post")
let User = require("../models/User")

exports.viewCreateScreen = function(req,res){

    res.render("create-post")
}

exports.create = function(req,res){

    console.log(req.session.user._id)
   let post = new Post(req.body,req.session.user._id)
    post.create().then(function(newId){

      req.flash("success","post create successfully")  
    //res.send("post submit successfully")
    req.session.save(function(){

        res.redirect(`/post/${newId}`)
    })
    
    }).catch(function(err){
        err.forEach(function(error){

            req.flash("errors",error)
            req.session.save(function(){
                res.redirect("create-post")
            })
        })
        //res.send("something wrong : "+err)
    })
}
exports.apiCreate = function(req,res){

   
   let post = new Post(req.body,req.apiUser._id)
    post.create().then(function(newId){
        res.json("successfully posts")
    
    }).catch(function(err){
       res.json(err) 
    })
}

exports.createSinglePost = async function(req, res){
    
    try{

        
        let post = await Post.findSingleId(req.params.id,req.visitorId)
        
        console.log("postController visitor id: "+req.visitorId)
        
        res.render("post-single-screen",{post:post,title:post.title})


    }catch{

        res.render("404notFound")
    }
   
}

  exports.editPost = async function(req,res){
   
        try {
            
         let post =  await Post.findSingleId(req.params.id,req.visitorId)
        console.log(post.isOwnerId)
         if(post.isOwnerId){
            res.render("editPost",{post:post})
            return 
         }else{
             req.flash("errors","you do not have permission")
             
             req.session.save(function(){
                 res.redirect("/")
             })
             return
         }
        
            
        } catch(err) {
            console.log(err)
           return res.render("404notFound")
        }
       
    }
exports.editSinglePost = function(req,res){

    let post = new Post(req.body,req.visitorId,req.params.id)
    post.update().then((status)=>{

        if(status == "success"){
            
            req.flash("success","successfully updated")
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`)
            })

        }else{

            post.errors.forEach(function(error){
                req.flash("errors",error)
            })
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}`/edit)
            })

        }
    }).catch(()=>{

        req.flash("errors","you don not have permission to edit")
        req.session.save(function(){
            res.redirect("/")
        })

    })

}
exports.apiFindPostByUser = async function(req,res){

    try {
        console.log("dhukchos tow!!")
        let userDoc = await User.findUserByUserName(req.params.username)
        console.log(userDoc)
        let posts = await Post.findByAuthorId(userDoc._id)
        console.log(posts)
        res.json(posts)

    } catch {
        res.json("somossa")
    }    
}
exports.deletePost = function(req,res){
        
       let post = Post.delete(req.params.id,req.visitorId).then(function(){
            req.flash("success","post successfully delete")
            req.session.save(function(){
                res.redirect(`/profile/${req.session.user.username}`)
            })
        }).catch(()=>{
            req.flash("errors","you have not permission to delete this")
            req.session.save(function(){
                res.redirect("/")
            })
        })
        //res.send("lkdjflksajflksaj")

   
}

exports.apiDelete = function(req,res){
        
    let post = Post.delete(req.params.id,req.apiUser._id).then(function(){
        
        res.json("success")
        
     }).catch(()=>{
        res.json("You dont have permission to delete this post")
             })
     //res.send("lkdjflksajflksaj")


}

exports.search = function(req,res){

     Post.search(req.body.searchTerm).then((posts)=>{
        res.json(posts)
    }).catch(()=>{
        res.json([])
    })
}