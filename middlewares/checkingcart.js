const userModel = require("../models/userModel")

const checkingcart= async (req,res,next)=>{
    const user=await userModel.findById({_id:req.session.user.id}).lean()
   if(user.cart.length==0){
    res.redirect('/cart')
 
   }else{
    next()
   }
}
module.exports=checkingcart   