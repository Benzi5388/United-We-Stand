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
      const orders = await orderModel.find().lean()
      const users=await userModel.find().countDocuments()
        const deliveredOrder = await orderModel.find({ orderStatus: "Delivered" }).lean()
        const orderCount = await orderModel.find({ orderStatus: "Delivered" }).countDocuments()
        let totalRevenue = 0;
        let totalDiscount = 0;                                        
        let Orders = deliveredOrder.filter(item => {
            totalRevenue = totalRevenue + item.total;
            totalDiscount = totalDiscount + item.discount
        })
        const monthlyDataArray = await orderModel.aggregate([{ $match: { orderStatus: "Delivered" } }, { $group: { _id: { $month: "$createdAt" }, sum: { $sum: "$total" } } }])
        const monthlyReturnArray = await orderModel.aggregate([{ $match: { orderStatus: "Returned" } }, { $group: { _id: { $month: '$dateOrdered' }, sum: { $sum: '$total' } } }])
       
        let monthlyDataObject = {}
        let monthlyReturnObject = {}
        monthlyDataArray.map(item => {
            monthlyDataObject[item._id] = item.sum
        })
        monthlyReturnArray.map(item => {
            monthlyReturnObject[item._id] = item.sum
        })
        let monthlyReturn = []
        for (let i = 1; i <= 12; i++) {
            monthlyReturn[i - 1] = monthlyReturnObject[i] ?? 0
        }
        let monthlyData = []
        for (let i = 1; i <= 12; i++) {
            monthlyData[i - 1] = monthlyDataObject[i] ?? 0
        }
        console.log(monthlyData);
      res.render("admin/adminHome", { users, orders, Orders,totalRevenue,orderCount,monthlyData });
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