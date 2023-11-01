const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: String,
    details: String,
    price: String,
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    productPic : String
})

module.exports = mongoose.model("product", productSchema);