import mongoose from 'mongoose';
// import config from 'config';

const connectDB = async () => {
  try {
    // const url = config.get('mongoURI');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;

// const mongoose = require('mongoose');
// const config = require('config');
// const db = config.get('mongoURI');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(db, {
//       useNewUrlParser: true,
//       // useCreateIndex: true,
//     });

//     console.log('MongoDB Connected...');
//   } catch (err) {
//     console.error(err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
