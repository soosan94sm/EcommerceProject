const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/userModels')
const Products = require('../models/productModel')
const mongoose = require('mongoose');
const Banner=require("../models/bannerModel")
const session = require('express-session')
const otp = require("../config/otp");
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
const Coupon=require("../models/couponModel")
const { v4: uuidv4 } = require('uuid');
function generateShortUUID() {
  const uuid = uuidv4().split('-')[0]; // Get the first part of the UUID
  const shortUUID = '0'+ uuid.slice(0, 4); // Take the first 4 characters and prepend #
  return shortUUID;
}
const userUtils=require("../utils/userUtils")
//to encrypt password
const securePassword = async (pass) => {
  try {
    const passHash = await bcrypt.hash(pass, 10)
    return passHash
  } catch (e) {
    console.log("password err", e.message);
  }
}
//load home page
module.exports.getUserHome = async (req, res) => {
  try {
    let user = 0;
    if (req.session.userId) {
      const userId = req.session.userId
      console.log("in load home: ", userId)
      user = await User.findOne({ email: userId });
      
      console.log(user)
    }
    const product = await Products.find({isList:true})
    const category = await Category.find({isList:true})
    const banner = await Banner.aggregate([
      {
        $match: {
          isList: true
        }
      }
    ]);
    res.render('home', { user, product: product, category: category ,banner:banner});
   }catch (err) {
    console.error(err.message);
    // res.status(500).render('logout');
  }
}

//load login with password page
module.exports.getLogin = async (req, res) => {

  res.render('login')
}

module.exports.getLogout = async (req, res) => {

  req.session.userId = ""
  console.log("destroyed")
  res.redirect('/')
}

module.exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    //console.log(req.body);
    const user = await User.findOne({ email })
    //console.log(user);
    if (user) {
      const matchPass = await bcrypt.compare(password, user.password)
      if (matchPass) {

        if (user.isBlocked) {
          res.render("login", { message: "your account is blocked" })

          
        } else {
          req.session.userId = user.email
          //console.log(req.session.userId)
          res.redirect('/')
        }

      } else {
        res.render('login', { message: "please enter valid credentials" })
      }
    } else {
      res.render('login', { message: "Please Enter the registered email and password"})
    }

  } catch (err) {
    console.log(err);
  }
}

//login with op loading
module.exports.getOtp = async (req, res) => {
  res.render('otpValidation');
}

//to sednd otp
module.exports.postOtp = async (req, res) => {
  try {
    const phone = req.body.phone;
    console.log(phone)
    otp.sendOTP(phone)
    res.render("otpVerification")
  } catch (err) {
    console.log("in post otp: ", err.message);
  }
  //res.redirect('/otpVerify')
}


module.exports.getSignup = async (req, res) => {
  res.render('signup')
}

module.exports.postSignup = async (req, res) => {
  const { name, email, password, phone, confirmpassword } = req.body
  try {
    const { name, email, password, phone, confirmpassword } = req.body
    //console.log(req.body)
    let existing = await User.find({ $or: [{ email: email }, { phone: phone }] })


    if (existing.length === 0) {


    } else {
      res.render('signup', { message: "User already exists" })
    }
  } catch (e) {
    console.log("postsignup", e.message);
  }

  if (confirmpassword !== password) {
    res.render('signup', { message: "Password do not match" })
  } else if (!phone.match(/^[6789]\d{9}$/)) {
    res.render('signup', { message: "Invalid mobile number" })
  } else {
    const bcryptPass = await securePassword(password)
    const createUser = await User.insertMany([{
      name: name,
      email: email,
      password: bcryptPass,
      phone: Number(phone)
    }])
    //console.log(createUser);
    res.redirect('/login')
  }

}



module.exports.postOtpVerify = async (req, res) => {
  try {

    const userOtp = req.body.otp;
    //console.log(userOtp);
    const user = await User.findOne({ otp: userOtp })
    console.log(user);
    req.session.userId = user.email;
    res.redirect('/')

  }



  catch (e) {
    console.error(e);
  }
}
module.exports.getProduct = async (req, res) => {
  try{ if(req.query.id && req.session.userId){
    const categoryy=await Category.find({_id:req.query.id,isList:true} );
     const category=await Category.find({}) 
      
    console.log(categoryy);
    categoryy.map(async(item)=>{
     const product=await Products.find({category:item.categoryName,isList:true})
  console.log("000000000000000000000",product)
  res.render('categorypro', { product:product })
})
  

  
}else{
const category=await Category.find({})
  console.log("category.............",category)
 const product=await Products.find({})
  console.log("product............",product)
  res.render("product",{product:product,category:category})
}


   }catch (err) {
    console.error(err);

  }
}
// Modify your server route to handle category-specific product retrieval



