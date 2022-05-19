require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const path = require('path');
const db = require("./db");
const session = require("express-session");
const passport = require("./passport");
const isAuth = require("./authMiddleware");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");


// create app
const app = express();

// connect to db
db.connectToDB();

// get user model
const User = db.User;

// app-wide middleware
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json());

// create a session
app.use(session({
    secret : process.env.SESSION_KEY,
    store : MongoStore.create({mongoUrl: "mongodb://localhost:27017/secretsdb"}),
    resave : false,
    saveUninitialized : true,
    cookie: {maxAge: 10000 * 60 * 60 * 20}
}))

app.use(passport.initialize());
app.use(passport.session());


// view engine
app.set("view engine", "ejs");

// Routes

app.get('/', (req,res) => {
    res.render("home");
})


app.route('/register')
    .get((req,res) => {
    res.render("register");
})
    .post((req,res) => {
        const saltRounds = 10;

        bcrypt.hash(req.body.password, saltRounds,function(err, hash){

        if(err) console.log(err.message)

        // payload 
        const user = new User({
            email : req.body.email,
            password : hash
        })

        User.create(user, function(err){
            if(err) return {err};
            console.log('New user registered');
            res.redirect("/login");
        })
        })
        
})

app.route('/login')
     .get((req,res) => {
      res.render("login");
})   
    .post(passport.authenticate("local", {failureRedirect: "/loginFailure", successRedirect: "/secrets"}));


app.route('/submit')
    .get((req,res) =>  {
    res.render("submit")
    })  
    .post((req,res) => {
        
    })

app.get('/secrets', isAuth, (req,res) => {
    res.render("secrets");
})

app.get('/loginFailure', (req,res) => {
    const failure = `<h1> Your login credentials is not correct,</h1>\
    Try again <a href="/login">Login</a>`;

    res.send(failure)
})























const PORT =  3000;
app.listen(PORT, () => console.log('Server is running on port ' + PORT))