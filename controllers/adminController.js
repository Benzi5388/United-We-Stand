const express = require('express')
// const adminModel = require('../models/adminModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const adminRouter = require('../routers/adminRouter')
const multipleUpload = require('../middlewares/multer');
const couponModel = require('../models/couponModel');
const orderModel = require('../models/orderModel');
const router = express.Router()

//GET METHOD FOR ADMIN HOME
const adminhome = async (req, res) => {
    const users = await userModel.find().lean();

    if (req.session.admin) {
        res.render('adminHome', { users })
    } else {
        res.redirect('/admin/adminLogin')
    }
}

//POST METHOD FOR ADMIN LOGIN
const adminlogin = (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin')
    } else {
        res.render('adminLogin')
    }
}

//POST REQUEST FOR LOGIN PAGE
const login = (req, res) => {
    const email = 'admin@gmail.com'
    const password = '1234'

    if (email == req.body.email && password == req.body.password) {
        req.session.admin = {
            id: email
        }
        res.redirect('/admin')
    } else {
        res.render('adminLogin', { error: true, message: 'Invalid Credentials!!!' })
    }
}

//LOGOUT REQUEST
const logout = (req, res) => {
    req.session.admin = null
    res.redirect('/admin/adminlogin')
}

//******************************USERS DATA******************************* */

//GET USER
const getUser = async (req, res) => {
    const user = await userModel.find().lean()
    res.render('user', { user })
}

//POST REQUEST FOR ADD-USER
const createUser = (req, res) => {
    const { name, phone, email, password } = req.body;
    const phoneRegex = /^\d{10}$/; // regular expression to check if phone number is in valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // regular expression to check if email address is in valid format
    if (name.trim() === "" || !/^[a-zA-Z]+$/.test(name) || !phone.trim() || !email.trim() || !password.trim()){
        const error = "all fields required"
        res.render('createUser', { error: true, message: 'Invalid Data!!!'  })
    }
    if (name.trim().length === 0 || phone.trim().length === 0 || password.trim().length === 0){
        const error = "all field required"
        res.render('createUser', { error: true, message: 'Invalid Data!!!'  })
    } else if (!phoneRegex.test(phone)) {
        const error = "invalid phone number"
        res.render('createUser', { error: true, message: 'Invalid Data!!!'  })
    } else if (!emailRegex.test(email)) {
        const error = "invalid email address"
        res.render('createUser', { error: true, message: 'Invalid Data!!!'  })
    } else {
        const user = new userModel({ name: name, phone: phone, email: email, password: password })
        user.save((err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/admin/user')
            }
        })
    }
}


//GET REQUEST FOR ADD USER
const getAdduser = (req, res) => {
    res.render('add-user')
}

//GET REQUEST FOR EDIT-USER
const getEditUser = async (req, res) => {
    const _id = req.params.id;
    const user = await userModel.findOne({ _id }).lean();

    res.render("edit-user", { user })
}

//POST REQUEST FOR EDIT-USER
const editUser = async (req, res) => {
    const _id = req.body._id
    await userModel.findByIdAndUpdate(_id, {
        $set: {
            ...req.body
        }
    })
    res.redirect("/admin/user")
}

//DELETING THE USER
const deleteUser = async (req, res) => {
    const id = req.params.id
    await userModel.deleteOne({ _id: id })
    res.redirect('/admin/user')
}

const searchUser = async (req, res) => {
    const name = req.body.name
    const users = await userModel.find({ name: new RegExp(name, "i") }).lean();

    res.render('adminHome', { users })
}

//****************************CATEGORY PAGE******************************************** */

// POST REQUEST FOR ADD-CATEGORY
const addCategory = (req, res) => {
    const { name } = req.body;
    if (name.trim() === "") {
        const err = "all field reqiured"
        res.render('add-category', { err: true, message: 'Invalid Data!!!' })
    }
    else {
        const category = new categoryModel({ name })
        category.save((err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/admin/category')
            }
        })
    }
}

//GET REQUEST FOR CATEGORY
const getCategory = async (req, res) => {

    const category = await categoryModel.find().lean()

    res.render('category', { category })
}

