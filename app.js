require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require('path');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Encryption details
const saltRounds = 10;

// app-wide middleware
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended : true}));

// connect to db
async function connectToDB() {
    try{
        await mongoose.connect('mongodb://localhost:27017/secretsdb');
    }catch(err){
        console.log(`Error: ${err.message}`);
    } 
  }

connectToDB();

// User schema
const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: [1, 'Please supply email']
    },

    password : {
        type : String,
        required : [1, 'Please supply password']
    }
})


// User model
const User = mongoose.model('User', userSchema);

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
        // Get data and save
        const email = req.body.username;
        const password = req.body.password;

       

        bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.

            if(err){
                console.log(err.message);
            }else {
                const newUser = new User({
                    email : email,
                    password : hash
                })
    
                User.create(newUser, (err) => {
                    if(err){
                        res.send(`Oops an error occured: ${err.message}`)
                    }else{
                        res.render("secrets");
                    }
                })
            
            }
    })
})

app.route('/login')
     .get((req,res) => {
      res.render("login");
})   
    .post((req,res) => {
        //Authentication and show secrets.js.
        const email = req.body.username;
        const password = req.body.password;

       
    
        User.findOne({email: email}, (err, user) => {
            if(err) res.send(`An error occured: ${err.message}`);
            
            if(user){
                bcrypt.compare(password, user.password, function(err, result) {
                    if(err) console.log(err.message)
                    else{
                        if(result) res.render("secrets");
                        else res.send('Please enter the correct password')
                    }
                });  
            }else res.send('Please enter valid login details');   
        })
    })

app.route('/submit')
    .get((req,res) =>  {
    res.render("submit")
    })  
    .post((req,res) => {
        const secret = req.body.secret;
    })























const PORT =  3000;
app.listen(PORT, () => console.log('Server is running on port ' + PORT))