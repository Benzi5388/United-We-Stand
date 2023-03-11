const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  users: {
    type: Number,
    required: true
  }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;