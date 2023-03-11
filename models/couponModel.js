const mongoose=require('mongoose')
const couponSchema=mongoose.Schema({
    name:{
        type:String
    },
    couponcode:{
        type:String
    },
    cashback:{
        type:Number
    },
    minamount:{
        type:Number
    },
    expdate:{
        type:Date
    },
    status:{
        type:String
    }
    
})

const couponModel=mongoose.model('coupon',couponSchema)
module.exports=couponModel;