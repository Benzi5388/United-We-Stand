const mongoose = require('mongoose')

const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cart:{
        type:Array
    },
    wishlist:{
        type:Array
    },
    address:{
        type:Array
    },
    wallet:{
        type:Number,
        default:0
    },
    banner:{
        type:Boolean
    },
})

const userModel= mongoose.model('user', userSchema)

module.exports= userModel;