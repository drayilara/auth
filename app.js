const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require('path');

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req,res) => {
    res.render(__dirname + "/views/home");
})

app.route('/register')
    .get((req,res) => {
    res.render(__dirname + "/views/register");
})
    .post((req,res) => {
        // Handle registration,and give feedback??
    })

app.route('/login')
     .get((req,res) => {
    res.render(__dirname + "/views/login");
})   
    .post((req,res) => {
        //Handle login details,and give feedback
    })






















const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running on port ' + PORT));