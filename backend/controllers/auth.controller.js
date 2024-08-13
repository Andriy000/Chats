import { ERROR, AUTHORIZATION } from "../constants/constant.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { username, email, age, password, confirmPassword, gender } = req.body;

    if (!username || !age  || !email || !confirmPassword || !gender) {
      return res.status(400).json({ error: ERROR.MISSING_FIELDS });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: ERROR.PASSWORD_ERROR });
    }
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: ERROR.USER_ERROR });
    }

    // Hash password
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
   
   const existingPassword = await User.findOne({ password: hashedPassword });
   if (existingPassword) {
     return res.status(400).json({ error: ERROR.PASSWORD_ALREADY_USED });
   }
    const boyAvatar = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlAvatar = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      username,
      email,
      age,
      password: hashedPassword,
      gender,
      avatar: gender === "male" ? boyAvatar : girlAvatar
    });

    if(newUser) {
      // Generate JWT for User
      await newUser.save();
      generateTokenAndSetCookie(newUser._id, res)
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        age: newUser.age,
        gender: newUser.gender,
        avatar: newUser.avatar
      });
    } else{
      res.status(400).json({error: ERROR.INVALID_DATA});
    }
  } catch (error) {
    console.error("Error in controller sign up", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};

export const login = async (req, res) => {
  try {


    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: ERROR.MISSING_FIELDS });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: ERROR.USER_NOT_FOUND });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password || "");
    if (!isPasswordCorrect || !user) {
      return res.status(400).json({ error: ERROR.INVALID_CREDENTIALS });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({message: `logged in succesfully ${user.username}`});
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};

export const logout = (req, res) => {
  try {
   res.cookie(AUTHORIZATION.AUTH_TOKEN_COOKIE_NAME, "", {maxAge:0} )
   res.status(200).json({message:"Logged out succesfully"})
  } catch (error) {
   console.log("Error in logout controller", error.message);
     res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
}