module.exports.getProductDetail = async (req, res) => {
 console.log("req.query.id",req.query.id)
  const product = await Products.find({_id:req.query.id})
   //console.log("products....",product)
  

  res.render('productDetails', {product:product})
 }
module.exports.getCategory = async (req, res) => {
 try{ if(req.query.id && req.session.userId){
    const categoryy=await Category.find({_id:req.query.id,isList:true} );
     const category=await Category.find({}) 
      
    console.log(categoryy);
    categoryy.map(async(item)=>{
     const product=await Products.find({category:item.categoryName,isList:true})
  console.log("000000000000000000000",product)
  res.render('categorypro', { product:product })
})
}}catch(e){
console.log(e.message)
}}
// module.exports.getAbout = async (req, res) => {
//   res.render('about')
// }
module.exports.getContact = async (req, res) => {
  res.render('contact')
}
//user profile
module.exports.getProfilenav=async(req,res)=>{
  res.redirect("/profile/account")

}
module.exports.getUserProfile = async (req, res) => {
  const userId = req.session.userId;
console.log(userId)

  try{
    const user =await User.findOne({email:req.session.userId})
    console.log(user)
    res.render('userprofile',{userdata:user,user:user})
  
}catch(err){
    console.error("getProfile",err.message);
}
}

 module.exports.postUserProfile = async (req, res) => {
  try{
  const { productId, count } = req.body;
res.redirect("/profile/account")
  console.log("Message received from frontend:", productId, count, req.session.userId);
}catch(err){
  console.error("postCart",err.message);
}
 }
 function upload() {
  const fileInput = document.getElementById('profilePictureInput');
  const file = fileInput.files[0];
  console.log(file);

  // Create a new FormData object
  const formData = new FormData();

  // Append the file to the FormData object with the desired field name
  formData.append('croppedimage', file);

  // Submit the form
  form.submit();
}

 module.exports.getProfileImageUpload = async (req, res) => {
  try {
      const file = req.file;
      const fileName = file.filename;
      const mainImageFile = req.file.path;

      const croppedMainImage = await sharp(mainImageFile)
          .resize(500, 500, {
              fit: 'cover',
              position: 'top'
          })
          .toBuffer();

      const mainImageFilename = `cropped-${req.file.filename}`;

      // Specify the correct destination path for the cropped image
      const destinationPath = path.join(__dirname, '../admin/assets/uploads/', mainImageFilename);

      const croppp = await sharp(croppedMainImage)
          .toFile(destinationPath);

      const userdata = await User.findById(req.session.userId);
      userdata.profileImage = mainImageFilename;
      const trial = await userdata.save();

      res.redirect('/userprofile');
  } catch (err) {
      console.log("prof image upload >> ", err.message);
  }
};




module.exports.getCart = async (req, res) => {

const getCartItems = async (user) => {
  const cartData = [];

  for (const item of user.cart) {
  const user =await User.findOne({email:req.session.userId})
    const product = await Products.findOne({ _id: item.productId });
    if (product) {
      let total = item.quantity * product.price;
      cartData.push({user:user, count: item.quantity, product: product,total:total });
    }
 

  }
 // console.log("888888888888888888888888888888888888",cartData)
  return cartData;

};

try {
  if (req.session.userId) {

    const user = await User.findOne({ email: req.session.userId }, { cart: 1, _id: 0 });
//   console.log(user);
let sub
    if (user) {
      const cartData = await getCartItems(user);
      //console.log(cartData)
      let totalArr=[]
      cartData.map(item=>{
          totalArr.push(item.total)
      })
      if(totalArr.length!==0){
           sub=totalArr.reduce((acc,sum)=>{return acc+sum})
      }
    
      const uniqueCartItems = cartData.filter((item, index, self) =>
        index === self.findIndex(t => t.product && t.product._id.equals(item.product._id))
      );
     //console.log("uniqueCartItems",uniqueCartItems)
      res.render('cart', { user:user,cartItem: uniqueCartItems,subTotal:sub });

    } else {
      console.error("getCart: User not found");
      return res.status(404).send("User not found");
    }
  }
} catch (e) {
  console.error("getCart", e.message);
  return res.status(500).send("Internal Server Error");
}




}




