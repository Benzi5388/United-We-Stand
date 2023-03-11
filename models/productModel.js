const mongoose=require('mongoose')
const { array } = require('../middlewares/multer')

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },

    quantity:{
        type:Number,
        required:true
    },

    mrp:{
        type:Number,
        
    },

    brand:{
        type:String
    },

    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    main_image:{
        type:Object,
        required:true
    },

    sub_image:{
        type:Array,
        required:true

    },

    status:{
        type:Boolean,
        default:true
    },

},{timestamps:true})

const productModel=mongoose.model('product',productSchema)

module.exports=productModel