exports.isAuth = (req,res,next)=>{
    if (! req.session.isAuthorized){
        return res.redirect('/signup');
    }
    next();
}

exports.isAdmin =(req,res,next)=>{
        if (!req.user.isAdmin){
            return res.redirect('/')
        }
        next();   
}