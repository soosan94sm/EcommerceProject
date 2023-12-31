const mongoose = require('mongoose')
const db = require('../config/db')
const orderSchema = new mongoose.Schema({
    orderId : {
        type : String,
        required : true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
        
    },
    orderItem : {
        type : [
            {
                product_id: mongoose.Schema.Types.ObjectId,
                quantity: Number,
                orderStatus : {
                    type : String,
                    default : "pending"},
                orderConfirm:{
                        type:Boolean,
                        default:false
                    },
                orderCancelReason:{
                        type:String
                    },
                orderReturnRequest: {
                        type: Boolean,
                        default: false
                    },
                    orderCancleRequest:{
                        type:Boolean,
                        default:false
                    },
                    orderReturnReason:{
                        type:String
                    }

                
            }
        ],
        //required : true
    },
    
    totalAmount : {
        type : Number,
    },
    purchaseDate : {
        type : Date,
        default : new Date()
    },
    deliveryDate : {
        type : Date,
        default : null
    },
    paymentMethod :{
        type : String,
    },
    address:{
        type:String,
    }
})

const Order = db.model("Order",orderSchema);

module.exports = Order;