const userCollection = require("../db").db().collection("users")
const followCollection = require("../db").db().collection("follow")
const ObjectID = require("mongodb").ObjectID
const User = require("../models/User")

let Follow = function(followedUser,currentUserId){
    this.followedUser = followedUser
    this.currentUserId = currentUserId
    this.errors = []
}

Follow.prototype.cleanUp = function(){
    if(typeof(this.followedUser) != "string"){this.followedUser = ""}
}

Follow.prototype.validation = async function(){

    let followedUserExist = await userCollection.findOne({username:this.followedUser})
    if(followedUserExist){
        this.followedUserId = followedUserExist._id
    }else{
        this.errors.push("user not exist you are trying to follow")
    }
}

Follow.prototype.create =  function(){
    return new Promise(async(resolve,reject)=>{
    this.cleanUp()
    await this.validation()
    if(!this.errors.length){

       await followCollection.insertOne({followedId:this.followedUserId,followingId:new ObjectID(this.currentUserId)})
       resolve()
    }else{
        reject(this.errors)
    }

    })
    
}

Follow.prototype.delete =  function(){
    return new Promise(async(resolve,reject)=>{
    this.cleanUp()
    await this.validation()
    if(!this.errors.length){

       await followCollection.deleteOne({followedId:this.followedUserId,followingId:new ObjectID(this.currentUserId)})
       resolve()
    }else{
        reject(this.errors)
    }

    })
    
}

Follow.isVisitorFollowing = async function(followedId,followingId){

 let isFollowed = await followCollection.findOne({followedId:followedId,followingId:new ObjectID(followingId)})
    return isFollowed
}

Follow.followerById = function(id){
    return new Promise(async(resolve,reject) =>{
       
       try {
           
        let followers = await followCollection.aggregate([
            {$match:{followedId:id}},
            {$lookup:{from: "users", localField: "followingId",foreignField:"_id", as: "userDoc"}},
            {$project:{
                username:{$arrayElemAt:["$userDoc.username",0]},
                email:{$arrayElemAt:["$userDoc.email",0]}
            }}
        ]).toArray()
        
       followers = followers.map(function(follower){
           let user = new User(follower,true)
            return {username:follower.username,avatar:user.avatar}
        })
        
        console.log(followers)
        resolve(followers)
       } catch  {
          
           reject()
       }

    })

    
}

Follow.followingById = function(id){
    return new Promise(async(resolve,reject) =>{
       
       try {
          // console.log(" follwing id : "+id)
        let followers = await followCollection.aggregate([
            {$match:{followingId:id}},
            {$lookup:{from: "users", localField: "followedId",foreignField:"_id", as: "userDoc"}},
            {$project:{
                username:{$arrayElemAt:["$userDoc.username",0]},
                email:{$arrayElemAt:["$userDoc.email",0]}
            }}
        ]).toArray()
        
       followers = followers.map(function(follower){
           let user = new User(follower,true)
            return {username:follower.username,avatar:user.avatar}
        })
       // console.log(followers) 
        resolve(followers)
       } catch  {
         
           reject()
       }

    })

    
}

Follow.followerCountById = function(id){
    return new Promise(async(resolve,reject)=>{

        let followerCount = await followCollection.countDocuments({followedId:id})
        resolve(followerCount)
    })
}


Follow.followingCountById = function(id){
    return new Promise(async(resolve,reject)=>{

        let followingCount = await followCollection.countDocuments({followingId:id})
        resolve(followingCount)
    })
}
module.exports = Follow