//GET REQUEST FOR ADD CATEGORY
const getaddCategory = (req, res) => {
    res.render('add-category')
}

//DELETE CATEGORY
const deleteCategory = async (req, res) => {
    const id = req.params.id
    await categoryModel.deleteOne({ _id: id })
    res.redirect('/admin/category')
}


//GET REQUEST FOR EDIT-CATEGORY
const getEditCategory = async (req, res) => {
    const _id = req.params.id;
    const category = await categoryModel.findOne({ _id }).lean();

    console.log(category)
    res.render("edit-category", { category })
}

//POST REQUEST FOR EDIT-CATEGORY
const editCategory = async (req, res) => {
    const _id = req.body._id
    console.log(req.body);
    await categoryModel.findByIdAndUpdate(_id, {
        $set:
            { name: req.body.name }

    })
    res.redirect("/admin/category")
}

//******************************************BRAND PAGE************************************** */

//GET REQUEST FOR BRAND
const getBrand = async (req, res) => {
    const brand = await brandModel.find().lean()
    res.render('brand', { brand })
}

//POST REQUEST FOR ADD-BRAND
const addBrand = (req, res) => {
    const { name } = req.body;
    if (name.trim() === "") {
        const err = "all field reqiured"
        res.render('add-brand', { err: true, message: 'Invalid Data!!!' })
    }
    else {
        const brand = new brandModel({ name })
        brand.save((err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/admin/brand')
            }
        })
    }
}

//GET REQUEST FOR ADD-BRAND
const getaddBrand = (req, res) => {
    res.render('add-brand')
}

//GET REQUEST FOR EDIT-BRAND
const getEditBrand = async (req, res) => {
    const _id = req.params.id;
    const brand = await brandModel.findOne({ _id }).lean();
    console.log(brand)
    res.render("edit-brand", { brand })
}

//POST REQUEST FOR EDIT-BRAND
const editBrand = async (req, res) => {
    const _id = req.body._id
    await brandModel.findByIdAndUpdate(_id, {
        $set: {
            ...req.body
        }
    })
    res.redirect("/admin/brand")
}

//DELETE BRAND
const deleteBrand = async (req, res) => {
    const id = req.params.id
    await brandModel.deleteOne({ _id: id })
    res.redirect('/admin/brand')
}

//*************************************PRODUCT PAGE***************************************** */

//GET REQUEST FOR PRODUCT PAGE
const getProduct = async (req, res) => {
    const products = await productModel.find().lean()
    console.log(products);
    res.render('product', { products })
}

//GET REQUEST FOR ADD-PRODUCT PAGE
const getaddProduct = async (req, res) => {
    const brand = await brandModel.find({}).lean();
    const category = await categoryModel.find({}).lean();
    res.render('add-product', { category, brand })
}

//POST REQUEST FOR ADD PRODUCT
const addProduct = async (req, res) => {

    const { name,price,mrp } = req.body;
    if (name.trim() === "" || !/^[a-zA-Z]+$/.test(name)) {
        const err = ""
        res.render('add-product', { err: true, message: 'Invalid data!!!' })
    }
    else if (price < 0 || mrp < 0) {
        const err = ""
        res.render('add-product', { err: true, message: 'Price and MRP fields cannot be negative.' })
    }
    else if (price >= mrp) {
        const err = ""
        res.render('add-product', { err: true, message: 'Price must be less than MRP.' })
    }
    else if (isNaN(price) || isNaN(mrp)) {
        const err = ""
        res.render('add-product', { err: true, message: 'Price and MRP fields must be numeric.' })
    }
    else {
        console.log(req.body);
        await productModel.create({ ...req.body, main_image: req.files.main_image[0] })

            .then(() => {
                res.redirect('/admin/product')
            })
    }
}

//GET REQUEST FOR EDIT-PRODUCT
const getEditProduct = async (req, res) => {
    const _id = req.params.id;
    const product = await productModel.findOne({ _id }).lean();
    const category = await categoryModel.find().lean()
    res.render("edit-product", { product, category })
}

