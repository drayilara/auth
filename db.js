const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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


async function connectToDB() {
    try{
        await mongoose.connect('mongodb://localhost:27017/secretsdb');
    }catch(err){
        console.log(`Error: ${err.message}`);
    } 
  }


//   Expose 

module.exports = {
    User,
    connectToDB
}