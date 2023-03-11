const mongoose=require('mongoose')

const bannerSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    main_image:{
        type:Object,
        required:true
    }
})
const bannerModel=mongoose.model('banner',bannerSchema)
module.exports=bannerModel;