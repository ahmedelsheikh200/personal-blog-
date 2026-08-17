const User = require('../model/user');
const Post = require('../model/post');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const PDFDocument = require('pdfkit');
const path = require ('path')
const fs = require('fs')







// get home page ...
exports.getHome = (req,res,next)=>{
Post.find().populate('author').then ( posts => {
    res.render('user/home',{
        path:"home",
        posts:posts,
        username : req.user ? req.user.username : '',
        likedPosts: req.user? req.user.likes.map(id => id.toString()): []
    })
}
).catch(next);
}

//get article ... 

exports.getArticle = (req,res,next)=>{
    const postId = req.params.postId ;
    if(! postId){
        throw new Error ('not valid id')
    }
    Post.findById(postId).populate('author').then (post =>{
        res.render('user/article',{
            path:post['title'],
            post:post
        })
    }).catch(next)
}

exports.postLike = (req, res, next) => {
    const user = req.user;
    const postId = req.params.postId;
    const alreadyLiked = user.likes.some(
        id => id.toString() === postId
    );

    if (alreadyLiked) {
        return res.redirect('/');
    }

    Promise.all([
        Post.findByIdAndUpdate(
            postId,
            { $inc: { likes: 1 } }
        ),

        User.findByIdAndUpdate(
            user.id,
            { $push: { likes: postId } }
        )
    ])
    .then(() => {
        res.redirect('/');
    })
    .catch(next);
};

exports.getFavourites = (req,res,next)=>{
    User.findById(req.user._id).populate('likes').then(user=>{
        res.render('user/home',{
        path:"home",
        username : user.username ,
        posts: user.likes,
        likedPosts : user.likes.map(post => post._id.toString())
    })

    }).catch(next)

}

exports.postDislike = (req, res, next) => {
    const user = req.user;
    const postId = req.params.postId;

    const liked = user.likes.some(
        id => id.toString() === postId
    );

    if (!liked) {
        return res.redirect('/');
    }

    Promise.all([
        Post.findByIdAndUpdate(
            postId,
            { $inc: { likes: -1 } }
        ),

        User.findByIdAndUpdate(
            user.id,
            { $pull: { likes: postId } }
        )
    ])
    .then(() => {
        res.redirect('/');
    })
    .catch(next);
};
  
exports.downloadArticle=(req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId).populate('author').then(post=>{
        if(!post){
            return next(new Error ('no post found'));
        }

        const filePath = path.join('data','blog.pdf');
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf')
        doc.pipe(fs.createWriteStream(filePath));
        doc.pipe(res)
        doc.fontSize(25).text(post.title)
        doc.fontSize(20).text(`by ${post.author.username}`)
        doc.fontSize(20).text(`at ${post.createdAt}`)
        doc.text('-----------------------------')
        doc.fontSize(16).text( post.article)
        doc.fontSize(10).text( 'made by Ahmed Elsheikh')

        doc.end();


    }
        
    ).catch(next)

}