const express = require("express");
const adminModel = require('../models/adminModel');
const brandModel = require("../models/brandModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const adminRouter = require("../routers/adminRouter");
const multipleUpload = require("../middlewares/multer");
const couponModel = require("../models/couponModel");
const orderModel = require("../models/orderModel");
const { findOne } = require("../models/brandModel");
const router = express.Router();



//GET METHOD FOR ADMIN HOME
const adminHome = async (req, res) => {
    const users = await userModel.find().lean();  
    if (req.session.admin) {
      res.render("admin/adminHome", { users });
    } else {
      res.redirect("/admin/adminLogin");
    }
  }
  
  //GET METHOD FOR ADMIN LOGIN
  const adminlogin = (req, res) => {
      res.render("admin/adminLogin");
  }
  
  //POST METHOD FOR LOGIN PAGE
  const login = (req, res) => {
    const email = "admin@gmail.com";
    const password = "1234";
  
    if (email == req.body.email && password == req.body.password) {
      req.session.admin= {
        id:email,
      };
      res.redirect("/admin");
    } else {
      res.render("admin/adminLogin", {
        error: true,
        message: "Invalid Credentials!!!",
      });
    }
  }
  
  //LOGOUT REQUEST
  const logout = (req, res) => {
    req.session.admin = null;
    res.redirect("/admin/adminlogin");
  }

  module.exports = {adminHome, adminlogin, login, logout}