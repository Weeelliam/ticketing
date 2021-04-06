import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { HighlightSpanKind } from 'typescript';

declare global {
  namespace NodeJS {
    interface Global {
      getCookie(id?: string): string[];
    }
  }
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
  'sk_test_51IctpkG7FtZ1oNOPLDozHh9b5IDiMaZI0sh1J4gvPusQhM12qYWZ5EwczVlIjqvdROGfEoMeMd8g5x4PydoyReIx00SPUXgDsT';

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

global.getCookie = (id?: string) => {
  // build a JWT payload { id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
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
