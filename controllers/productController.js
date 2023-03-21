const express = require("express");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const couponModel=require('../models/couponModel')
const router = express.Router();
const hbs=require('hbs')
const OTP = require("../models/otpModel");
const twilioClient = require("../twilio");
const { find } = require("../models/brandModel");
hbs.registerHelper('inc',function(value,options){
  return parseInt(value)+1;
});

const createId = require("../middlewares/createId");

const axios = require("axios");
const {
  CompositionListInstance,
} = require("twilio/lib/rest/video/v1/composition");

//*******************PRODUCT DETAIL PAGE********************************* */

//GET REQUEST FOR PRODUCT DETAIL
const getproductDetail = async (req, res) => {
    let loggedIn = false;
    if (req.session.user) loggedIn = true;
    else res.redirect("/login");
    const id = req.params.id;
    const product = await productModel.findById(id).lean();
    const category = await categoryModel.find().lean();
    res.render("users/productDetails", { product, category, loggedIn });
  };
  
  //****************************SHOP PAGE************************************************* */
  //GET METHOD FOR SHOP PAGE
  
  const getShop = async (req, res) => {
    let name = req.query.name ?? "";
    let category = await categoryModel.find().lean();
    req.session.pageNum = parseInt(req.query.page ?? 1);
    req.session.perpage = 6;
    let product = await productModel
      .find({ name: new RegExp(name, "i") })
      .countDocuments()
      .lean()
      .then((documentCount) => {
        docCount = documentCount;
        return productModel
          .find({ name: new RegExp(name, "i") })
          .skip((req.session.pageNum - 1) * req.session.perpage)
          .limit(req.session.perpage)
          .lean();
      });
    username = req.session.user;
    let pageCount = Math.ceil(docCount / req.session.perpage);
    let pagination = [];
    for (i = 1; i <= pageCount; i++) {
      pagination.push(i);
    }
    res.render("users/shop", {
      category,
      product,
      pagination,
      name,
    });
  };
  
  const getCategorySort = async (req, res) => {
    console.log(req.body.catg);
    let product = await productModel.find({ category: req.body.catg }).lean(); // Get total number of products in the database
    let category = await categoryModel.find().lean();
    res.render("users/shop", {
      product,
      category,
    });
  };

  module.exports={getproductDetail, getShop, getCategorySort,}