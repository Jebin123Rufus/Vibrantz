import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['register', 'forgot_password'], required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 minutes expiry
});

export default mongoose.model('OTP', otpSchema);
