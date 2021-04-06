import { requireAuth } from '@simbatique/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/', requireAuth, async (req: Request, res: Response) => {
  //also get the tickets that are related!
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    'ticket'
  );

  res.send(orders);
});

export { router as indexOrdersRouter };
