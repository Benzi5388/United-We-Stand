const { ObjectId } = require('mongodb');
const mongoose=require('mongoose')
const orderSchema=new mongoose.Schema({
    orderStatus:{
        type:String,
        default:"pending"
    },
    paid:{
        type:Boolean,
        required:true,
        default:false
    },
    address:{
        type:Object,
        required:true
    },
    product:{
        type:Object,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: function(date) {
          return date.toLocaleDateString();
        }
      },
    userId:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    dispatch:{
        type:Date,
        default: new Date(new Date().setDate(new Date().getDate() + 7))
    },
    
    payment:{
        type:Object,
        default:{}
    },
    paymentType:{
        type:String,
        default:'cod'
    },

    coupon:{
        type:Object,
        default:{applied:false, price:0, coupon:{}}
    },

    wallet:{
        type:Object,
        default:{applied:false}
    },

    total:{
        type:Number,
        required:true
    }
},{timestamps:true})
const orderModel = mongoose.model('orders', orderSchema);
module.exports = orderModel