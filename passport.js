const req = require("express/lib/request");
const passport = require("passport");
const User = require("./db").User;
const LocalStrategy = require("passport-local").Strategy
// Ensure you install the right google strategy oauth20 NOT oauth 2.0
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require("bcrypt");


/*----------------------------- LOCAL STRATEGY -------------------- */

/* The custom fields tell passport what req.body to read into username and password.
Here it is req.body.email ---> username. req.body.password --> password */


const customFields = {
    usernameField : "email",
    passwordField : "password"
}

const localVerifyCallback = (username, password, done) => {
        User.findOne({email : username}, function(err, user){
            if(err) {return done(err)}

            if(!user) {return done(null, false)}

            //Lets validate user password

            const userPasswordText = password;
            const hashOnFile = user.password;

            bcrypt.compare(userPasswordText, hashOnFile, function(err, result){

                    if(err) {return done(err)}
                    
                // Here if the user exists,we call done() passing the user to session middleware
                    if(result) return done(null, user)

                    return done(null, false);
            })  
        })
}

const localStrategy = new LocalStrategy(customFields, localVerifyCallback);

// Use Local strategy
passport.use(localStrategy);

/*--------------- GOOGLE AUTH WITH OAUTH 2.0 ----------------- */


// Authenticate with google.
const googleOptions = {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets"
}

const localGoogleUserVerifyCallback = (accessToken, refreshToken, profile, done) => {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
                // The done() pass the user over to the session middleware
                return done(err, user);
              });
}


const googleStrategy = new GoogleStrategy(googleOptions, localGoogleUserVerifyCallback);

passport.use(googleStrategy);


/*-------------------- MANTAIN SESSION AND SET COOKIES ----------------- */

// Serialise/Deserialise any found user into a session.
/*
Serialisation stores the found user into req.session.passort.user object({}).It stores is _id.
req.session.passport.user = {Id: userId}.
*/
passport.serializeUser(function(user,done){
    done(null, user._id);
})

/* ------- When you call passport.authenticate("local"); Passport calls localStrategy and serializeUser().
If any of them fail,Authentication is denied. ---*/

/*
At deserialisation,the _id is grabbed from req.session.passport.user from the session and used to
search for the user in the db.This process is what is called by req.isAuthenticated().Th is authorisation.
*/
passport.deserializeUser(function(userId, done){
    User.findById({_id : userId}, function(err, user){
        if(err) console.log(err.message);
        done(null, user);
    })
})






/*------------------- EXPORT PASSPORT ------------------- */

module.exports = passport