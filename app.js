const express = require('express')

const {engine}=require('express-handlebars')
const cookieParser = require("cookie-parser");
const session = require('express-session');
const dbConnect = require('./dbConnect')
const userRouter = require('./routers/userRouter')
const adminRouter = require('./routers/adminRouter')
const MongoStore = require('connect-mongo');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const hbs=require('hbs')
dbConnect();
const app= express();
app.use(cookieParser());

app.engine('hbs', engine({extname:'.hbs'}))
app.set('view engine','hbs')
hbs.registerHelper('inc',function(value,options){
    return parseInt(value)+1;
  });
app.use(session({
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/data' }),
    secret:'123',
    resave:false,
    saveUninitialized: true
}))



app.use(function(req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

 
app.use(express.urlencoded({extended:true}))

app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 1000; //we'll use it for hosting


const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use('/admin/', adminRouter);
app.use('/',userRouter);


app.listen(port,()=>{
    console.log('started')
})