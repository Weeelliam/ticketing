import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      getCookie(): string[];
    }
  }
}

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'puree';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.getCookie = () => {
  // build a JWT payload { id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'hap@hip.hop',
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build a session object {jwt: myjwt}
  const session = { jwt: token };

  // turn the session object into json
  const sessionJSON = JSON.stringify(session);
  // encode the json to base64
  const base64 = Buffer.from(sessionJSON).toString('base64');
  // return a string that's the cookie "express:sess=" + base64
  return [`express:sess=${base64}`];
};
