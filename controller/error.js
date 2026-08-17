exports.getError = (req,res,next)=>{
    res.status(404).render('404',{
        path:"Error"
    })
}
exports.get500 = (req,res,next)=>{
  res.status(500).render ('500',{
     pageTitle: 'Error!',
      path: '/500'
  })
}
