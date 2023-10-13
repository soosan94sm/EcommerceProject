const express=require("express")
const user_route=express()
const userController=require("../controllers/userControllers")
const addressController=require("../controllers/addressController")
const productController=require("../controllers/productController")
const orderController=require("../controllers/orderController")
const couponController=require("../controllers/couponController")
const filterCatController=require("../controllers/filterCatController")
const walletController=require('../controllers/walletController')
const multer=require("multer")
const userAuth = require('../middleware/userMiddleware')

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
      cb(null, path.join(__dirname,'../public/admin/assets/uploads'))
  },
  filename: (req, file, cb)=>{
      cb(null, file.originalname)
  }
})
const upload = multer({storage:storage})
user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');

//load home/landing page/
user_route.get('/',userController.getUserHome)

user_route.get('/login',userAuth.isLoggin,userController.getLogin)
user_route.get('/logout',userController.getLogout)
user_route.post('/login',userController.postLogin)
user_route.post('/otpValidation',userController.postOtp)
user_route.get('/otpValidation', userController.getOtp)
 user_route.get('/signup',userController.getSignup)
 user_route.post('/signup',userController.postSignup)
 user_route.post('/verify',userController.postOtpVerify)
 //user profile
 user_route.get('/profile',userAuth.isBlocked ,userController.getProfilenav)
user_route.get('/profile/account',userAuth.isBlocked,userAuth.isBlocked,userController.getUserProfile)
 user_route.post('/profile/account',userAuth.isBlocked,userController.postUserProfile)
 user_route.get('/profileImageUpload ',upload.single("file"),userController.getProfileImageUpload )
 
//product and category

user_route.get('/product',userController.getProduct)
user_route.get('/category',userController.getCategory)
user_route.get('/product-detail',userAuth.isBlocked,userController.getProductDetail)


 
 //user_route.get('/about',userController.getAbout)
  //user_route.get('/contact',userController.getContact)

  
 user_route.get('/cart',userAuth.isBlocked,userController.getCart)
 user_route.post('/api/add-to-cart',userAuth.isBlocked,userController.postAddToCart)
 // user_route.get('/cart/cartDelete',userController.getCartDelete)
  user_route.get('/cartDelete',userAuth.isBlocked,userController.getCartDelete)

  
//  //user_route.get('/wishlist',userController.getwishlist)
//user_route.get('/forgotpassword',userController.getForgot)

  //user_route.post('/forgotpassword',userController.postForgot)
 
  user_route.get('/reset-password',userController.getResetPassword)
 user_route.post('/reset-password',userController.postResetPassword)
// // otp page


user_route.post('/updateQuantity',userController.postCartQuantity)

user_route.get('/profile/address',userAuth.isBlocked,addressController.getAddress)

user_route.post('/profile/address',addressController.postAddress)
user_route.get('/addAddress',userAuth.isBlocked,addressController.addAddress)

user_route.post('/addAddress',addressController.postAddress)



user_route.get('/editaddress',userAuth.isBlocked,addressController.getEditAddress)

user_route.post('/editaddress',userAuth.isBlocked,addressController.postEditAddress)

user_route.get('/deleteaddress',userAuth.isBlocked,addressController.deleteAddress)

user_route.get('/checkout',userAuth.isBlocked,userController.getCheckout)
user_route.post('/checkout',userController.postCheckout)
user_route.post('/success',userController.postCheckout)

user_route.post('/createOrder', orderController.postCreateOrder);

user_route.post('/verifyPayment', orderController.postVerifyPayment);
user_route.get('/confirm-order',userController.getConfirmOrder)
// return 
user_route.get('/return',orderController.getReturn)


user_route.get('/orders',orderController.getOrders)



user_route.get("/order-details",orderController.getOrderDetails)
//product cancel
user_route.post('/product-cancel',orderController.productCancel)
//order cancel page
user_route.get('/cancel',orderController.getProductCancel)
user_route.post('/search',userController.postSearch)
user_route.get('/filter-cat',filterCatController.getFilterCat)
// filter cat using ajax
user_route.post('/filter-cat',filterCatController.postFiltercat)
//user_route.post('/wallet-order',userController.postWallet)

// wallet
user_route.get('/wallet',walletController.getWallet)
user_route.post('/wallet',walletController.postWallet)
// coupon update
//user_route.post('/couponUpdate',(req,res)=>{res.send("hiii")})
user_route.post('/couponUpdate',userController.postCouponUpdate)
user_route.get('/404',userController.geterror)
//user_route.get("/change-password",userController.getchangep)
//user_route.post("/change-password",userController.postchangep)

module.exports=user_route;