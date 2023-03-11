const express = require('express');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel')
const orderModel=require('../models/orderModel')
const router = express.Router();
const OTP = require('../models/otpModel');
const twilioClient = require('../twilio');
const { find } = require('../models/brandModel');

const createId = require('../middlewares/createId')

const axios=require('axios');
const { CompositionListInstance } = require('twilio/lib/rest/video/v1/composition');

//GET METHOD FOR HOME PAGE
const getUserHome = async (req, res) => {
    let loggedIn = false
    const category = await categoryModel.find().lean()
    if (req.session.user) {
        loggedIn = true
        res.render('userHome', { category, loggedIn })
    }
    else {
        res.render('userHome', { category })
    }
}

//GET METHOD FOR LOGIN PAGE
const login = (req, res) => {
    if (req.session.user) res.redirect('/userHome')
    else res.render('userLogin')
}

//GET METHOD FOR SIGNUP PAGE
const getSignup = (req, res) => {
    res.render('userSignup')
}

//GET METHOD FOR OTP PAGE
const getOtp = (req, res) => {
    res.render('otp')
}

//POST REQUEST TO VERIFY OTP
const verifyOtp = (req, res) => {
    console.log("verifyOtp function called");
    const randomN = req.body.randomN.trim()
    console.log(typeof randomN)
    if (isNaN(randomN)) {
        // If the `randomN` is not a number, return an error response.
        return res.render('otp', { err: true, message: 'Invalid OTP code, please try again' });
    }
    console.log("OTP code entered by user:", randomN);

    OTP.findOne({ users: randomN }, (err, data) => {
        console.log("findOne callback function called");
        if (err) {
            console.log("Error deleting OTP code:", err);
            res.render('otp', { err: true, message: 'Wrong, Please try again' });
        } else if (data) {
            console.log("OTP code found in the database:", data);
            OTP.findOneAndDelete({ users: randomN }, (err) => {
                console.log("findOneAndDelete callback function called");
                if (err) {
                    console.log(err);
                } else {
                    console.log("OTP code deleted from the database");
                }
            });
            res.redirect('/login');
        } else {
            const err = 'wrong otp'
            res.render('otp', { err: true, message: 'Wrong Otp, Please try again!' });
        }
    });
};

//POST REQUEST FOR SIGNUP PAGE
const signup = async (req, res) => {
    const { name, email, phone, password } = req.body;
    const duplicate = await userModel.findOne({ email })

    if (email == "" || password == "" || phone == "" || password == "") {
        const err = 'all field required'
        return res.render('userSignup', { err: true, message: 'all fields required' })
    } else if (duplicate) {
        const err = 'email exists'
        return res.render('userSignup', { err: true, message: 'Email already exists' })
    }
    else {
        //grabs the users number
        const number = req.body.phone
        //generates random 5 digit number
        let randomN = Math.floor(Math.random() * 90000) + 10000
        //sends random no to users number
        twilioClient.messages.create({
            body: `Your U&I OTP is ${randomN}`,
            from: '+12762658149',
            to: number
        })
            .then(() => {
                // Save the OTP to the database
                OTP.create({ users: randomN });
                // Save the user to the database
                const user = new userModel({ email: email, name: name, phone: phone, password: password, cart: [], wishlist: [] })
                user.save((err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect('/otp')
                    }
                });
            })
            .catch(error => {
                console.log(error);
            });
    }
}

//POST REQUEST FOR LOGIN PAGE
const userlogin = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const userOg = await userModel.findOne({ email })
    if (userOg) {
        if (password == userOg.password) {
            req.session.user = {
                id: userOg._id,
                name: userOg.name,
                email: userOg.email
            }
            res.redirect('/')
        }
        const error = "no user found"
    } else {
        const error = "no user found"
        res.render('userLogin', { error: true, message: 'Invalid Credentials!!!' })
    }
}

//LOGOUT REQUEST FOR HOME PAGE
const userLogout = (req, res) => {
    req.session.user = null;
    res.redirect('/login')
}

//GET METHOD FOR HOME PAGE
const gethome = async (req, res) => {
    let loggedIn = false
    if (req.session.user) loggedIn = true
    else res.redirect('/login')
    const category = await categoryModel.find().lean()
    res.render('userHome', { category, loggedIn })
}

//*************CART PAGE*********************************************** */

