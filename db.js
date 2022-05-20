const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

// User schema
const userSchema = new mongoose.Schema({
    email : String,

    password : String,

    googleId : String
})

// Plug in the custom mongoose findOrCreate functionality

userSchema.plugin(findOrCreate);


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