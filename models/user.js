
const mongoose =  require('mongoose');

mongoose.connect("mongodb://localhost:27017/test");

const userSchema =  mongoose.Schema({

    username : String,
    name : String,
    email : String,
    password : String,
    age : Number,
    post:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'
        }
    ],
    profilePic:{
        type:String,
        default:'default.png'
    }
})

module.exports = mongoose.model("user",userSchema);