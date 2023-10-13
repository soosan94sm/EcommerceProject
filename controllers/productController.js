const { log } = require('console');
const Products = require('../models/productModel')
const fs = require('fs');
const Category = require('../models/categoryModel');

module.exports.getProductList=async(req,res)=>{
    
    try{

        const pdt =await Products.find({})
       console.log(pdt);
        if(pdt){
            res.render('productList',{products:pdt})
        }
    }catch(err){
        console.error(err);
    }
}
module.exports.getAddProduct = async (req, res) => {
    try{const cat=await Category.find({})
    //console.log(cat)
    res.render('addProduct',{category:cat});}
    catch(err){
console.log("getAddProduct",err.message)
    }
};

module.exports.postAddProduct = async (req, res) => {
    try {

        const existing = await Products.findOne({ productName: req.body.productName });
        console.log(req.body,"--->body");
        console.log(req.files,"--->images");
        if (existing) {
            res.render('addProduct', { message: "Product already exists" });
        } else {
            const arrImages = [];
            for (let i = 0; i < req.files.length; i++) {
                arrImages[i] = req.files[i].filename;
            }console.log(req.body.category)
            const product = await Products.insertMany([{
                
                productName: req.body.productName,
                price: req.body.price,
                stock: req.body.stock,
                description: req.body.description,
                // discount: req.body.discount,
                category: req.body.category,
                images: arrImages
            }]);
           
            return res.redirect('/admin/products');
        }
    } catch (err) {
        console.error(err.message);
    }
};

module.exports.getEditProduct=async(req,res)=>{
  try{
    const id = req.query.id
    const product=await Products.findOne({_id:id})
    // console.log((product._id).toString());
    let pdtid=product.category.toString()
    let cat=await Category.findOne({_id:product.category},{categoryName:1})
    //  console.log("pdt",pdtid);
   
    const categories = await Category.find({isList:true});
    //   console.log(cat.categoryName);
    res.render('editProduct',{product:product,categoryName:cat.categoryName,pdtid,categories:categories})
   }catch(err){
    console.error("getEditProduct",err.message);
   }
}

const deleteImages = (images) => {
    images.forEach((image) => {
      const imagePath = path.join(__dirname, 'public', 'images', image);
  
      // Use fs.unlink to delete the file from the server
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Error deleting image: ${err}`);
        } else {
          console.log(`Image ${image} deleted successfully.`);
        }
      });
    });
  };
module.exports.postEditProduct=async(req,res)=>{
    // const deleteImages = req.body.deleteImage;
    // console.log(deleteImages);
    try{
        
        const pdtId=req.body.productIdentity
     console.log(pdtId);
    // const arrImages = [];
    // for (let i = 0; i < req.files.length; i++) {
    //     arrImages[i] = req.files[i].filename;
    // }
    const product =await Products.findOneAndUpdate({_id:pdtId},{
        productId: req.body.productId,
        productName: req.body.productName,
        price: req.body.price,
        stock: req.body.stock,
        description: req.body.description,
        discount: req.body.discount,
        category: req.body.category,
        // images: arrImages
    })
    res.redirect('/admin/products')
    }catch(err){
        console.error(err);
    }
}
// module.exports.getProductDelete = async (req, res) => {
//     try {
//       const id = req.query.id;
      
//       // Check if the category should be deleted based on client-side confirmation
//       const shouldDelete = req.query.confirm === 'true'; // Check the query parameter
  
//       if (shouldDelete) {
//         // Perform the deletion only if confirmed
//         await Products.updateOne({ _id: id }, { $set: { isList: false } });
//       }
      
//       res.redirect('/admin/products');
//     } catch (err) {
//       console.error(err);
//       // Handle errors appropriately (e.g., send an error response or render an error page)
//       res.status(500).send('Internal Server Error');
//     }
//   };
  
  module.exports.getisList= async (req, res) => {
    try {
       const userId = req.query.id;
       console.log(userId);
       const user = await Products.findOneAndUpdate({ _id: userId }, { isList: false });
        res.redirect('/admin/products')
       
     }catch (e) {
        console.error(e);
     }
 }
module.exports.getUnList= async (req, res) => {
    try {
       const userId = req.query.id;
       console.log(userId);
       const user = await Products.findOneAndUpdate({ _id: userId }, { isList: true });
        res.redirect('/admin/products')
    } catch (e) {
       console.error(e);
    }
 }

 module.exports.postSearch = async(req,res)=>{
    const searchQuery = new RegExp("^" + req.body.search, "i"); 
    // Adding "i" flag for case-insensitive search

    Products.find({ productName: { $regex: searchQuery } }).then((pro) => {
      if (pro.length === 0) {
        res.render('productList',{products:[]})
      } else {
        res.render('productList',{products:pro})
      }
    });
  
}