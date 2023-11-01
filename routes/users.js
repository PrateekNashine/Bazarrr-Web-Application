const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://localhost/bazarrr");

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  phoneNo : String,
  expireAt: Date,
  otp: String,
  admin: Boolean,
  products:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "product"
  }],
  cart:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "product"
  }],
  orders:[{
    type: mongoose.Schema.Types.ObjectId,
    reff: "product"
  }]
})

userSchema.plugin(plm);

module.exports = mongoose.model("users", userSchema);