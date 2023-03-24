const express = require("express");
const adminModel = require('../models/adminModel');
const brandModel = require("../models/brandModel");
const categoryModel = require("../models/categoryModel");
const bannerModel = require("../models/bannerModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const adminRouter = require("../routers/adminRouter");
const multipleUpload = require("../middlewares/multer");
const couponModel = require("../models/couponModel");
const orderModel = require("../models/orderModel");
const { findOne } = require("../models/brandModel");
const router = express.Router();


//******************************USERS DATA******************************* */

//GET USER
const getUser = async (req, res) => {
  let name = req.query.name ?? "";
  const user = await userModel.find({
    $or: [
      { name: new RegExp(name, "i")},
      { email: new RegExp(name, "i")}
    ],
  }).lean();
  res.render("admin/user", { user, name });
};

//GET REQUEST FOR ADD USER
const getAdduser = (req, res) => {
  res.render("admin/add-user");
};

//POST REQUEST FOR ADD-USER
const createUser = (req, res) => {
  const { name, email, phone, password} = req.body;
  const hasWhiteSpace = /\s/g.test(name);
  const hasWhiteSpacepass = /\s/g.test(password);
  if (hasWhiteSpace || name.trim() === "" || hasWhiteSpacepass || password.trim() === "") {
    // handle error if user has white spaces
    const err = "all field reqiured";
    res.render("admin/add-user", { err: true, message: "Invalid data" });
  } else {
    const user = new userModel({ name, email, phone, password });
    user.save((err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/admin/user");
      }
    });
  }
};


//GET REQUEST FOR EDIT-USER
const getEditUser = async (req, res) => {
  const _id = req.params.id;
  const user = await userModel.findOne({ _id }).lean();
  res.render("admin/edit-user", { user });
};

//POST REQUEST FOR EDIT-USER
const editUser = async (req, res) => {
  try {
    const _id = req.body._id;
    const { name, email, phone, password } = req.body;
    const hasWhiteSpace = /\s/g.test(name);
    const hasWhiteSpacepass = /\s/g.test(password);
    if (hasWhiteSpace || name.trim() === "" || hasWhiteSpacepass || password.trim() === "") {
      // handle error if user has white spaces
      const err = "all field required";
      return res.render("admin/edit-user", { err: true, message: "Invalid data" });
    } else {
      await userModel.findByIdAndUpdate(_id, {
        $set: {
          ...req.body,
        },
      });
      return res.redirect("/admin/user");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
};

//DELETING THE USER
const deleteUser = async (req, res) => {
  const id = req.params.id;
  await userModel.deleteOne({ _id: id });
  res.redirect("/admin/user");
};

const searchUser = async (req, res) => {
  const name = req.body.name;
  const users = await userModel.find({ name: new RegExp(name, "i") }).lean();

  res.render("admin/adminHome", { users });
};

//****************************CATEGORY PAGE******************************************** */

// POST REQUEST FOR ADD-CATEGORY
const addCategory = (req, res) => {
  const { name } = req.body;
  const hasWhiteSpace = /\s/g.test(name);
  if (hasWhiteSpace || name.trim() === "") {
    // handle error if category has white spaces
    const err = "all field reqiured";
    res.render("admin/add-category", { err: true, message: "Invalid data" });
  } else {
    const category = new categoryModel({ name });
    category.save((err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/admin/category");
      }
    });
  }
};

//GET REQUEST FOR CATEGORY
const getCategory = async (req, res) => {
  let name = req.query.name ?? "";
  const category = await categoryModel.find({
    $or: [
      { name: new RegExp(name, "i") },
    ],
  }
  ).lean();

  res.render("admin/category", { category, name });
};

//GET REQUEST FOR ADD CATEGORY
const getaddCategory = (req, res) => {
  res.render("admin/add-category");
};

//DELETE CATEGORY
const deleteCategory = async (req, res) => {
  const id = req.params.id;
  await categoryModel.deleteOne({ _id: id });
  res.redirect("/admin/category");
};

//GET REQUEST FOR EDIT-CATEGORY
const getEditCategory = async (req, res) => {
  const _id = req.params.id;
  const category = await categoryModel.findOne({ _id }).lean();

  console.log(category);
  res.render("admin/edit-category", { category });
};

//POST REQUEST FOR EDIT-CATEGORY
const editCategory = async (req, res) => {
  const _id = req.body._id;
  console.log(req.body);
  const category = await categoryModel.findOne({ _id }).lean();
  const { name } = req.body;
  const hasWhiteSpaceName = /\s/g.test(name);
  if (hasWhiteSpaceName || name.trim() === "") {
    const err = "all field reqiured";
    return res.render("admin/edit-category", {
      category,
      err: true,
      message: "Invalid Data!!!",
    });
  }
  await categoryModel.findByIdAndUpdate(_id, {
    $set: { name: req.body.name },
  });
  res.redirect("/admin/category");
};

//******************************************BRAND PAGE************************************** */

//GET REQUEST FOR BRAND
const getBrand = async (req, res) => {
  let name = req.query.name ?? "";
  const brand = await brandModel.find({
    $or: [
      { name: new RegExp(name, "i") },
      { category: new RegExp(name, "i") },
    ],
  }).lean();
  res.render("admin/brand", { brand, name });
};

//GET REQUEST FOR ADD-BRAND
const getaddBrand = (req, res) => {
  res.render("admin/add-brand");
};

//POST REQUEST FOR ADD-BRAND
const addBrand = (req, res) => {
  const { name } = req.body;
  const hasWhiteSpaceName = /\s/g.test(name);
  if (hasWhiteSpaceName || name.trim() === "") {
    const err = "all field reqiured";
    res.render("admin/add-brand", { err: true, message: "Invalid Data!!!" });
  } else {
    const brand = new brandModel({ name });
    brand.save((err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/admin/brand");
      }
    });
  }
};

