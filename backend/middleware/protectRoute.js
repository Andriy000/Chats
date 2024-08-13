import jwt from "jsonwebtoken";
import { ERROR } from '../constants/constant.js';
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    // Extract the token from the request cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: ERROR.UNAUTHORIZED });
    }

    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract the user ID from the decoded token
    const userId = decoded.userId;

    // Find the user by ID in the database, excluding the password field
    const user = await User.findById(userId).select("-password");

    // If no user is found, return a user not found error
    if (!user) {
      return res.status(404).json({ error: ERROR.USER_NOT_FOUND });
    }

    // Attach the user object to the request object
    req.user = user;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    // Log the error and send an internal server error response
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};

export default protectRoute;

