import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  console.log('starting up auth ..');
  if (!process.env.JWT_KEY) {
    throw new Error('JWT key is not defined!');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO URI key is not defined!');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('connected to mongodb');
  } catch (err) {
    console.log(err);
  }
  app.listen(3000, () => {
    console.log('Listening for auth on 3000!');
  });
};

start();
