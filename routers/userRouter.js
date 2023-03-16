const express = require('express');
const {getUserHome, getSignup, userLogout, userlogin, signup, getOtp, getShop, verifyOtp, login, getproductDetail, getCart, addTocart, getUserProfile, getWishList, getaddAddress, addTowishList, getwishList, addAddress, deleteAddress, geteditAddress, editAddress, getcheckout, incrementCart, getorderPlaced, getmyOrder, getcheckOut, getAddtoCart, addQuantity, minusQuantity, getRemoveFromCart,
     checkOut, postCheckout, getpaymentUrl, getRemoveFromWishlist, getCategorySort, menCateg, womenCateg, kidCateg, accCateg, bagCateg, couponApply, } = require('../controllers/userController');
const router = express.Router()
const userModel = require('../models/userModel')
const twilio = require('twilio');
const verifyUser = require('../middlewares/userSession');
const checkingcart=require('../middlewares/checkingcart')

router.get('/', getUserHome)
router.get('/login',login)
router.post('/login',userlogin)
router.get('/signup',getSignup)
router.get('/logout',userLogout)
router.get('/otp',getOtp)
router.post('/otp', verifyOtp)
router.post('/login',userlogin)
router.post('/signup', signup)

router.get('/shop', getShop)


// router.get('/menCateg', menCateg)
// router.get('/womenCateg', womenCateg)
// router.get('/kidCateg', kidCateg)
// router.get('/accCateg', accCateg)
// router.get('/bagCateg', bagCateg)

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


module.exports = router;