const getCart = async (req, res) => {
    try {
        const _id = req.session.user.id
        const { cart } = await userModel.findOne({ _id }, { cart: 1 })

        cItem = cart;
        let cartQty = {}
        cItem.map(item => {
            cartQty[item.id] = item.quantity
            return item.quantity
        })

        if (cart == "") {
            noItem = "No Items found"
            return res.render('cart', { noItem })
        }

        const cartQuantities = {}
        const cartItems = cart.map(item => {
            cartQuantities[item.id] = item.quantity
            return item.id
        })

        const cartItem = cart.map(item => {
            return item.id
        })
        console.log(cartItem);
        let product = await productModel.find({ _id: { $in: cartItem } }).lean()
        product.map((item, index) => {
            product[index].cartQty = cartQty[item._id];
        })

        product.map((item, index) => {
            product[index].subtotal = item.cartQty * item.price;
        })
        req.session.products=product;
        let totalPrice = 0;
        const pro = product.map((item, index) => {
            const cartQuantity = cartQuantities[item._id] || 0; // set default value of 0 if quantity is not found
            totalPrice = totalPrice + item.price * cartQuantity;

            return { ...item, cartQuantity }
        })

        console.log('totalPrice', totalPrice)

        const totalAmount = 40 + totalPrice;
        res.render('cart', { product: pro, totalPrice, totalAmount })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}

const getAddtoCart = async (req, res) => {
    if (req.session.user) {
        let productId = req.params.id;
        const id = req.session.user.id
        await userModel.findByIdAndUpdate({ _id: id }, {
            $addToSet: {
                cart: {
                    id: productId,
                    quantity: 1
                }
            }
        })
        res.redirect('/cart')
    } else {
        res.redirect('/login')
    }
}

const getRemoveFromCart = async (req, res) => {
    if (req.session.user) {
        const _id = req.session.user.id
        const proId = req.params.id
        await userModel.updateOne({ _id }, { $pull: { cart: { id: proId } } })
        res.redirect('back')
    }
    else {
        res.redirect('/login')
    }
}

const addQuantity = async (req, res) => {
    console.log("addQuantity function called with ID:", req.params.id);
    const product = await productModel.findOne({ _id: req.params.id }, { name: 1 }).lean()
    console.log("Product found:", product);
    const user = await userModel.updateOne({ _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } }, {
        $inc: {
            "cart.$.quantity": 1
        }
    })

    res.json({ user })
}

const minusQuantity = async (req, res) => {
    try {

        let { cart } = await userModel.findOne({ 'cart.id': req.params.id }, { _id: 0, cart: { $elemMatch: { id: req.params.id } } })

        if (cart[0].quantity <= 1) {
            return res.redirect('/cart')
        }

        const user = await userModel.updateOne({ _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } }, {
            $inc: {
                "cart.$.quantity": -1
            }
        })
        return res.json({ user })

    } catch {

        console.log('ful err')
        console.log(err)
    }
}

