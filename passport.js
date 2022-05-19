const req = require("express/lib/request");
const passport = require("passport");
const User = require("./db").User;
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt");


const customFields = {
    usernameField : "email",
    passwordField : "password"
}

const verifyCallback = (username, password, done) => {
        User.findOne({email : username}, function(err, user){
            if(err) {return done(err)}

            if(!user) {return done(null, false)}

            //Lets validate user password

            const userPasswordText = password;
            const hashOnFile = user.password;

            bcrypt.compare(userPasswordText, hashOnFile, function(err, result){
                    if(err) {return done(err)}

                    if(result) return done(null, user)

                    return done(null, false);
            })  
        })
}

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser(function(user,done){
        done(null, user._id);
})

passport.deserializeUser(function(userId, done){
        User.findById({_id : userId}, function(err, user){
            if(err) console.log(err.message);
            done(null, user);
        })
})

module.exports = passport;