const express = require("express");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const couponModel = require("../models/couponModel");
const router = express.Router();
const hbs = require("hbs");
const OTP = require("../models/otpModel");
const twilioClient = require("../twilio");
const { find } = require("../models/brandModel");
hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

const createId = require("../middlewares/createId");

const axios = require("axios");
const {
  CompositionListInstance,
} = require("twilio/lib/rest/video/v1/composition");
const { default: mongoose } = require("mongoose");
const bannerModel = require("../models/bannerModel");

//GET METHOD FOR HOME PAGE
const getUserHome = async (req, res) => {
  let loggedIn = false;
  const banner=await bannerModel.find().lean()
  
  const category = await categoryModel.find().lean();
  if (req.session.user) {
    let user = await userModel.find({_id:req.session.user?.id??''}).lean();
     user={cartQuantity:user[0].cart.length,
    userName:user[0].name
    }
    loggedIn = true;
    console.log(banner);
    res.render("users/userHome", { category, loggedIn, user,banner});
  } else {
    res.render("users/userHome", { category, banner });
  }
};

//GET METHOD FOR HOME PAGE
const gethome = async (req, res) => {
  let loggedIn = false;
  if (req.session.user) loggedIn = true;
  else res.redirect("/login");
  const category = await categoryModel.find().lean();
  res.render("users/userHome", { category, loggedIn });
};

//***************************USER PROFILE*********************************************** */
//GET REQUEST FOR USER PROFILE
const getUserProfile = async (req, res) => {
  let loggedIn = false;
  if (req.session.user) loggedIn = true;
  else res.redirect("/login");
  const _id = req.session.user.id;
  const user = await userModel.findOne({ _id }).lean();
  let empty = true;
  if (user[0]) {
    empty = false;
  }
  let address = user.address;
  if (address.length == 0) {
    res.render("users/userProfile", { user, empty });
  } else {
    let empty = false;
    res.render("users/userProfile", { user, empty, address });
  }
};

//**********************WISH LIST******************************************************** */
//GET REQUEST FOR WISH LIST

const getwishList = async (req, res) => {
  let id = req.session.user.id;  
  const user= await userModel.findOne({_id:id},{wishlist:1})
 let wishid=user.wishlist.map((item)=>{
  return item.id
 })
let products=await productModel.find({_id:{$in:wishid}}).lean()
  res.render("users/wishList",{products});
};
const addTowishList = async (req, res) => {
  try {
    const _id = req.session.user.id;
    const id =req.params.id;
    await userModel.updateOne({ _id:_id },{ $addToSet: {
      wishlist: {
        id:id
      }}});
    res.redirect("/wishList");
  } catch (err) {}
};

const getRemoveFromWishlist = async (req, res) => {
  if (req.session.user) {
    const _id = req.session.user.id;
    const proId = req.params.id;
    await userModel.updateOne({ _id:_id}, { $pull: { wishlist:{id: proId }}});
    res.redirect("back");
  } else {
    res.redirect("/login");
  }
};

//**********************ADD ADDRESS******************************************************** */
//GET REQUEST FOR ADD ADDRESS
const getaddAddress = async (req, res) => {
  res.render("users/add-address");
};

//POST REQUEST FOR ADD ADDRESS
const addAddress = async (req, res) => {
  const _id = req.session.user.id;
  const { name, phone, street, city, state } = req.body;
  const phoneRegex = /^\d{10}$/;
  if (
    name.trim() === "" ||
    street.trim() === "" ||
    city.trim() === "" ||
    state.trim() === "" ||
    !phoneRegex.test(phone)
  ) {
    const err = "all field reqiured";
    res.render("users/add-address", { err: true, message: "Invalid Data!!!" });
  } else {
    await userModel.updateOne(
      { _id },
      {
        $addToSet: {
          address: {
            ...req.body,
            id: createId(),
          },
        },
      }
    );
    res.redirect("/userProfile");
  }
};

// DELETING ADDRESS
const deleteAddress = async (req, res) => {
  const _id = req.session.user.id;
  const id = req.params.id;
  await userModel.updateOne(
    { _id, address: { $elemMatch: { id } } },
    {
      $pull: {
        address: { id },
      },
    }
  );
  res.redirect("/userProfile");
};

//GET REQUEST FOR EDIT ADDRESS
const geteditAddress = async (req, res) => {
  const id = req.params.id;
  let { address } = await userModel.findOne(
    { "address.id": id },
    { _id: 0, address: { $elemMatch: { id } } }
  );
  res.render("users/edit-address", { address: address[0] });
};

//POST REQUEST FOR EDIT ADDRESS
const editAddress = async (req, res) => {
  const id = req.params.id;

  const { name, phone, street, city, state } = req.body;
  const phoneRegex = /^\d{10}$/;
  if (
    name.trim() === "" ||
    street.trim() === "" ||
    city.trim() === "" ||
    state.trim() === "" ||
    !phoneRegex.test(phone)
  ) {
    const err = "all field reqiured";
    let { address } = await userModel.findOne(
      { "address.id": id },
      { _id: 0, address: { $elemMatch: { id } } }
    );

    res.render("users/edit-address", {
      err: true,
      address: address[0],
      message: "Invalid Data!!!",
    });
  } else {
    await userModel
      .updateOne(
        {
          _id: req.session.user.id,
          address: { $elemMatch: { id: req.params.id } },
        },
        { $set: { "address.$": req.body } }
      )
      .then((result) => {
      });
    res.redirect("/userProfile");
  }
};

//***********************ORDER PLACED************************************************ */
//GET REQUEST FOR ORDER PLACED
const getorderPlaced = async (req, res) => {
  res.render("users/orderPlaced");
};

//***************************************MY ORDERS************************************ */
//GET REQUEST FOR MY ORDERS page
const getmyOrder = async (req, res) => {
  const id = req.session.user.id;
  const order = await orderModel.find({ userId: id }).lean();
  let empty = true;
  if (order[0]) {
    empty = false;
  }
  res.render("users/myorder", { order, empty });
};

module.exports = {
  getRemoveFromWishlist,
  getaddAddress,
  addAddress,
  getmyOrder,
  getorderPlaced,
  editAddress,
  geteditAddress,
  deleteAddress,
  addTowishList,
  getwishList,
  getUserProfile,
  getUserHome,
  gethome,
};
