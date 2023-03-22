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
const jwt= require('jsonwebtoken')

const createId = require("../middlewares/createId");

const axios = require("axios");
const {
  CompositionListInstance,
} = require("twilio/lib/rest/video/v1/composition");
const sentOTP = require("../helpers/sendOtp");

//GET METHOD FOR LOGIN PAGE
const login = (req, res) => {
  if (req.session.user) res.redirect("/");
  else res.render("users/userLogin");
};
  
  //GET METHOD FOR SIGNUP PAGE
  const getSignup = (req, res) => {
    res.render("users/userSignup");
  };
  
  //GET METHOD FOR OTP PAGE
  const getOtp = (req, res) => {
    res.render("users/otp");
  };

  const getResetOtp=(req, res)=>{
    res.render("users/fPswrdOtp", {error:false})
  }

  const forgotPasswordOtp=(req, res)=>{
    const {otp}=req.body;
    console.log(otp, req.session.tempOtp)
    if(otp==req.session.tempOtp){
      return res.render("users/resetpswrd")
    }
    return res.render("users/fPswrdOtp", {error:true, message:"Invalid OTP"})
  }
  
  //POST REQUEST TO VERIFY OTP
  const verifyOtp = (req, res) => {
    console.log(req.body.otp, req.session.tempSignOtp)
    if(req.body.otp==req.session.tempSignOtp){
      const user = new userModel({
        ...req.session.tempUser,
        cart: [],
        wishlist: [],
      });
      user.save((err, data) => {
        if (err) {
          console.log(err);
        }
      });
      return res.redirect("/login")
    }
    return res.render("users/otp", {
      err: true,
      message: "Invalid OTP code, please try again",
    });

  };
  
  //POST REQUEST FOR SIGNUP PAGE
  const signup = async (req, res) => {
    const { name, email, phone, password } = req.body;
    const duplicate = await userModel.findOne({ email });
    const hasWhiteSpaceName = /\s/g.test(name);
    const hasWhiteSpaceph = /\s/g.test(phone);
    const hasWhiteSpacepass = /\s/g.test(password);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // regular expression to check if email address is in valid format
  
    if (
      name.trim() === "" ||
      email.trim() == "" ||
      phone.trim() === "" ||
      password.trim() === ""
    ) {
      const err = "all field required";
      return res.render("users/userSignup", {
        err: true,
        message: "all fields required",
      });
    } else if (duplicate) {
      const err = "email exists";
      return res.render("users/userSignup", {
        err: true,
        message: "Email already exists",
      });
    } else {
      const email = req.body.email;
      let randomN = Math.floor(Math.random() * 90000) + 10000;
      await sentOTP(email, randomN);
      console.log(randomN)
      req.session.tempUser={
        ...req.body,
      }
      req.session.tempSignOtp=randomN
      res.redirect("/otp");

    }
  };
  
  //POST REQUEST FOR LOGIN PAGE
  const userlogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    const userOg = await userModel.findOne({ email });
    if (userOg) {
      if (password == userOg.password) {
        req.session.user = {
          id: userOg._id,
          name: userOg.name,
          email: userOg.email,
        };
        res.redirect("/");
      } else {
        res.render("users/userLogin", { error: true, message: "Incorrect Credentials" });
      }
    } else {
      res.render("users/userLogin", { error: true, message: "No user found" });
    }
  };
  
  
  //LOGOUT REQUEST FOR HOME PAGE
  const userLogout = (req, res) => {
    req.session.user = null;
    res.redirect("/login");
  };

  //******************FORGOT PASSWORD**************************** */
  
  //GET METHOD FOR FORGOT PASSWORD
  const getforgotpswrd = (req, res) => {
    res.render("users/forgotpswrd");
  };

  const getlink = (req, res) => {
    res.render("users/link");
  };

  const JWT_SECRET ='something'
  
  const forgotpswrd = async (req, res) => {
    const email = req.body.email;
    const user = await userModel.findOne({ email: email }).lean();
    let otp = Math.floor(Math.random()*1000000)
    console.log(otp)
  
    if (!user) {
      return res.render('users/forgotpswrd', { err: true, message: "Email Id doesn't Exist!!" });
    }

    req.session.tempOtp=otp;
    req.session.tempEmail=email;
    await sentOTP(email, otp);
    res.redirect("/reset-otp")
  }


  //*************************RESET PASSWORD PAGE****************** */

  //GET METHOD FOR RESET PASSWORD
  const getresetpswrd = async (req, res) => {
    const _id = req.params.id;
    const user = await userModel.findOne({ id: _id }).lean();
    const { id, token } = req.params;
    if (!user) {
      console.log(user._id);
      res.render("users/resetpswrd", { err: true, message: "Link expired!!" });
    } else {
      const secret = JWT_SECRET + user.password;
      try {
        const payload = jwt.verify(token, secret);
        res.render("users/resetpswrd");
      } catch {
        console.log("error");
        res.render("users/resetpswrd", { err: true, message: "Invalid token" });
      }
    }
  };
  

  //POST METHOD FOR RESET PASSWORD
  
  const resetpswrd = async (req, res) => {
    try {
    const { password, confirmPassword } = req.body;
    if(password==confirmPassword){
      const user = await userModel.updateOne({email:req.session.tempEmail}, {$set:{password}})
      return res.redirect("/login")
    }
    return res.render("users/resetpswrd",{error:true, message:"Password is not matching"})
  } catch (error) {
      return res.render("users/resetpswrd",{error:true, message:"Password is not matching"})
    }
  };
  
  


  module.exports={resetpswrd,getResetOtp,forgotPasswordOtp, getlink, forgotpswrd, login, getSignup, getOtp, verifyOtp, userlogin, userLogout , signup, getforgotpswrd, getresetpswrd }