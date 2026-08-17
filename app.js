const express = require ('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000
require('dotenv').config();
const path = require('path');
const session = require('express-session') ;
const MongoDBStore = require('connect-mongodb-session')(session);

const User = require('./model/user')
const userRouter = require('./routes/user')
const adminRouter= require('./routes/admin')
const errorController = require('./controller/error')




app.set('view engine','ejs');
app.set('views','views')
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({ extended: true }));


const store = new MongoDBStore({
  uri: process.env.DB_url,
  collection: 'mySessions'
});


app.use(session({
  secret: 'Secret Session',
  resave: false,
  saveUninitialized: false ,
  store : store 

}))

app.use((req,res,next)=>{
    if(! req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user=>{
        req.user=user;
         next();
    }).catch(err=> console.log(err))
})

app.use((req,res,next)=>{
    if(req.user){
        res.locals.isAdmin = req.user.isAdmin 
    }else {
        res.locals.isAdmin = false
    }
    res.locals.isAuth = req.session.isAuthorized
    next();
})

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} request to ${req.url}`);
    
    // 2. Crucial: Call next() so Node passes control to the next handler
    next(); 
})

app.use(userRouter);
app.use('/admin',adminRouter);
app.get('/500',errorController.get500)
app.use(errorController.getError)
app.use((err , req , res , next)=>{
    console.error(err);
    res.status( err.httpStatusCode || 500).render('500', {
           path: '/500'
       });
})





mongoose.connect (process.env.DB_url).then((result)=>{
    app.listen(port,()=>{
        console.log('connected to the database successfully  ✅')
        console.log(`App run on port ${port}`)
})
}).catch(err => console.log(err.message))


