
const bcrypt = require("bcryptjs")
const userCOllection = require("../db").db().collection("users")
const validator  = require("validator")
const md5 = require("md5")

let User  = function (data,getAvatar){
    this.data = data
    this.errors = []
    if(getAvatar == undefined) {getAvatar  = false}
   else if(getAvatar == true) {this.getAvatar()}
}

User.prototype.cleanUp = function() {

    this.data = {
        username:this.data.username.toLowerCase(),
        email:this.data.email.toLowerCase(),
        password:this.data.password
    }
}


User.prototype.validating = function(){

    return new Promise(async  (resolve,reject) => {
        if(this.data.username == "") {this.errors.push("user name field cant be empty")}
        if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("user name can only contains char and number")}
        if(!validator.isEmail(this.data.email)) {this.errors.push("email field cant be empty")}
        if(this.data.password.length < 4) {this.errors.push("password must be contains 6 character")}
    
        //let userName = this.data.username
        if(this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)){
    
            let findUser =  await userCOllection.findOne({username:this.data.username})
            if(findUser){
                this.errors.push("user name is already exists")
                console.log(this.data.username)
            }
    
        }
        //checking wheather email is alrdy exists
        if(validator.isEmail(this.data.email)){
    
            let findEmail =  await userCOllection.findOne({email:this.data.email})
            if(findEmail){
                this.errors.push("email is already exists")
                console.log(this.data.username)
            }
    
        }
        resolve()
        
    })
}

User.prototype.register = function(){
    return new Promise(async (resolve, reject)=> {
        //validating form
        
        this.cleanUp()
        await this.validating()
      if(!this.errors.length){
            let salt  =  bcrypt.genSaltSync(10)
            this.data.password =  bcrypt.hashSync(this.data.password,salt)
          await  userCOllection.insertOne(this.data)
            this.getAvatar()
            resolve()
        }else{
            reject(this.errors)
        } 
    })
}

User.prototype.login = function () {
    return new Promise((resolve,reject)=>{

        userCOllection.findOne({username:this.data.username}).then((currentUser)=>{
                if(currentUser && bcrypt.compareSync(this.data.password,currentUser.password)){
                   this.data = currentUser
                    this.getAvatar() 
                    console.log(currentUser)
                    resolve(currentUser)
                }else{
                    reject("invalid user nmae or password")
                }
        }).catch(function(e){
                console.log(e)
        })
    })
        // let salt = bcrypt.genSaltSync(10)

   
}
      
   
 

 User.prototype.getAvatar = function(){

    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
 }

 User.findUserByUserName = function(username){

    return new Promise(async function(resolve,reject){

        userCOllection.findOne({username:username}).then(function(userFound){
                if(userFound){
                    
                userFound = new User(userFound,true)
                console.log(userFound)

                userFound = {
                    _id:userFound.data._id,
                    username:userFound.data.username,
                    avatar:userFound.avatar
                }
                console.log("User  :" +userFound.username+" "+userFound.avatar)
                resolve(userFound)

                }else{
                    reject()
                }

               
        }).catch(function(){
            reject()
        })
    })
 }

 User.findUserByEmail = function(email){

    return new Promise(async function(resolve,reject){
        let user = await userCOllection.findOne({email:email})
        if(user){
            resolve(true)
        }else{
            resolve(false)
        }
    })
 }

 module.exports = User 
