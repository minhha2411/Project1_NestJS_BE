import mongoose from 'mongoose';
const { Schema } = mongoose;

export const UserSchema = new Schema({
  email: String,
  password: String,
  refreshToken: String,
});

export interface User extends Document {
  email: string;
  password: string;
  refreshToken: string;
}

export const User = mongoose.model('User', UserSchema);