//***************************************CHECK OUT********************* */
// GET REUQEST FOR CHECKOUT
const getcheckOut = async (req, res) => {
    const _id = req.session.user.id
    const user = await userModel.findOne({ _id }).lean()
    try {
        const _id = req.session.user.id
        const { cart } = await userModel.findOne({ _id }, { cart: 1 })

        cItem = cart;
        let cartQty = {}
        cItem.map(item => {
            cartQty[item.id] = item.quantity
            return item.quantity
        })


        const cartQuantities = {}
        const cartItems = cart.map(item => {
            cartQuantities[item.id] = item.quantity
            return item.id
        })

        const cartItem = cart.map(item => {
            return item.id
        })
        
        let product = await productModel.find({ _id: { $in: cartItem } }).lean()
        product.map((item, index) => {
            product[index].cartQty = cartQty[item._id];
        })

        product.map((item, index) => {
            product[index].subtotal = item.cartQty * item.price;
        })
    
        let totalPrice = 0;
        const pro = product.map((item, index) => {
            const cartQuantity = cartQuantities[item._id] || 0; // set default value of 0 if quantity is not found
            totalPrice = totalPrice + item.price * cartQuantity;

            return { ...item, cartQuantity }
        })

        
        try {
            const _id = req.session.user.id
            const { cart } = await userModel.findOne({ _id }, { cart: 1 })

            cItem = cart;
            let cartQty = {}
            cItem.map(item => {
                cartQty[item.id] = item.quantity
                return item.quantity
            })

            if (cart == "") {
                noItem = "No Items found"
                return res.render('cart', { noItem })
            }

            const cartQuantities = {}
            const cartItems = cart.map(item => {
                cartQuantities[item.id] = item.quantity
                return item.id
            })

            const cartItem = cart.map(item => {
                return item.id
            })
        
            let product = await productModel.find({ _id: { $in: cartItem } }).lean()
            product.map((item, index) => {
                product[index].cartQty = cartQty[item._id];
            })

            product.map((item, index) => {
                product[index].subtotal = item.cartQty * item.price;
            })
        
            let totalPrice = 0;
            const pro = product.map((item, index) => {
                const cartQuantity = cartQuantities[item._id] || 0; // set default value of 0 if quantity is not found
                totalPrice = totalPrice + item.price * cartQuantity;

                return { ...item, cartQuantity }
            })
            const totalAmount = 40 + totalPrice;
    
            res.render('checkout', { user, product, pro, totalPrice, totalAmount })
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}

//POST REQUEST FOR CHECK OUT
const postCheckout=async (req,res)=>{
    const { payment, address:addressId, couponcode, walletUse } = req.body
    const _id=req.session.user.id
    console.log('id',_id)
    const user=await userModel.findById({_id}).lean()
    const cart = user.cart
    let cartQuantities = {};
    const cartList = cart.map((item) => {
        cartQuantities[item.id] = item.quantity;
        return item.id;
    });
    const { address } = await userModel.findOne({ "address._id": addressId }, { _id: 0, address: { $elemMatch: { _id: addressId } } })
    console.log('address',address)
    req.session.userAddress = {
        id: address[0].id
    }
    const product = await productModel.find({ _id: { $in: cartList } }).lean()
    let totalPrice = 0
    let price = 0
    product.forEach((item, index) => {
        price = price + (item.price * cart[index].quantity)
    })
    if (payment != 'cod') {
        let orderId = "order_" + createId();
        const options = {
            method: "POST",
            url: "https://sandbox.cashfree.com/pg/orders",
            headers: {
                accept: "application/json",
                "x-api-version": "2022-09-01",
                "x-client-id": '33823439e2a66bf248ccfb9743432833',
                "x-client-secret": '6b0493ad02b6b87f899d6d8911e64c8b5b90157f',
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
                    return_url: "http://localhost:5000/return?order_id={order_id}",  
                },
            },
        };
        await axios
            .request(options)
            .then(function (response) {

                return res.render("paymenttemp", {
                    orderId,
                    sessionId: response.data.payment_session_id,
                });
            })
            .catch(function (error) {
                console.error(error);
            });
        } else {  
    let orders = []
    let i = 0
    let cartLength = user.cart.length
    for (let item of product) {

        await productModel.updateOne(
            { _id: item._id },
            {
                $inc: {
                    quantity: -1 * cartQuantities[item._id],
                },
            }
        );
        totalPrice = (cart[i].quantity * item.price)
            orders.push({
                address: address[0],
                product: item,
                userId: req.session.user.id,
                quantity: cart[i].quantity,
                total: totalPrice ,
            })
        i++;
    }
    const order = await orderModel.create(orders) //work as insert many
    await userModel.findByIdAndUpdate({ _id }, {
        $set: { cart: [] }
    })
    res.render('orderPlaced')
}  
}

const getpaymentUrl=async(req,res)=>{
    try {
        const order_id = req.query.order_id;
        const options = {
            method: "GET",
            url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
            headers: {
                accept: "application/json",
                "x-api-version": "2022-09-01",
                "x-client-id": '33823439e2a66bf248ccfb9743432833',
                "x-client-secret": '6b0493ad02b6b87f899d6d8911e64c8b5b90157f',
                "content-type": "application/json",
            },
        };
        const response = await axios.request(options);
        if (response.data.order_status == "PAID") {
            const { payment, address:addressId, couponcode, walletUse } = req.body
            const _id=req.session.user.id
            console.log('id',_id)
            const user=await userModel.findById({_id}).lean()
            const cart = user.cart
            let cartQuantities = {};
            const cartList = cart.map((item) => {
                cartQuantities[item.id] = item.quantity;
                return item.id;
            });
            const address = req.session.userAddress.id
            let newAddress = await userModel.findOne({ _id }, { _id: 0, address: { $elemMatch: { id: address } } })
            console.log('new addres' + newAddress)
            const product = await productModel.find({ _id: { $in: cartList } }).lean()
            let totalPrice = 0
            let price = 0
            product.forEach((item, index) => {
                price = price + (item.price * cart[index].quantity)
            })
            let orders = []
    let i = 0
    let cartLength = user.cart.length
    for (let item of product) {
        await productModel.updateOne(
            { _id: item._id },
            {
                $inc: {
                    quantity: -1 * cartQuantities[item._id],
                },
            }
        );
        totalPrice = (cart[i].quantity * item.price)
            orders.push({
                address: newAddress.address[0],
                product: item,
                userId: req.session.user.id,
                quantity: cart[i].quantity,
                total: totalPrice ,
                paymentType: 'online',
                paid: true

            })
        i++;
    }
    const order = await orderModel.create(orders) //work as insert many
    await userModel.findByIdAndUpdate({ _id }, {
        $set: { cart: [] }
    })
    res.render('orderPlaced')
    } 
}catch (err) {
        console.log(err);
        res.redirect('error-page')
        }
}

//*******************PRODUCT DETAIL PAGE********************************* */

//GET REQUEST FOR PRODUCT DETAIL
const getproductDetail = async (req, res) => {
    let loggedIn = false
    if (req.session.user)
        loggedIn = true
    else res.redirect('/login')
    const id = req.params.id
    const product = await productModel.findById(id).lean()
    const category = await categoryModel.find().lean()
    res.render('productDetails', { product, category, loggedIn })
}

//****************************SHOP PAGE************************************************* */
//GET METHOD FOR SHOP PAGE
const getShop = async (req, res) => {

    let products = await productModel.find().lean()
    let category = await categoryModel.find().lean()
    res.render('shop', { products, category })
}

//***************************USER PROFILE*********************************************** */
//GET REQUEST FOR USER PROFILE
const getUserProfile = async (req, res) => {
    let loggedIn = false
    if (req.session.user)
        loggedIn = true
    else res.redirect('/login')
    const _id = req.session.user.id
    const user = await userModel.findOne({ _id }).lean()
    console.log(user);
    res.render('userProfile', { user })
}

//POST REQUEST FOR USER PROFILE

const addAddress = async (req, res) => {
    const _id = req.session.user.id
    await userModel.updateOne({ _id }, {
        $addToSet: {
            address: {
                ...req.body,
                id: createId(),
            }
        }
    })
    res.redirect('/userProfile')
}

//**********************WISH LIST******************************************************** */
//GET REQUEST FOR WISH LIST

const getwishList = async (req, res) => {
    let id = req.session.user.id
    let user = await userModel.findOne({ _id: id }, { password: 0 }).lean();
    let wishlist = user.wishlist
    let product = await productModel.find({ _id: { $in: wishlist } }).lean()
    res.render('wishList', { product })
}
const addTowishList = async (req, res) => {
    try {
        const _id = req.session.user.id
        console.log(_id)
        const id = req.params.id
        console.log('id', id)
        await userModel.updateOne({ _id }, { $addToSet: { wishlist: id } })
        res.redirect('/wishList')
    } catch (err) {
        console.log('My error', err)
    }

}

const getRemoveFromWishlist = async (req, res) => {
    if (req.session.user) {
        const _id = req.session.user.id
        const proId = req.params.id
        console.log(proId);
        await userModel.updateOne({ _id }, { $pull: { wishlist: proId  } })
        res.redirect('back')
    }
    else {
        res.redirect('/login')
    }
}

//**********************ADD ADDRESS******************************************************** */
//GET REQUEST FOR ADD ADDRESS
const getaddAddress = async (req, res) => {
    res.render('add-address')
}

// DELETING ADDRESS
const deleteAddress = async (req, res) => {
    const _id = req.session.user.id
    const id = req.params.id
    await userModel.updateOne({ _id, address: { $elemMatch: { id } } }, {
        $pull: {
            address: { id }
        }
    })
    res.redirect('/userProfile')
}

//GET REQUEST FOR EDIT ADDRESS
const geteditAddress = async (req, res) => {
    const id = req.params.id
    console.log(id)
    let { address } = await userModel.findOne({ 'address.id': id }, { _id: 0, address: { $elemMatch: { id } } })
    res.render('edit-address', { address: address[0] })
}

//POST REQUEST FOR EDIT ADDRESS
const editAddress = async (req, res) => {
    const id = req.body._id
    console.log(id);

    await userModel.updateOne(
        {
            _id: req.session.user.id,
            address: { $elemMatch: { id: req.body._id } }
        },
        { $set: { "address.$": req.body } }

    )
    res.redirect("/userProfile")
}
//***********************ORDER PLACED************************************************ */
//GET REQUEST FOR ORDER PLACED
const getorderPlaced = async (req, res) => {
    res.render('orderPlaced')
}


//***************************************MY ORDERS************************************ */
//GET REQUEST FOR MY ORDERS page
const getmyOrder = async (req, res) => {
    const order = await orderModel.find({}).lean();
    console.log(order)
    res.render('myorder', { order })
}
module.exports = {
    getRemoveFromWishlist ,getaddAddress,getpaymentUrl, addAddress, minusQuantity, addQuantity, getAddtoCart, getRemoveFromCart, getCart, getmyOrder, getorderPlaced, getcheckOut, editAddress, geteditAddress, deleteAddress, addTowishList, getwishList, getUserProfile, getproductDetail, verifyOtp, getOtp, getShop, getUserHome, getSignup, userLogout, signup, userlogin, gethome, login, getOtp,postCheckout
}