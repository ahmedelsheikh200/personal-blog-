const express = require ('express');
const router = express.Router()
const userController= require('../controller/user')
const authController= require('../controller/auth')
const isAuth = require ('../middleware/isAuth').isAuth

const { body} = require('express-validator');

router.get('/', userController.getHome)
router.get('/article/:postId', userController.getArticle)

//signup 
router.get('/signup', authController.getSignUp)
router.post('/signup',[body('email').isEmail().trim().withMessage('Valid email required'),
    body('username').trim().isAlphanumeric().isLength({min:7}).withMessage('valid username required'),
    body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain both letters and numbers')

] ,authController.postSignUp)

router.get('/verify-otp',authController.getVerifyOtp)
router.post('/verify-otp',authController.postVerifyOtp)

router.get('/login',authController.getLogin)
router.post('/login',authController.postLogin)

router.post('/logout',authController.postLogout)

router.post('/like/:postId',isAuth ,userController.postLike)
router.post('/dislike/:postId',isAuth ,userController.postDislike)
router.get('/favourites',isAuth , userController.getFavourites)


router.post('/download/:postId',isAuth , userController.downloadArticle)


module.exports = router