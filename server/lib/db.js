import mongoose from "mongoose";

// function to connect to the mongodb database

export const connectDB = async () => {
  console.log(process.env.MONGODB_URL);
  try {
    mongoose.connection.on("connected", () =>
      console.log("database connected"),
    );
    await mongoose.connect(`${process.env.MONGODB_URL}/samvad`);
  } catch (error) {
    console.log(error);
  }
};
