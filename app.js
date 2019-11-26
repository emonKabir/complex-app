const express = require("express")
const session = require("express-session")
const MongoConnect = require("connect-mongo")(session)
const flash = require("connect-flash")
const app = express()

let sessionOptions = session({

    secret: "java script",
    store: new MongoConnect({client : require("./db")}),
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000 * 60 * 60 * 24, httpOnly : true}
})
app.use(flash())
app.use(sessionOptions)

app.use(function(req,res,next){

    //make flash available to ejs file
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")
    //make current user id available to req object
    if(req.session.user){
        req.visitorId = req.session.user._id
        console.log(" app js visitor id : "+req.visitorId)
    }else{
        
        req.visitorId = 0
    }
    //make user session data available to ejs template
    res.locals.user = req.session.user
    next()
})
const router = require("./router")

app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(express.static("public"))
app.set("views","views")
app.set("view engine","ejs")

app.use('/',router)
module.exports = app