const Post = require('../model/post')

exports.getDashBoard=(req,res,next)=>{
    Post.find({author: req.user.id}).populate('author').then(posts=>{
        res.render('user/home',{
            path:'dashboard',
            posts:posts ,
            username : req.user ? req.user.username : ''

        })
    }).catch(next);

}
exports.getAddPost =(req,res,next)=>{
    res.render('admin/addpost',{
        path:'addpost',
        editing:false
    })

}

exports.postAddPost =(req,res,next)=>{
    const userId = req.user.id ;
    const title = req.body.title;
    const article = req.body.article;
    const post = new Post ({
        title : title ,
        article:article ,
        author: userId

    })
    post.save()
    .then(result=>{
        console.log(result);
        res.redirect('/admin/dashboard')
    })
    .catch(next)

}

exports.getEditPost =(req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post =>{
        res.render('admin/addpost',{
            path:'addpost',
            editing:true ,
            post:post ,
    })
    })
    .catch(next)
}

exports.postEditPost = (req,res,next)=>{
    const postId = req.params.postId
    const updatedTitle = req.body.title;
    const updatedArticle = req.body.article;

    Post.findOneAndUpdate({_id:postId},{$set:{
        title: updatedTitle ,
        article : updatedArticle}})
        .then(result=>{
        console.log('post Updated')
        console.log(result);
        res.redirect(`/article/${postId}`)
    })
}

exports.postDeletePost = (req,res,next)=>{
    const postId = req.params.postId
    Post.findOneAndDelete({_id:postId})
        .then(result=>{
        console.log('post Deleted')
        console.log(result);
        res.redirect(`/admin/dashboard`)
    })
}