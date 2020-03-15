const express = require("express")
const session = require("express-session")
const MongoConnect = require("connect-mongo")(session)
const flash = require("connect-flash")
const sanitizeHtml = require("sanitize-html")
//const csrf = require("csurf")
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/api',require('./api-router'))


let sessionOptions = session({

    secret: "java script",

    store: new MongoConnect({ client: require("./db") }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
})

app.use(flash())
app.use(sessionOptions)

app.use(function (req, res, next) {

    //make flash available to ejs file
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")
    //make current user id available to req object
    if (req.session.user) {
        req.visitorId = req.session.user._id
        //console.log(" app js visitor id : "+req.visitorId)
    } else {

        req.visitorId = 0
    }
    //make user session data available to ejs template
    res.locals.user = req.session.user
    next()
})



app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")

const router = require("./router")
/*
app.use(csrf())
app.use(function(req,res,next){
    res.locals.csrfToken = req.csrfToken()
    next()
})
*/
app.use('/', router)

//Initializing socket connection
const server = require("http").createServer(app)
const io = require("socket.io")(server)

io.use(function (socket, next) {
    sessionOptions(socket.request, socket.request.res, next)
})
io.on("connection", function (socket) {

    //console.log("connection stablish");
    if (socket.request.session.user) {
        let user = socket.request.session.user;
        //sending browser user information
        socket.emit("welcome", { username: user.username, avatar: user.avatar })

        // receive a message from browser end
        socket.on("chatMessageFromBrowser", (data) => {


            //Sending a message to all browser except self.
            socket.broadcast.emit("chatMessageFromServer", { message: sanitizeHtml(data.message, { allowedTags: [], allowedAttributes: [] }), username: user.username, avatar: user.avatar })
        })
    }
})
module.exports = server
