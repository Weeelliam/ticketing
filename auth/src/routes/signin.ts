import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@simbatique/common';

import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email should be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existinguser = await User.findOne({ email });
    if (!existinguser) {
      throw new BadRequestError('Invalid Credentials');
    }
    //compare password
    const passwordsMatch = await Password.compare(
      existinguser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError('password doesnt match!');
    }
    const userJWT = jwt.sign(
      {
        id: existinguser.id,
        email: existinguser.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJWT,
    };
    return res.status(200).send(existinguser);
  }
);

export { router as signinRouter };
