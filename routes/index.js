const express = require('express');
const passport = require('passport');
const router = express.Router();
const localStrategy = require('passport-local');
const sentMail = require("../nodemailer");  

const userInfo = require("./users");
const productInfo = require("./product.js")

passport.use(new localStrategy(userInfo.authenticate()));

router.get('/', isLoggedIn,async function(req, res, next) {
  let user = await userInfo.findOne({username: req.session.passport.user})
  let product = await productInfo.find();
  res.render("homepage",{user, product})
});
 
router.post('/registeruser',function(req,res){
  let users = new userInfo({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    phoneNo: req.body.phoneNo,
    admin: false
  })
  userInfo.register(users, req.body.password)
    .then(function(newuser){
      passport.authenticate('local')(req,res,function(){
        res.redirect('/');
      })
    })
    .catch(function(err){
      res.send(err);
    })
});

router.get('/registeruser',function(req,res){
  res.render("register")
});

router.post('/login',passport.authenticate('local',{
  successRedirect: "/",
  failureRedirect: "/login" 
}),function(req,res){});

router.get('/login',function(req,res){
  res.render("login")
})

router.get('/logout',isLoggedIn,function(req,res){
  req.logOut(function(err){
    if (err) throw err;
    res.redirect("/login");
  });
});

router.get('/profile',isLoggedIn,async function(req,res){
  let userLoggedIn = await userInfo.findOne({username: req.session.passport.user});
  res.render("profile", {
    user: userLoggedIn,
    text: req.flash("addProductNotification")
  });
});

router.get("/addproduct", isLoggedIn,async function(req,res){
  let user = await userInfo.findOne({username:req.session.passport.user})
  if(user.admin === true){
    res.render("addProduct",{user})
  }
  else{
    res.send("Access Denied!!!");
  }
});

router.post("/productaddition",isLoggedIn,async function(req,res){
  let user = await userInfo.findOne({username: req.session.passport.user})
  let product = await productInfo.create({
    name: req.body.productName,
    details: req.body.productDetails,
    price: req.body.productPrice,
    productPic: req.body.productImage,
    seller: user._id
  });

  user.products.push(product._id)
  let updatedUserProduct = await user.save();
  req.flash("addProductNotification","Your product has been added succesfully! ThankYou")
  res.redirect("/profile"); 
});

router.get("/check-username/:username",function(req,res){
  userInfo.findOne({username : req.params.username})
  .then(function(user){
    res.json(user);
  })
});

router.get("/check-email/:email",function(req,res){
  userInfo.findOne({email : req.params.email})
  .then(function(user){
    res.json(user);
  })
});

router.get("/forgetpassword",function(req,res){
  // console.log(req.flash("notification"));  
  res.render("forgetPassword",{text: req.flash("notification")});
});

router.post("/forgetpasswordlink", async function(req,res){
  let user = await userInfo.findOne({email: req.body.email});
  if(user){
    let otp = Math.floor(Math.random()*100000);
    let validTillDate = Date.now() + 24*60*60*1000;
    sentMail(user.email,user._id,otp,validTillDate)
    .then(async function(){
      user.otp = otp;
      user.expireAt = validTillDate;
      await user.save();  
      req.flash("notification","Link to change password has been sent to your registered email.");
      res.redirect("/forgetpassword");  
    })  
  }
  else{
    res.status(404).send('User associated with this email not found!');
  }
});

router.get("/changepassword/:id/:otp",async function(req,res){
  let user = await userInfo.findOne({_id: req.params.id});
  if(Date.now() < user.expireAt){
    if(user.otp == req.params.otp){
      res.render("changePassword" ,{userid: req.params.id});
    }
    else{
      res.status("203").send("OTP doesn't match")
    }
  }
  else{
    res.status("408").send("Link has been expired");
  }
});

router.post("/setnewpassword/:id",async function(req,res){
  let user = await userInfo.findOne({_id: req.params.id})
  if(req.body.password == req.body.confirmPassword){
    user.setPassword(req.body.password, async function(err, user){
      await user.save();
      res.redirect("/login");
    })
  }
});

router.get("/cart",isLoggedIn ,async function(req,res){
  let user = await userInfo.findOne({username: req.session.passport.user})
  res.render("cart", {user});
});

router.get("/orderhistory",isLoggedIn ,async function(req,res){
  let user = await userInfo.findOne({username: req.session.passport.user})
  res.render("orderhistory", {user});
});

router.get("/addtocart/:productid", isLoggedIn,async function(req,res){
  let user = await userInfo.findOne({username: req.session.passport.user})
  let product = await productInfo.findOne({_id: req.params.productid})
  user.cart.push(product._id)
  let updatedUserCart = await user.save();
  res.send("done")
});

router.get("/product/:productid",isLoggedIn ,async function(req,res){
  let user = await userInfo.findOne({username: req.session.passport.user});
  let product = await productInfo.findOne({_id: req.params.productid});
  res.render("productdets", {user, product})
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect("/login");
  }
}

module.exports = router;