//GET REQUEST FOR EDIT-BRAND
const getEditBrand = async (req, res) => {
  const _id = req.params.id;
  const brand = await brandModel.findOne({ _id }).lean();
  res.render("admin/edit-brand", { brand });
};

//POST REQUEST FOR EDIT-BRAND
const editBrand = async (req, res) => {
  const _id = req.body._id;
  const brand = await brandModel.findOne({ _id }).lean();
  const { name } = req.body;
  const hasWhiteSpaceName = /\s/g.test(name);
  if (hasWhiteSpaceName || name.trim() === "") {
    const err = "all field reqiured";
    return res.render("admin/edit-brand", {
      brand,
      err: true,
      message: "Invalid Data!!!",
    });
  }
  await brandModel.findByIdAndUpdate(_id, {
    $set: {
      ...req.body,
    },
  });
  res.redirect("/admin/brand");
};

//DELETE BRAND
const deleteBrand = async (req, res) => {
  const id = req.params.id;
  await brandModel.deleteOne({ _id: id });
  res.redirect("/admin/brand");
};

//*************************************PRODUCT PAGE***************************************** */

//GET REQUEST FOR PRODUCT PAGE
const getProduct = async (req, res) => {
  let name = req.query.name ?? "";
  const products = await productModel.find({
    $or: [
      { name: new RegExp(name, "i") },
      { category: new RegExp(name, "i") }
    ],
  }).lean();
  res.render("admin/product", { products, name});
};

//GET REQUEST FOR ADD-PRODUCT PAGE
const getaddProduct = async (req, res) => {
  const brand = await brandModel.find({}).lean();
  const category = await categoryModel.find({}).lean();
  res.render("admin/add-product", { category, brand });
};

//POST REQUEST FOR ADD PRODUCT
const addProduct = async (req, res) => {
  const category = await categoryModel.find({}).lean();
  const brand = await brandModel.find({}).lean();
  const { name, price, mrp, description, quantity, category: selectedCategory , brand: selectedBrand } = req.body;
  if (name.trim() === "" ||description.trim() === "" || !selectedCategory || !selectedBrand) {
    const err = "";
    res.render("admin/add-product", { category, brand, err: true, message: "Invalid data!!!" });
  } else if (price < 0 || mrp < 0 || quantity < 0) {
    const err = "";
    res.render("admin/add-product", {category, brand,
      err: true,
      message: "Price and MRP and Quantity fields cannot be negative.",
    });
  } else if (price >= mrp) {
    const err = "";
    res.render("admin/add-product", {category, brand,
      err: true,
      message: "Price must be less than MRP.",
    });
  } else if (isNaN(price) || isNaN(mrp)) {
    const err = "";
    res.render("admin/add-product", {category, brand,
      err: true,
      message: "Price and MRP fields must be numeric.",
    });
  } else {
    console.log(req.body);
    await productModel
      .create({ ...req.body, main_image: req.files.main_image[0] })

      .then(() => {
        res.redirect("/admin/product");
      });
  }
};

