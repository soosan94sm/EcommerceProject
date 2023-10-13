const express = require('express')
const productController = require('../controllers/productController')
const product_route = express()
const multer = require('multer')
const path = require('path')
const auth = require('../middleware/adminMiddleware')


product_route.set("view engine", "ejs")
product_route.set("views", "./views/admin")
product_route.use(express.urlencoded({ extended: true }))
product_route.use(express.static("public"))




const storage = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null,path.join(__dirname,'../public/admin/assets/uploads'),function (err,success) {
            if(err) throw err
          })
      },
      filename:function (req,file,cb) {
        const name = file.originalname
        cb(null,name,function (err,success) {
            if(err) throw err
          })
        }
})
const upload = multer({storage:storage})



product_route.get('/',auth.isLogged,productController.getProductList)
// add product
product_route.get('/addProduct',productController.getAddProduct)

product_route.post('/addProduct',upload.array('images'),productController.postAddProduct)

// edit product
product_route.get('/edit',productController.getEditProduct)

product_route.post('/edit',upload.array('images'),productController.postEditProduct)

// delete product
//product_route.get('/delete',productController.getProductDelete)
product_route.get("/isList", productController.getisList);

product_route.get("/unList",productController.getUnList);
product_route.post('/search',productController.postSearch)
 



module.exports= product_route