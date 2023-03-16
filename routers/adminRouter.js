const express = require('express')
const router = express.Router()
const { addCategory, adminhome, adminlogin, login, logout, getEditUser, editUser, deleteUser, searchUser, createUser, getCategory, getaddCategory, getaddBrand, addBrand, getBrand, getaddProduct, addProduct, getProduct, deleteCategory, deleteProduct, deleteBrand, editCategory, getEditCategory, getEditProduct, editProduct, getEditBrand, editBrand, getShop, getUser, getAdduser, getaddcoupon, addCoupon, deleteCoupon, getEditCoupon, editCoupon, getCoupon, getorders, orderStatus } = require('../controllers/adminController');
const multipleUpload = require('../middlewares/multer');
const adminModel = require('../models/adminModel')
const brandModel = require('../models/brandModel')
const categoryModel = require('../models/categoryModel')
const { route } = require('./userRouter')
const verifyAdmin = require('../middlewares/adminSession');




router.get('/adminLogin', adminlogin)
router.post('/adminLogin', login)

router.get('/logout', logout)
router.get('/', adminhome)


router.use(verifyAdmin)
router.get('/add-category', getaddCategory)
router.post('/add-category', multipleUpload.upload, addCategory)
router.get('/category', getCategory)
router.get("/delete-category/:id", deleteCategory)
router.get("/edit-category/:id", getEditCategory)
router.post("/edit-category", editCategory)


router.get('/add-product', getaddProduct)
router.post('/add-product',multipleUpload.upload, addProduct)
router.get('/product', getProduct)
router.get("/delete-product/:id", deleteProduct)
router.get("/edit-product/:id", getEditProduct)
router.post("/edit-product",multipleUpload.upload, editProduct)


router.get('/add-brand', getaddBrand)
router.post('/add-brand', addBrand)
router.get('/brand', getBrand)
router.get("/delete-brand/:id", deleteBrand)
router.get("/edit-brand/:id", getEditBrand)
router.post("/edit-brand", editBrand)

router.get('/add-coupon', getaddcoupon)
router.post('/add-coupon', addCoupon)
router.get('/coupon', getCoupon)
router.get("/delete-coupon/:id", deleteCoupon)
router.get("/edit-coupon/:id", getEditCoupon)
router.post("/edit-coupon", editCoupon)

router.get('/add-user',getAdduser)
router.get('/user', getUser)
router.get("/edit-user/:id", getEditUser)
router.post("/edit-user", editUser)
router.get("/delete-user/:id", deleteUser)
router.post("/search-user", searchUser)
router.post('/add-user', createUser)

router.get('/orders', getorders)
router.post('/orderStatus',orderStatus)
module.exports = router
