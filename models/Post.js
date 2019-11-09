
const postCOllection = require("../db").db().collection("posts")
const ObjectID  = require("mongodb").ObjectID
const User = require("./User")

let Post = function(data,userId){
this.data = data
this.errors = []
this.userId = userId
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
            postCOllection.insertOne(this.data).then(()=>{
                //res.send("posts successfuly")
                resolve()
        }).catch(()=>{
            this.errors.push("something is wrong! Please try again")
            reject(this.errors)
        })

        }else{
            reject(this.errors)
            console.log("else :"+this.errors)
        }
       
    })
}
Post.findSingleId = function(id){
    return new Promise(async function(resolve, reject){
        if(typeof(id) != "string" || !ObjectID.isValid(id)){
            //Do something here
            console.log("rejected")
            reject()
            return 
        }
        let posts = await postCOllection.aggregate([
            {$match: {_id:new ObjectID(id)}},
            {$lookup:{from: "users", localField:"author" , foreignField: "_id", as:"authorInfo"}},
            {$project:{
                title:1,
                body:1,
                currentDate:1,
                author:{$arrayElemAt:["$authorInfo",0]}
            }}
        ]).toArray()
       
        posts = posts.map(function(post){
            post.author = {
                username:post.author.username,
                avatar: new User(post.author,true).avatar
            }
            return post
        })
        if(posts.length){
            console.log(posts[0])
            resolve(posts[0])
        }else{
            reject()
        }
    })
}
module.exports = Post