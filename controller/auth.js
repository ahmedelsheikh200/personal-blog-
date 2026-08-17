const {validationResult } = require('express-validator');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require ('../model/user');
const session = require('express-session')

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});


exports.getSignUp = (req,res,next)=>{
    res.render('auth/signup',{
        path: 'signp',
        errMessage :''
    });
}

exports.postSignUp = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render('auth/signup', {
            path: 'signup',
            errMessage: errors.array()[0].msg,
            oldInput: req.body
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).render('auth/signup', {
            path: 'signup',
            errMessage: 'Password Must match',
            oldInput: req.body
        });
    }

    User.findOne({
        $or: [{ email: email }, { username: username }]
    }).then(user => {
        if (user) {
            return res.status(400).render('auth/signup', {
                path: 'signup',
                errMessage: 'Username or email exists already',
                oldInput: req.body
            });
        }

        // only reaches here if user does NOT exist
        bcrypt.hash(password, 10)
            .then(hashedPassword => {
                const otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false
                });
                req.session.tempUser = { username, email, password: hashedPassword };
                req.session.otp = otp;
                req.session.otpExpires = Date.now() + 5 * 60 * 1000;

                return transporter.sendMail({
                    from: '"My Blog" <ahmedaliiieei@gmail.com>',
                    to: email,
                    subject: 'Confirm your email!',
                    html: `<h3>Your verification code is: <b>${otp}</b></h3><p>Valid for 5 minutes.</p>`
                });
            }).then(info=> console.log (info))
            .then(() => {
                req.session.save(err => {
                    if (err) return next(err);
                    res.redirect('/verify-otp');
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    })
    .catch(next);
};

exports.getVerifyOtp = (req, res, next) => {
    if (!req.session.tempUser) {
        return res.redirect('/signup');
    }
    res.render('auth/verify-otp', {
        path: 'verify',
        errMessage: null,
        email: req.session.tempUser.email
    });
};

exports.postVerifyOtp = (req, res, next) => {
    const userOtp = req.body.otp;
    const sessionOtp = req.session.otp;
    const otpExpires = req.session.otpExpires;
    const tempUser = req.session.tempUser;

    // Check if session data exists
    if (!tempUser || !sessionOtp) {
        return res.redirect('/signup');
    }

    // Check if OTP is expired
    if (Date.now() > otpExpires) {
        return res.status(400).render('auth/verify-otp', {
            path: 'verify',
            errMessage: 'OTP has expired. Please sign up again.',
            email: tempUser.email
        });
    }

    // Validate OTP
    if (userOtp !== sessionOtp) {
        return res.status(400).render('auth/verify-otp', {
            path: 'verify',
            errMessage: 'Invalid OTP code.',
            email: tempUser.email
        });
    }

    // OTP is valid -> Save user to Database (Example using Mongoose User model)
    const newUser = new User({
        username: tempUser.username,
        email: tempUser.email,
        password: tempUser.password
    });

    newUser.save()
        .then(result => {
            // Clear temporary registration session data
            req.session.tempUser = null;
            req.session.otp = null;
            req.session.otpExpires = null;
            
            // Log the user in directly or redirect to login page
            res.redirect('/login');
        })
        .catch(next);
};


exports.getLogin = (req,res,next)=>{
    res.render('auth/login',{
        path:'login',
        errMessage:null
    })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;

    User.findOne({ email: email })
        .then(user => {
           
            if (!user) {
                return res.status(401).render('auth/login', {
                    path: 'login',
                    errMessage: 'Invalid email or password.',
                    oldInput : req.body
                });
            }

            return bcrypt.compare(password, user.password)
                .then(doMatch => {
                    // 3. If passwords do not match
                    if (!doMatch) {
                        return res.status(401).render('auth/login', {
                            path: 'login',
                            errMessage: 'Invalid email or password.',
                            oldInput : req.body
                            
                        });
                    }
                    req.session.isAuthorized = true; 
                    req.session.user={_id : user._id.toString()};         

                    
                    return req.session.save(err => {
                        if (err) return next(err);
                        res.redirect('/'); 
                    });
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });s
};

exports.postLogout= (req,res,next)=>{
  req.session.destroy(()=>{
    res.redirect('/')
  })
}