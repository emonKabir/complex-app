let Post = require("../models/Post")

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

exports.createSinglePost = async function(req, res){
    
    try{

        
        let post = await Post.findSingleId(req.params.id,req.visitorId)
        
        console.log("postController visitor id: "+req.visitorId)
        //res.send("this is fucking beautiful day")
        res.render("post-single-screen",{post:post})


    }catch{

        res.render("404notFound")
    }
   
}

  exports.editPost = async function(req,res){
   
        try {
            
         let post =  await Post.findSingleId(req.params.id,req.visitorId)
         //console.log("post collection author id : "+post.authorId)
         //console.log("post collection visitor id : "+req.visitorId)
         //console.log("post collection owner id : "+post.isOwnerId)
         //res.render("editPost",{post:post})
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

exports.search = function(req,res){

     Post.search(req.body.searchTerm).then((posts)=>{
        res.json(posts)
    }).catch(()=>{
        res.json([])
    })
}