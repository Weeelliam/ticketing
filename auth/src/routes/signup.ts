import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@simbatique/common';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existinguser = await User.findOne({ email });
    if (existinguser) {
      throw new BadRequestError('A user with this email already exists!');
    }

    const user = User.build({ email, password });
    await user.save();

    //generate jwt and store it on the session,
    //the jwt key is stored in the environment variable via k8s

    const userJWT = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJWT,
    };

    return res.status(201).send(user);
  }
);

export { router as signupRouter };