//GET REQUEST FOR EDIT-PRODUCT
const getEditProduct = async (req, res) => {
  const _id = req.params.id;
  const product = await productModel.findOne({ _id }).lean();
  const brand = await brandModel.find().lean();
  const category = await categoryModel.find().lean();
  
  res.render("admin/edit-product", { product, category, brand });
};

//POST REQUEST FOR EDIT-PRODUCT
const editProduct = async (req, res) => {
  const _id = req.body._id
  console.log(req.body);
  const category = await categoryModel.find({}).lean()
  const brand = await brandModel.find().lean()
  const product = await productModel.findOne({_id}).lean()
  const { name, price, mrp, description, quantity, category: selectedCategory , brand: selectedBrand } = req.body;
 
  if ( name.trim() === "" ||  description.trim() === "") {
    const err = "Invalid data";
    res.render("admin/edit-product", { category, brand, product, err: true, message: "Invalid data!!!" });
  }else if (price < 0 || mrp < 0 || quantity < 0) {
    const err = "";
    res.render("edit-product", {category, brand, product,
      err: true,
      message: "Price and MRP and Quantity fields cannot be negative.",
    });
  } else if (price >= mrp) {
    const err = "";
    res.render("edit-product", {category, brand, product,
      err: true,
      message: "Price must be less than MRP.",
    });
  } else if (isNaN(price) || isNaN(mrp)) {
    const err = "";
    res.render("admin/edit-product", {category, brand,product,
      err: true,
      message: "Price and MRP fields must be numeric.",
    });
  }
  else{
    if (!req.files.main_image && !req.files.sub_image) {
      await productModel.findByIdAndUpdate(_id, {
          $set: {
              ...req.body
          }
      })
  }
  else if (req.files.main_image && !req.files.sub_image) {
      await productModel.findByIdAndUpdate(_id, {
          $set: {
              ...req.body,
              main_image: req.files.main_image[0]
          }
      })
  }
  else if (!req.files.main_image && req.files.sub_image) {
      await productModel.findByIdAndUpdate(_id, {
          $set: {
              ...req.body,
              sub_image: req.files.sub_image
          }
      })
  }
  else if (req.files.main_image && req.files.sub_image) {
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
  }
  
 
  


//DELETE PRODUCT
const deleteProduct = async (req, res) => {
  const id = req.params.id;
  await productModel.deleteOne({ _id: id });
  res.redirect("/admin/product");
};

// ***************************COUPONS **********************************************

//GET REQUEST FOR COUPON
const getCoupon = async (req, res) => {
  let name = req.query.name ?? "";
  const coupon = await couponModel.find({
    $or: [
      { name: new RegExp(name, "i") },
      { couponcode: new RegExp(name, "i") },
    ],
  }).lean();
  // Check if expiry date is not a past date
  const currentDate = new Date();
  
  for (i = 0; i < coupon.length; i++) {
    coupon.map((item, index) => {
      coupon[i].date = coupon[i].expdate.toLocaleDateString();
    });
  }
  console.log(coupon);
  res.render("admin/coupons", { coupon , name});
};

//POST REQUEST FOR ADD-COUPON

const addCoupon = (req, res) => {
  const { name, couponcode, cashback, minamount, expdate , status } = req.body;
  const hasWhiteSpaceName = /\s/g.test(name);
  const hasWhiteSpaceCoupon = /\s/g.test(couponcode);

  if (hasWhiteSpaceName || name.trim() === "" || hasWhiteSpaceCoupon || couponcode.trim() === "" || !expdate) {
    const err = "all field required";
    res.render("admin/add-coupon", { err: true, message: "Invalid Data!!!" });
  } else if (cashback >= minamount) {
    const err = "";
    res.render("admin/add-coupon", {
      err: true,
      message: "cashback must be lesser than the price"
    });
  } else if (cashback < 0 || minamount < 0) {
    const err = "";
    res.render("admin/add-coupon", {
      err: true,
      message: "Fields cannot be negative"
    });
  } else {
    const currentDate = new Date();
    const expiryDate = new Date(expdate);
    if (expiryDate < currentDate) {
      const err = "Expiry date cannot be a past date";
      res.render("admin/add-coupon", { err: true, message: err });
    } else {
      const coupon = new couponModel({
        name,
        couponcode,
        cashback,
        minamount,
        expdate,
        status,
      });
      coupon.save((err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/admin/coupon");
        }
      });
    }
  }
};


//GET REQUEST FOR ADD-COUPON
const getaddcoupon = (req, res) => {
  res.render("admin/add-coupon");
};

//GET REQUEST FOR EDIT-COUPON
const getEditCoupon = async (req, res) => {
  const _id = req.params.id;
  const coupon = await couponModel.findOne({ _id }).lean();
  res.render("admin/edit-coupon", { coupon });
};

//POST REQUEST FOR EDIT-COUPON
const editCoupon = async (req, res) => {
  const _id = req.body._id;
  const coupon = await couponModel.findOne({_id}).lean();
  const { name, couponcode, cashback, minamount, expdate , status } = req.body;
  const hasWhiteSpaceName = /\s/g.test(name);
  const hasWhiteSpaceCoupon = /\s/g.test(couponcode);
  const hasWhiteSpaceStatus = /\s/g.test(status);

  if (hasWhiteSpaceName || name.trim() === "" || hasWhiteSpaceCoupon || couponcode.trim() === ""|| hasWhiteSpaceStatus || status.trim() === "" || !expdate) {
    const err = "all field reqiured";
    res.render("admin/edit-coupon", { coupon, err: true, message: "Invalid Data!!!" });
  } else if (cashback >= minamount) {
    const err = "";
    res.render("admin/edit-coupon", {coupon, 
      err: true,
      message: "cashback must be lesser than the price"})
  }
  else if (cashback <0 || minamount<0 ){
    const err = "";
    res.render("admin/edit-coupon", { coupon,
      err: true,
      message: "Fileds cannot be negative"})
  } else {
    const currentDate = new Date();
    const expiryDate = new Date(expdate);
    if (expiryDate < currentDate) {
      const err = "Expiry date cannot be a past date";
      res.render("admin/add-coupon", { err: true, message: err });
    } else {
      await couponModel.findByIdAndUpdate(_id, {
        $set: {
          ...req.body,
        },
      });
      res.redirect("/admin/coupon");
    }
  }
};


//DELETE COUPON
const deleteCoupon = async (req, res) => {
  const id = req.params.id;
  await couponModel.deleteOne({ _id: id });
  res.redirect("/admin/coupon");
};

// ************************ORDERS ************************************************

//GET REQUEST FOR ORDERS
const getorders = async (req, res) => {
  const _id = req.params.id;
  let name = req.query.name ?? "";
  const order = await orderModel.find({
    $or: [
      { orderStatus: new RegExp(name, "i") },
    ],
  }).lean();

  for(i=0;i<order.length;i++){
    order.map((item, index)=>{
      order[i].date=order[i].createdAt.toDateString();
      
      })
  }
  res.render("admin/orders", { order , name});
};

const orderStatus = async (req, res) => {
  if (req.body.action == 'Returned') {
    const order = await orderModel.findOne({_id:req.body.id}).lean()
    await orderModel.updateOne({ _id:req.body.id }, {
        $set: {
            orderStatus: req.body.action
        }
    })
    await userModel.updateOne({ _id: order.userId }, { $inc: { wallet: order.total } })
}
  await orderModel
    .updateOne({ _id: req.body.id }, { $set: { orderStatus: req.body.action } })
    .then((result) => {
      res.redirect("back");
    });
};

//********************ORDER DETAIL************************************************** */

//GET METHOD FOR ORDER DETAIL
const getorderdetail = async (req, res) => {
  const _id = req.params._id;
  const order = await orderModel.findById(_id).lean();
  res.render("admin/orderdetail", { order });
};

//*************************************BANNER PAGE***************************************** */

//GET REQUEST FOR BANNER PAGE
const getBanner = async (req, res) => {
  let name = req.query.name ?? "";
  const banner = await bannerModel.find({
    $or: [
      { name: new RegExp(name, "i") },
      { category: new RegExp(name, "i") }
    ],
  }).lean();
  res.render("admin/banner", { banner, name});
};

//GET REQUEST FOR ADD-BANNER PAGE
const getaddBanner = async (req, res) => {
  const banner = bannerModel.find({}).lean();
  res.render("admin/add-banner", {banner });
};

//POST REQUEST FOR ADD BANNER
const addBanner = async (req, res) => {
  const banner = await bannerModel.find({}).lean();
  const { name} = req.body;
  if (name.trim() === "") {
    const err = "";
    res.render("admin/add-banner", { banner, err: true, message: "Invalid data!!!" });
  }  else {
    await bannerModel
      .create({ ...req.body, main_image: req.files.main_image[0] })

      .then(() => {
        res.redirect("/admin/banner");
      });
  }
};

//GET REQUEST FOR EDIT-BANNER
const getEditBanner = async (req, res) => {
  const _id = req.params.id;
  const banner = await bannerModel.findOne({ _id }).lean();
  res.render("admin/edit-banner", { banner });
};

//POST REQUEST FOR EDIT-BANNER
const editbanner = async (req, res) => {
  const _id = req.body._id
  const banner = await bannerModel.findOne({_id}).lean()
  const { name} = req.body;
 
  if ( name.trim() === "" ) {
    const err = "Invalid data";
    res.render("admin/edit-banner", {banner, err: true, message: "Invalid data!!!" });
  }
  else{
    if (!req.files.main_image) {
      await bannerModel.findByIdAndUpdate(_id, {
          $set: {
              name:req.body.name,

          }
      })
  }else{
    await bannerModel.findByIdAndUpdate(_id, {
      $set: {
          name:req.body.name,
          main_image:req.files.main_image[0]

      }
  })
  }
  res.redirect("/admin/banner")
}
  }
  
//DELETE BANNER
const deleteBanner = async (req, res) => {
  const id = req.params.id;
  await bannerModel.deleteOne({ _id: id });
  res.redirect("/admin/banner");
};

//******************************SALES REPORT**************************** */
// GET METHOD FOR ADMIN SALES REPORT
 const getAdminSalesReport =  async (req, res) => {
  let orders
  let deliveredOrders
  let salesCount
  let salesSum
  let result
  let start = new Date(new Date().setDate(new Date().getDate() - 8));
  let end = new Date();
  let filter = req.query.filter ?? "";

  if (req.query.start) start = new Date(req.query.start);
  if (req.query.end) end = new Date(req.query.end);
  if (req.query.start) {
  
     let orders = await orderModel.find().lean()
      console.log(orders); 
        
 const neworders = orders.map((item, index)=>{         
          item[index].date=item[index].createdAt.toLocaleDateString();
          }) 
      deliveredOrders = orders.filter(order => order.orderStatus === "Delivered")
      salesCount = await orderModel.countDocuments({ createdAt : { $gte: start, $lte: end }, orderStatus: "Delivered" })
      salesSum = deliveredOrders.reduce((acc, orders) => acc + product.total, 0)
      
  } else {

      deliveredOrders = await orderModel.find({ orderStatus: "Delivered" }).lean()

      salesCount = await orderModel.countDocuments({ orderStatus: "Delivered" })
      result = await orderModel.aggregate([{ $match: { orderStatus: "Delivered" } },
      {
          $group: { _id: null, total: { $sum: '$total' } }
      }])
      salesSum = result[0]?.total
  }
  const users = await orderModel.distinct('_id')
  const userCount = users.length
  for (const i of deliveredOrders) {
    i.createdAt=i.createdAt.toLocaleDateString()
  }
  res.render('admin/sales', { userCount, salesCount, salesSum, deliveredOrders })
}

//EXPORTING MODULES
module.exports = {
  getAdminSalesReport,
  getBanner, 
  addBanner,
  editbanner, 
  getEditBanner,
  getaddBanner,
  deleteBanner,
  getorderdetail,
  getorders,
  getCoupon,
  getaddcoupon,
  getEditCoupon,
  editCoupon,
  deleteCoupon,
  addCoupon,
  createUser,
  getAdduser,
  getUser,
  addProduct,
  deleteProduct,
  getProduct,
  getaddProduct,
  editProduct,
  getEditProduct,
  addBrand,
  deleteBrand,
  getBrand,
  getaddBrand,
  editBrand,
  getEditBrand,
  addCategory,
  deleteCategory,
  editCategory,
  getEditCategory,
  getCategory,
  getaddCategory,
  deleteUser,
  editUser,
  getEditUser,
  searchUser,
  createUser,
  orderStatus,
};
