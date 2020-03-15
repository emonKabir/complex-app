
const postCOllection = require("../db").db().collection("posts")
const followCollection = require("../db").db().collection("follow")
const ObjectID  = require("mongodb").ObjectID
const User = require("./User")

let Post = function(data,userId,requestedPostId){
this.data = data
this.errors = []
this.userId = userId
this.requestedPostId  = requestedPostId
}

Post.prototype.cleanUp = function() {

    if(typeof(this.data.title) != "string") {this.data.title = ""} 
    if(typeof(this.data.body) != "string") {this.data.body = ""}

    this.data = {
        title:this.data.title.trim(),
        body:this.data.body.trim(),
        currentDate: new Date(),
        author: ObjectID(this.userId)
    }
}

Post.prototype.validation = function(){

    if(this.data.title == "") {this.errors.push("Title can't be empty")}
    if(this.data.body == "") {this.errors.push("body can't be empty")}
}

Post.prototype.create = function(){
    return new Promise((resolve,reject)=>{
        this.cleanUp()
        this.validation()
        if(!this.errors.length){
            postCOllection.insertOne(this.data).then((info)=>{
                //res.send("posts successfuly")
                resolve(info.ops[0]._id)
        }).catch(()=>{
            this.errors.push("something is wrong! Please try again")
            resolve(this.errors)
        })

        }else{
            reject(this.errors)
            console.log("else :"+this.errors)
        }
       
    })
}

Post.prototype.actuallyUpdate = function(){
    return new Promise(async(resolve,reject)=>{
        this.cleanUp()
        this.validation()
        if(!this.errors.length){
            await postCOllection.findOneAndUpdate({_id:new ObjectID(this.requestedPostId)},{$set:{title:this.data.title,body:this.data.body}})
            resolve("success")
        }else{
            resolve("failure")
        }
    })
}

Post.prototype.update = function(){
    return new Promise(async(resolve,reject)=>{
        try {
            let post = await Post.findSingleId(this.requestedPostId,this.userId)
            if(post.isOwnerId){
              let status =  await this.actuallyUpdate()
                resolve(status)
            }else{

                reject()
            }

        } catch  {
            reject()
        }
    })
}

Post.reusableFunction = function(array,visitorId){
    return new Promise(async function(resolve, reject){
       let aggOperation = array.concat([
       
        {$lookup:{from: "users", localField:"author" , foreignField: "_id", as:"authorInfo"}},
        {$project:{
            title:1,
            body:1,
            currentDate:1,
            authorId:"$author",
            author:{$arrayElemAt:["$authorInfo",0]}
        }}
    ])
    try {
        
        let posts = await postCOllection.aggregate(aggOperation).toArray()
       
        posts = posts.map(function(post){
            post.isOwnerId = post.authorId.equals(visitorId)
            console.log("author id is :"+post.authorId)
            console.log("Visitor id is :"+visitorId)
            console.log(post.isOwnerId)
            post.authorId = undefined
            post.author = {
                username:post.author.username,
                avatar: new User(post.author,true).avatar
            }
            return post
        })
        resolve(posts)
       
    
    } catch (error) {
        console.log("problem in aggregate")
        reject(error)
    }
})    
}


Post.findSingleId = function(id,visitorId){
    return new Promise(async function(resolve, reject){
        if(typeof(id) != "string" || !ObjectID.isValid(id)){
            //Do something here
            console.log("rejected")
            reject()
            return 
        }
        let posts = await Post.reusableFunction([
            {$match:{_id: new ObjectID(id)}}
        ],visitorId)
        console.log(posts)
        if(posts.length){
            console.log(posts[0])
            resolve(posts[0])
        }else{
            console.log("ki somossa re vai")
            reject()
        }
    })
}

Post.findByAuthorId = function(authorId,visitorId){
    return Post.reusableFunction([
        {$match:{author:authorId}},
        {$sort:{currentDate:-1}}
    ],visitorId)
}

Post.delete = function(postIdToDelete,currentVisitor){
    return new Promise(async(resolve,reject)=>{

        try{

            let post = await Post.findSingleId(postIdToDelete,currentVisitor)
            if(post.isOwnerId){
                await postCOllection.deleteOne({_id:new ObjectID(postIdToDelete)})
                resolve()
            }else{
                reject()
            }
        }catch{
            reject()
        }
        

    })
}

Post.search = function(searchTerm){
    return new Promise(async (resolve,reject)=>{

        if(typeof(searchTerm) == "string"){

            let post = await Post.reusableFunction([
            {$match: {$text:{$search:searchTerm}}},
            {$sort:{$score:{$meta:"textScore"}}}

            ])
            resolve(post)
        }else{

            reject()
        }

    })
}

Post.postCountById = function(id){
    return new Promise(async(resolve,reject)=>{

        let postCount = await postCOllection.countDocuments({author:id})
        resolve(postCount)
    })
}
Post.getFeed = function(id){
 return new Promise(async(resolve,reject)=>{
     let followedUsers = await followCollection.find({followingId:new ObjectID(id)}).toArray()
     followedUsers = followedUsers.map(function(followUser){
         return followUser.followedId
     })
     let posts = await Post.reusableFunction([
         {$match:{author:{$in:followedUsers}}},
         {$sort:{currentDate:-1}}
     ])
     resolve(posts)
 })   
}
module.exports = Post