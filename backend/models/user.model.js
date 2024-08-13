import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 5,
    maxlength: 12
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  age: {
   type: Number,
   required: true,
   trim: true,
  },
  password: {
    type: String,
    required: false,
    trim: true,
    unique: true,
    minlength: 5,
  },
 gender: { 
  type : String,
  required: false,
  enum : ["male", "female"]
  }, 
 avatar: {
  type: String,
  default: ""
 }
},{ timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
