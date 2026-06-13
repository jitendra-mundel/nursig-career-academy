import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