module.exports.postAddToCart=async (req, res) => {
  try{ 
 
  const productId = new mongoose.Types.ObjectId(req.body.productId);// Assuming the product ID is sent in the request body
// console.log(productId)
//console.log("req.session.userId",req.session.userId)

 const user=await User.findOneAndUpdate({email:req.session.userId},{
  $push: { 
    cart: { productId: productId } // Push an object with productId into the cart array
  }
})
 //console.log("user..............................")
}catch(err){
  console.log("error",err.message)
}
  
};

module.exports.getCartDelete = async(req,res)=>{
  try{ 
      const id = req.query.id
      console.log("iiiiiiiiiiiiii",req.query.id)
      const userId = req.session.userId;
       console.log("2222222222222222222",userId)
       
    
    const userData= await User.findOneAndUpdate({ email: userId},{ $pull: { cart: { productId: id } } })
    //console.log("000000000000000000000000",userData.cart)
      res.redirect('/cart')
  }catch(err){
      console.error("cart delete",err);
  }
}

module.exports.postCartQuantity=async(req,res)=>{
  const getCartItems = async (user) => {
    const cartData = [];
    
    for (const item of user.cart) {
    const user =await User.findOne({email:req.session.userId})
      const product = await Products.findOne({ _id: item.productId });
      
      if (product) {
        let total = item.quantity * product.price;
       
        cartData.push({user:user, quantity: item.quantity, product: product,total:total });
      }
   

    }
    return cartData;
  };
try{
    const { productId, quantity } = req.body;
     //console.log("Message received from frontend:", productId, count, req.session.userId);
    
    
    const product = await Products.findOne({ _id: productId });
  //console.log(product)
    
    let indTotal
    
      if (product) {
        if(quantity>product.stock){
            return res.status(400).json({ success: false ,message:"out of stock"});
        }else{
             indTotal = quantity * product.price
            
            await User.updateOne(
                { email: req.session.userId, "cart.productId": req.body.productId },
                { "cart.$.quantity": parseInt(quantity)  } // Increment the count by the given value
              );
            
              const user = await User.findOne({ email: req.session.userId }, { cart: 1, _id: 0 });
              let sub
              if (user) {
                const cartData = await getCartItems(user);
                let totalArr=[]
                cartData.map(item=>{
                    totalArr.push(item.total)
                })
                 sub=totalArr.reduce((acc,sum)=>{return acc+sum})
                // console.log(sub);
            }
            return res.status(200).json({ success: true ,indTotal:indTotal,quantity:quantity,productId:productId,subTotal:sub});
        }
      
    }
    else if(req.session.userId === undefined){
            res.render('productDetail',{product,message:"Please Login"})
        }
           
}catch(err){
    console.error("updateCart",err.message);
}
}
module.exports.getCheckout=async(req,res)=>{
  try{
  const getCartItems = async (user) => {
    const cartData = [];
    
    for (const item of user.cart) {
    const user =await User.findOne({email:req.session.userId})
      const product = await Products.findOne({ _id: item.productId });
      console.log("user....................................",user)
      if (product) {
        let total = item.quantity * product.price;
           
        cartData.push({user:user, count: item.quantity, product: product,total:total});
      }
    }
    //console.log(cartData)
    console.log("cartdata....................................",cartData)
    return cartData;
  };
   
     
     
      if(req.session.id){
        const user = await User.findOne({ email: req.session.userId }, { cart: 1, _id: 0 });
        const userList =await User.findOne({email:req.session.userId})
        //   console.log(user);
             
                if (user) {
                  const cartData = await getCartItems(user);
                  let totalArr=[]
                  cartData.map(item=>{
                      totalArr.push(item.total)
                  })
                   sub=totalArr.reduce((acc,sum)=>{return acc+sum})
        //   [{count,product}]
                const uniqueCartItems = cartData.filter((item, index, self) =>
                  index === self.findIndex(t => t.product && t.product._id.equals(item.product._id))
                );
                console.log(userList.address.items); 
                const currentDate = new Date();
                const availableCoupon=[]
                const coupons=await Coupon.find({isList:true})
                // const coupons = await Coupon.find({isList:true,userId:{$ne:userList._id}})
                  coupons.forEach(item=>{



                    const exp = new Date(item.expiryDate)
                    const bool = exp >= currentDate
                    console.log(bool);
                    if(bool){
                      availableCoupon.push(item)
                    }

                  })
                
                  console.log("availableCoupon",availableCoupon);
                  res.render('checkout',{user:userList,addressList:userList.address.items,productData:uniqueCartItems,total:sub,coupon:availableCoupon})
      }
    }
    }catch(err){
        console.error("getCheckout",err.message);


        
    }
}
// module.exports.getProductList = async(req,res)=>{
    
