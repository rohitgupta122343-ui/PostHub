

const mongoose =  require('mongoose');



const postSchema =  mongoose.Schema({

    user : {
        type:mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    content : String,
    date : {
        type:Date,
        default:Date.now
    },
    like:{
        type:String,
        default:0
    }
    
   
})

module.exports = mongoose.model("post",postSchema);