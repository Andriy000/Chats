import mongoose from "mongoose";
import dotenv from "dotenv"; 

dotenv.config();
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Successfully connected to the database");
  } catch (error) {
    console.error('Couldnt connect to db', error.message);
  }
};

export default connectToMongoDB;