//POST REQUEST FOR EDIT-PRODUCT
const editProduct = async (req, res) => {
    const _id = req.body._id
    console.log(req.files)
    if (!req.files.main_image && !req.files.sub_image) {
        await productModel.findByIdAndUpdate(_id, {
            $set: {
                ...req.body
            }
        })
    }
    if (req.files.main_image && !req.files.sub_image) {
        await productModel.findByIdAndUpdate(_id, {
            $set: {
                ...req.body,
                main_image: req.files.main_image[0]
            }
        })
    }
    if (!req.files.main_image && req.files.sub_image) {
        await productModel.findByIdAndUpdate(_id, {
            $set: {
                ...req.body,
                sub_image: req.files.sub_image
            }
        })
    }
    if (req.files.main_image && req.files.sub_image) {
        await productModel.findByIdAndUpdate(_id, {
            $set: {
                ...req.body,
                sub_image: req.files.sub_image,
                main_image: req.files.main_image[0]
            }
        })
    }
    res.redirect("/admin/product")
}

//DELETE PRODUCT
const deleteProduct = async (req, res) => {
    const id = req.params.id
    await productModel.deleteOne({ _id: id })
    res.redirect('/admin/product')
}

// ***************************COUPONS **********************************************

//GET REQUEST FOR COUPON
const getCoupon = async (req, res) => {
    const coupon = await couponModel.find().lean()
    for(i=0;i<coupon.length;i++){
        coupon.map((item, index)=>{
            coupon[i].date=coupon[i].expdate.toDateString();
          })
      }
      console.log(coupon);
    res.render('coupons', { coupon })
}

//POST REQUEST FOR ADD-COUPON
const addCoupon = (req, res) => {
    const { name, couponcode, cashback, minamount, expdate, status  } = req.body;
    if (name.trim() === "") {
        const err = "all field reqiured"
        res.render('add-coupon', { err: true, message: 'Invalid Data!!!' })
    }
    else {
        const coupon = new couponModel({ name, couponcode, cashback, minamount, expdate, status })
        coupon.save((err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/admin/coupon')
            }
        })
    }
}

//GET REQUEST FOR ADD-COUPON
const getaddcoupon = (req, res) => {
    res.render('add-coupon')
}

//GET REQUEST FOR EDIT-COUPON
const getEditCoupon = async (req, res) => {
    const _id = req.params.id;
    const coupon = await couponModel.findOne({ _id }).lean();
    console.log(coupon)
    res.render("edit-coupon", { coupon })
}

//POST REQUEST FOR EDIT-COUPON
const editCoupon = async (req, res) => {
    const _id = req.body._id
    await couponModel.findByIdAndUpdate(_id, {
        $set: {
            ...req.body
        }
    })
    res.redirect("/admin/coupon")
}

//DELETE COUPON
const deleteCoupon = async (req, res) => {
    const id = req.params.id
    await couponModel.deleteOne({ _id: id })
    res.redirect('/admin/coupon')
}

// ************************ORDERS ************************************************

//GET REQUEST FOR ORDERS
const getorders = async (req, res) => {
    const _id = req.params.id;
    const order = await orderModel.find({}).lean();
    console.log(order)
    res.render("orders", { order })
}

const orderStatus=async(req,res)=>{
    console.log(req.body)
    await orderModel.updateOne({_id:req.body.id},{$set:{orderStatus:req.body.action}}).then((result)=>{
        console.log(result);
        res.redirect('back')
    })
}

//EXPORTING MODULES
module.exports = {
    getorders, getCoupon, getaddcoupon, getEditCoupon, editCoupon, deleteCoupon, addCoupon, createUser, getAdduser, getUser, addProduct, deleteProduct, getProduct, getaddProduct, editProduct, getEditProduct, addBrand, deleteBrand, getBrand, getaddBrand, editBrand, getEditBrand, addCategory, deleteCategory, editCategory, getEditCategory, getCategory, getaddCategory, adminhome, adminlogin, login, logout, deleteUser, editUser, getEditUser, searchUser, createUser,orderStatus
}