// }

module.exports.getConfirmOrder = async(req,res)=>{
    try{
      const user = await User.findOne({email:req.session.userId})
        res.render('confirmOrder',{user:user})
    }catch(err){
        console.error("getConfirmOrder",err.message);
    }
 }

  
 module.exports.postCheckout = async (req, res) => {
  
  const getCartItems = async (user) => {
    const cartData = [];
   
    for (const item of user.cart) {
    const user =await User.findOne({email:req.session.userId})
      const product = await Products.findOne({ _id: item.productId });
      if (product) {
        let total = item.quantity * product.price;
       
        cartData.push({user:user, count: item.quantity, product: product,total:total });
      }
    }
    return cartData;
  };
  try {
    const grandTotal = Number(req.body.total);
    const paymentMode = req.body.paymentMode;
    const address = req.body.address;

    const user = await User.findOne({ email: req.session.userId }, { cart: 1 });

    if (user) {
      const orderItems = []; // Change the variable name here

      user.cart.forEach(item => {
        orderItems.push({
          product_id: item.productId,
          quantity: item.quantity,
        });
      });

      console.log( "orderItem................",orderItems)
      // Handle the case where the product is not found
      orderItems.forEach(async (orderItem) => {
        try {
          // Find the product in the database by product_id
          const product = await Products.findOne({_id: orderItem.product_id });
          
      // console.log("productts======",product);
          // If the product is found, decrement the stock_quantity
          if (product) {
            product.stock -= orderItem.quantity;
      
            // Save the updated product back to the database
            await product.save();
          }
          
              // const coupon = await Coupon.findOneAndUpdate(
              //     { _id: couponId },
              //     {
              //       $push: { userId: user._id }
              //     },
              //     { new: true } // To return the updated document
              //   );
                
                // console.log("Updated Coupon:", coupon);
        } catch (error) {
          console.error('Error updating product stock:', error);
        }
      });
      
        const orderid =generateShortUUID();
      const currentDate = new Date();
      // Add 10 days to the current date I am setting 10days after purchase date for delivery date
      
      const updatedDate=currentDate.setDate(currentDate.getDate() + 10);
      const order = await Order.create({
          orderId:orderid,
          address:address,
          user: user._id, 
          orderItem:orderItem,
          paymentMethod: paymentMode,
          totalAmount: grandTotal,
        
          deliveryDate:updatedDate
        });
      
      
      // console.log(updatedDateAsString);
       // console.log(order);
        await User.updateOne(
          {email:req.session.userId},
          {$unset:{"cart":1}}
          )
          return res.status(200).json({ success: true });
      }}
       catch (err) {
    console.error("postCheckout", err.message);
    res.status(400).json({ success: false });
  }
}
// module.exports.getForgot= async (req, res) => {
// res.render("forgot")}
module.exports.postForgot= async (req, res) => {
  const { email } = req.body;
  try {
    // Step 2: Generate a Token
    const token = crypto.randomBytes(20).toString('hex');

    // Step 3: Store Token and Expiration Time
    const user = await User.findOne({ email });
    if (!user) {
      // Handle the case where the user doesn't exist
      return res.redirect('/forgotpassword');
    }
    
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Step 4: Send Reset Email
    const transporter = nodemailer.createTransport({
      // configure your email service here (e.g., Gmail, SendGrid)
    });

    const mailOptions = {
      from: 'soosan94sm@gmail.com',
      to: user.email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: http://localhost:3000/reset/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    // Notify the user that a password reset email has been sent
    res.redirect('/forgotpassword');
  } catch (err) {
    console.error(err);
  }
};

// Step 5: Password Reset Page
module.exports.getResetPassword=async (req, res) => {
  const { token } = req.params;
  try {
    // Step 6: Verify Token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Handle the case where the token is invalid or expired
      return res.redirect('/forgotpassword');
    }

    // Render a password reset form
    res.render('reset-password');
  } catch (err) {
    console.error(err);
  }
};

