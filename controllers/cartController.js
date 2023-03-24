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

//*************CART PAGE*********************************************** */

const getCart = async (req, res) => {
    try {
      const _id = req.session.user.id;
      const { cart } = await userModel.findOne({ _id }, { cart: 1 });
  
      cItem = cart;
      let cartQty = {};
      cItem.map((item) => {
        cartQty[item.id] = item.quantity;
        return item.quantity;
      });
  
      const cartQuantities = {};
      const cartItems = cart.map((item) => {
        cartQuantities[item.id] = item.quantity;
        return item.id;
      });
  
      const cartItem = cart.map((item) => {
        return item.id;
      });
      console.log(cartItem);
      let product = await productModel.find({ _id: { $in: cartItem } }).lean();
  
      let empty = true;
      if (product[0]) {
        empty = false;
      }
      product.map((item, index) => {
        product[index].cartQty = cartQty[item._id];
      });
  
      product.map((item, index) => {
        product[index].subtotal = item.cartQty * item.price;
      });
      req.session.products = product;
      let totalPrice = 0;
      const pro = product.map((item, index) => {
        const cartQuantity = cartQuantities[item._id] || 0; // set default value of 0 if quantity is not found
        totalPrice = totalPrice + item.price * cartQuantity;
  
        return { ...item, cartQuantity };
      });
  
      console.log("totalPrice", totalPrice);
  
      const totalAmount = 40 + totalPrice;
      res.render("users/cart", { product: pro, totalPrice, totalAmount, empty });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const getAddtoCart = async (req, res) => {
    if (req.session.user) {
      let productId = req.params.id;
      const id = req.session.user.id;
      await userModel.findByIdAndUpdate(
        { _id: id },
        {
          $addToSet: {
            cart: {
              id: productId,
              quantity: 1,
            },
          },
        }
      );
      res.redirect("/cart");
    } else {
      res.redirect("/login");
    }
  };
  
  const getRemoveFromCart = async (req, res) => {
    if (req.session.user) {
      const _id = req.session.user.id;
      const proId = req.params.id;
      await userModel.updateOne({ _id }, { $pull: { cart: { id: proId } } });
      res.redirect("back");
    } else {
      res.redirect("/login");
    }
  };
  
  const addQuantity = async (req, res) => {
    const product = await productModel
      .findOne({ _id: req.params.id })
      .lean();
      console.log(req.session.user.id,'           ',req.params.id);
      const {cart}=await userModel.findOne({_id:req.session.user.id,cart:{$elemMatch:{id:req.params.id}}},{'cart.$':1}).lean()
      const maxQuantity = product.quantity;
      if (maxQuantity>cart[0].quantity) {
        const user = await userModel.updateOne(
          { _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } },
          {
            $inc: {
              "cart.$.quantity": 1,
            },
          }
        );
        res.json({ user });
      } else {
      
        res.json({})
      }
  };
  
  const minusQuantity = async (req, res) => {
    try {
      let { cart } = await userModel.findOne(
        { "cart.id": req.params.id },
        { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
      );
  
      if (cart[0].quantity <= 1) {
        return res.redirect("/cart");
      }
  
      const user = await userModel.updateOne(
        { _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } },
        {
          $inc: {
            "cart.$.quantity": -1,
          },
        }
      );
      return res.json({ user });
    } catch {
      console.log("ful err");
      console.log(err);
    }
  };
  
  //***************************************CHECK OUT********************* */
  // GET REUQEST FOR CHECKOUT
  const getcheckOut = async (req, res) => {
  const _id = req.session.user.id;
  const user = await userModel.findOne({ _id }).lean();
  let empty = false;
  if (user.address.length == 0) {
    empty = true;
  }
  try {
    const _id = req.session.user.id;
    const { cart } = await userModel.findOne({ _id }, { cart: 1 });
    cItem = cart;
    let cartQty = {};
    cItem.map((item) => {
      cartQty[item.id] = item.quantity;
      return item.quantity;
    });
    const cartQuantities = {};
    const cartItems = cart.map((item) => {
      cartQuantities[item.id] = item.quantity;
      return item.id;
    });
    const cartItem = cart.map((item) => {
      return item.id;
    });
    let product = await productModel.find({ _id: { $in: cartItem } }).lean();
    product.map((item, index) => {
      product[index].cartQty = cartQty[item._id];
    });

    product.map((item, index) => {
      product[index].subtotal = item.cartQty * item.price;
    });

    let totalPrice = 0;
    const pro = product.map((item, index) => {
      const cartQuantity = cartQuantities[item._id] || 0; // set default value of 0 if quantity is not found
      totalPrice = totalPrice + item.price * cartQuantity;

      return { ...item, cartQuantity };
    });

    try {
      const _id = req.session.user.id;
      const { cart } = await userModel.findOne({ _id }, { cart: 1 });

      cItem = cart;
      let cartQty = {};
      cItem.map((item) => {
        cartQty[item.id] = item.quantity;
        return item.quantity;
      });

      if (cart == "") {
        return res.render("cart");
      }

      const cartQuantities = {};
      const cartItems = cart.map((item) => {
        cartQuantities[item.id] = item.quantity;
        return item.id;
      });

      const cartItem = cart.map((item) => {
        return item.id;
      });

      let product = await productModel.find({ _id: { $in: cartItem } }).lean();
      product.map((item, index) => {
        product[index].cartQty = cartQty[item._id];
      });

      product.map((item, index) => {
        product[index].subtotal = item.cartQty * item.price;
      });

      let totalPrice = 0;
      const pro = product.map((item, index) => {
        const cartQuantity = cartQuantities[item._id] || 0; // set default value of 0 if quantity is not found
        totalPrice = totalPrice + item.price * cartQuantity;

        return { ...item, cartQuantity };
      });
      if(req.session.couponApply){
      req.session.totalAmount =totalPrice-req.session.redeemCoupon.cashback;
      req.session.couponStatus=true;
      req.session.couponApply=false;
      }else{
        req.session.totalAmount =totalPrice;
        req.session.couponStatus=false;
      }

 if(req.session.redeemCoupon){
  res.render("users/checkout", {
    user,
    product,
    pro,
    totalPrice,
    cashbackStatus:req.session.couponStatus,
    cashback:req.session.redeemCoupon.cashback,
    total:req.session.totalAmount,
    empty
  });
 }else{
  res.render('users/checkout', {
    user,
    product,
    pro,
    totalPrice,
    cashbackStatus:req.session.couponStatus,
    total:req.session.totalAmount,
    empty
  });
 }
    
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
  
  //POST REQUEST FOR CHECK OUT
  const postCheckout = async (req, res) => {
   
    const { payment, address: addressId, couponcode, walletUse } = req.body;
    const _id = req.session.user.id;
    const user = await userModel.findById({ _id }).lean();
    const cart = user.cart;
    let cartQuantities = {};
    const cartList = cart.map((item) => {
      cartQuantities[item.id] = item.quantity;
      return item.id;
    });
    const { address } = await userModel.findOne(
      {address:{$elemMatch:{id:addressId}}},
      { _id: 0,'address.$':1}
    );
    req.session.userAddress = {
      id: address[0].id,
    };
    const product = await productModel.find({ _id: { $in: cartList } }).lean();
    let totalPrice = 0;
    let price = 0;
    product.forEach((item, index) => {
      price = price + item.price * cart[index].quantity;
    });
    if (payment != "cod") {
      let orderId = "order_" + createId();
      const options = {
        method: "POST",
        url: "https://sandbox.cashfree.com/pg/orders",
        headers: {
          accept: "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": "33823439e2a66bf248ccfb9743432833",
          "x-client-secret": "6b0493ad02b6b87f899d6d8911e64c8b5b90157f",
          "content-type": "application/json",
        },
        data: {
          order_id: orderId,
          order_amount: price,
          order_currency: "INR",
          customer_details: {
            customer_id: _id,
            customer_email: user.email,
            customer_phone: address[0].phone,
          },
          order_meta: {
            return_url: "http://unitedwestand.online/return?order_id={order_id}",
          },
        },
      };
      await axios
        .request(options)
        .then(function (response) {
          return res.render("users/paymenttemp", {
            orderId,
            sessionId: response.data.payment_session_id,
          });
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      let orders = [];
      let i = 0;
      let cartLength = user.cart.length;
      for (let item of product) {
        await productModel.updateOne(
          { _id: item._id },
          {
            $inc: {
              quantity: -1 * cartQuantities[item._id],
            },
          }
        );
        totalPrice = cart[i].quantity * item.price;
        orders.push({
          address: address[0],
          product: item,
          userId: req.session.user.id,
          quantity: cart[i].quantity,
          total: totalPrice,
        });
        i++;
      }
      const order = await orderModel.create(orders); //work as insert many
      await userModel.findByIdAndUpdate(
        { _id },
        {
          $set: { cart: [] },
        }
      );
      res.render("users/orderPlaced");
    }
  };
  
  const getpaymentUrl = async (req, res) => {
    try {
      const order_id = req.query.order_id;
      const options = {
        method: "GET",
        url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
        headers: {
          accept: "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": "33823439e2a66bf248ccfb9743432833",
          "x-client-secret": "6b0493ad02b6b87f899d6d8911e64c8b5b90157f",
          "content-type": "application/json",
        },
      };
      const response = await axios.request(options);
      if (response.data.order_status == "PAID") {
        const { payment, address: addressId, couponcode, walletUse } = req.body;
        const _id = req.session.user.id;
        const user = await userModel.findById({ _id }).lean();
        const cart = user.cart;
        let cartQuantities = {};
        const cartList = cart.map((item) => {
          cartQuantities[item.id] = item.quantity;
          return item.id;
        });
        const address = req.session.userAddress.id;
        let newAddress = await userModel.findOne(
          { _id },
          { _id: 0, address: { $elemMatch: { id: address } } }
        );
        const product = await productModel
          .find({ _id: { $in: cartList } })
          .lean();
        let totalPrice = 0;
        let price = 0;
        product.forEach((item, index) => {
          price = price + item.price * cart[index].quantity;
        });
        let orders = [];
        let i = 0;
        let cartLength = user.cart.length;
        for (let item of product) {
          await productModel.updateOne(
            { _id: item._id },
            {
              $inc: {
                quantity: -1 * cartQuantities[item._id],
              },
            }
          );
          totalPrice = cart[i].quantity * item.price;
          orders.push({
            address: newAddress.address[0],
            product: item,
            userId: req.session.user.id,
            quantity: cart[i].quantity,
            total: totalPrice,
            paymentType: "online",
            paid: true,
          });
          i++;
        }
        const order = await orderModel.create(orders); //work as insert many
        await userModel.findByIdAndUpdate(
          { _id },
          {
            $set: { cart: [] },
          }
        );
        res.render("users/orderPlaced");
      }
    } catch (err) {
      console.log(err);
      res.redirect("error-page");
    }
  };

  //***************************************COUPON************************************ */
const couponApply=async(req,res)=>{
    let totalPrice=parseInt(req.body.totalPrice)
    let result=await couponModel.findOne({couponcode:req.body.couponcode})
    if(result!=null){
      if(totalPrice>=result.minamount){
      req.session.couponApply=true;
      req.session.redeemCoupon=result;
      res.redirect('/checkout')
      }else{
      res.redirect('back')
      }
    }else{
      res.redirect('back')
    }
    }


    const CancelOrder=async(req,res)=>{

      const _id = req.params.id
        const order = await orderModel.findOne({ _id })
        console.log(order)

        await orderModel.updateOne({ _id }, {
            $set: {
                orderStatus: 'cancelled'
            }
        })

        res.redirect('back')

      

    }


    const ReturnOrder=async(req,res)=>{

      const id = req.session.user.id
        const _id = req.params.id
        const user = await userModel.findOne({ _id: id }).lean()

        console.log(user)

        const order = await orderModel.findOne({ _id }).lean()

        await orderModel.updateOne({ _id }, {
            $set: {
                orderStatus: 'return-progressing'
            }
        })

        res.redirect('back')

    }

  module.exports={ReturnOrder,CancelOrder,getpaymentUrl, minusQuantity, addQuantity, getAddtoCart, getRemoveFromCart, getCart, getcheckOut, postCheckout, couponApply}