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


// create app
const app = express();

// connect to db
db.connectToDB();

// get user model
const User = db.User;


// app-wide middleware
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({extended : true}));
app.use(express.json());


// create a session
app.use(session({
    secret : process.env.SESSION_KEY,
    store : MongoStore.create({mongoUrl: "mongodb://localhost:27017/secretsdb"}),
    resave : false,
    saveUninitialized : true,
    cookie: {maxAge: 10000 * 60 * 60 * 20}
}))


// Passport
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


// this route sends credentials to google i.e googleOptions in strategy.Google auths user.
app.get("/auth/google", passport.authenticate("google", {scope: "profile"}));


/* This route uses the verify callback to locally auth user in our db(if user exists) or create user/store 
more user data from scope requested from google.
Sessions user by calling done(null, user) passing user to session middleware for serialization/deserialization.*/
app.get("/auth/google/secrets", passport.authenticate('google', { failureRedirect: '/login', successRedirect: "/secrets" }));

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
    const failure = `<h1> Your login credentials is not correct</h1>\
    Try again <a href="/login">Login</a>`;

    res.send(failure)
})

app.get("/logout", (req,res) => {
    req.logOut();

    const logout = `<h1> You are successfully logged out\
    <a href="/login">Login</a>`;

    res.send(logout);
})













const PORT =  3000;
app.listen(PORT, () => console.log('Server is running on port ' + PORT))



// This command help generate SSL certficates for local enviroment
// openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout privatekey.key -out certificate.crt