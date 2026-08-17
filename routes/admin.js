const express = require ('express');
const router = express.Router();
const adminController = require ('../controller/admin')
const isAuth = require('../middleware/isAuth').isAuth
const isAdmin =  require('../middleware/isAuth').isAdmin

router.get('/dashboard', isAuth,isAdmin,adminController.getDashBoard )

router.get('/addpost' ,isAuth,isAdmin,adminController.getAddPost )
router.post('/addpost' ,isAuth,isAdmin,adminController.postAddPost )

router.get('/edit/:postId',isAuth,isAdmin, adminController.getEditPost)
router.post('/edit/:postId',isAuth,isAdmin, adminController.postEditPost)
router.post('/delete/:postId', isAuth,isAdmin,adminController.postDeletePost)


module.exports = router


