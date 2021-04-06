import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from '@simbatique/common';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId Must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // find the ticket the user is trying to order in the ticket db
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // make sure the ticket is not yet reserved
    // run a query for all orders where ticket = this ticket and status != cancelled
    // if it exists, bummer
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Too Bad! Ticket is already reserved!');
    }

    // calculate expiration date (15 minutes)
    const expirationDate = new Date();
    expirationDate.setSeconds(
      expirationDate.getSeconds() + EXPIRATION_WINDOW_SECONDS
    );

    // build the actual order and save it to the db
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expirationDate,
      ticket,
    });

    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id : ticket.id,
        price: ticket.price
      }
    })

    res.status(201).send(order);
  }
);

export { router as newOrdersRouter };
