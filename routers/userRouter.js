const express = require('express');
const {getUserHome, getUserProfile, getaddAddress, addTowishList, getwishList, addAddress, deleteAddress, geteditAddress, editAddress, getorderPlaced, getmyOrder,
     getRemoveFromWishlist,  } = require('../controllers/userController');
const { couponApply, getpaymentUrl, minusQuantity, addQuantity, getAddtoCart, getRemoveFromCart, getCart, getcheckOut, postCheckout, CancelOrder, ReturnOrder} = require ('../controllers/cartController')
const {getproductDetail, getShop, getCategorySort} = require ('../controllers/productController')   
const { getSignup, userLogout, userlogin, signup, getOtp, verifyOtp, login, getforgotpswrd, getresetpswrd, forgotpswrd, getlink, resetpswrd, getResetOtp, forgotPasswordOtp, } = require ('../controllers/userAuthController')    
const router = express.Router()
const userModel = require('../models/userModel')
const twilio = require('twilio');
const verifyUser = require('../middlewares/userSession');
const checkingcart=require('../middlewares/checkingcart');

router.get('/', getUserHome)
router.get('/login',login)
router.post('/login',userlogin)
router.get('/forgotpswrd',getforgotpswrd)
router.post('/forgotpswrd', forgotpswrd)
router.get('/link',getlink)
router.get('/resetpswrd/:id/:token', getresetpswrd)
router.post('/resetpswrd', resetpswrd)
router.get("/reset-otp", getResetOtp )
router.post("/forgot-password-otp", forgotPasswordOtp )

router.get('/signup',getSignup)
router.post('/signup', signup)

router.get('/logout',userLogout)

router.get('/otp',getOtp)
router.post('/otp', verifyOtp)

router.get('/shop', getShop)
router.post('/categorySort', getCategorySort)
router.get('/productDetails/:id', getproductDetail)

router.use(verifyUser)

router.get('/cart', getCart)
router.get('/addtoCart/:id',getAddtoCart)
router.get('/addQuantity/:id',addQuantity)
router.get('/minusQuantity/:id',minusQuantity)
router.get('/removeFromCart/:id',getRemoveFromCart)
router.get('/userProfile', getUserProfile)
router.get('/wishList', getwishList)
router.get('/addTowishList/:id', addTowishList)
router.get('/deleteProduct/:id',getRemoveFromWishlist)
router.get("/delete-address/:id", deleteAddress)

router.get("/add-address", getaddAddress )
router.post('/add-address', addAddress)

router.get("/edit-address/:id", geteditAddress)
router.post("/edit-address/:id", editAddress )

router.get('/checkout',checkingcart,getcheckOut)
router.post('/checkout',postCheckout)
router.get('/return',getpaymentUrl)

router.get('/orderPlaced', getorderPlaced)
router.get('/myorder', getmyOrder)

router.post('/couponApply',couponApply)

router.get('/Cancel-order/:id',CancelOrder)
router.get('/Return-order/:id',ReturnOrder)


module.exports = router;