// Step 7: Allow Password Reset
module.exports.postResetPassword=async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Handle the case where the token is invalid or expired
      return res.redirect('/forgot-password');
    }

    // Update the user's password and clear the token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Step 8: Notify User
    // Send a confirmation email to the user
    res.redirect('/login');
  } catch (err) {
    console.error(err);
 }
}

// module.exports.getResetPassword=(req,res)=>{
//   const resetToken = req.query.token
//   // verify the token against the stored token in userdatabase
//   if(resetToken){
//     const user=  User.findOne({resetToken:resetToken})
//     if(user){
//         res.render('resetpass')
//     }else{
//       res.render('forgot',{message:"Invalid or expired rest token. Try again!"})
//     }
//   }else{
//       res.render('forgot',{message:"Invalid or expired rest token. Try again!"})
//   }
// }
// module.exports.postResetPassword=async(req,res)=>{
//   const resetToken = req.query.token;
//   const newPassword = req.body.newPassword
//   const confirmPassword = req.body.confirmPassword

//   // verify the token against the stored tokens
//   if(resetToken){
//    const user=   User.findOne({resetToken:resetToken})
//    if(user){
//       //validate the new password and confirm password
//       if(newPassword === confirmPassword){
//           // update the user's password in the database
//           user.password = newPassword;
//           // clear the reset token
//           user.resetToken = undefined
//           user.save((error)=>{
//               if(error){
//                   console.error(error);
//               }else{
//                   //  redirect to login page and display success message 
//                   res.render('login',{passwordMessage:"Password reset successfully"})
//               }
//           })
//       }else{
//           // handle password mismatch error
//           res.render('resetpass',{message:"New password and confirm password do not match"})
//       }
//    }
//   }else{
//        // Handle missing token
//       res.render('resetpass',{message:"Invalid reset token"})

//   }

// }



  module.exports.postSearch = async(req,res)=>{
    try{
      
    const searchQuery = new RegExp("^" + req.body.search, "i"); 
    // Adding "i" flag for case-insensitive search
const user=await User.find({isBlocked:true})
const category=await Category.find({isList:true})
 const products=await Products.find({ productName: { $regex: searchQuery } })
    //console.log("search ",products)  
  if (products.length === 0) {
        res.render('home',{product:[]})
      } else {
        res.render('home',{ user:user,product: products, category: category })
      }
  
    }
    catch(err){
console.log(err.message)
    }
}
module.exports.geterror = async(req,res)=>{
res.render("error")
}
module.exports.postCouponUpdate=async(req,res)=>{
  try{
      console.log(req.body);
      const couponId = req.body.couponId
      const user = await User.findOne({email:req.session.userId})
     console.log(user._id);
     
      // const coupon = await Coupon.findOneAndUpdate(
      //     { _id: couponId },
      //     {
      //       $push: { userId: user._id }
      //     },
      //     { new: true } // To return the updated document
      //   );
        
      //   console.log("Updated Coupon:", coupon);
    
        return res.status(200).json({ success: true,couponId});
        
        
        

  }catch(err){
      console.error("postCouponUpdate ===>",err.message);
  }
}

// module.exports.get (req, res) => {
//   res.sendFile(__dirname + '/change_password.html');
// });

// module.exports.postchangep=  (req, res) => {
//   const { oldPassword, newPassword, confirmPassword } = req.body;
//   const user = req.session.user;

//   if (bcrypt.compareSync(oldPassword, user.password)) {
//     if (newPassword === confirmPassword) {
//       // Hash the new password and update it in the user's data (replace with your database logic)
//       const hashedPassword = bcrypt.hashSync(newPassword, 10);
//       user.password = hashedPassword;
//       return res.send('Password changed successfully');
//     } else {
//       return res.send('New passwords do not match');
//     }
//   } else {
//     return res.send('Old password is incorrect');
//   }
// });
