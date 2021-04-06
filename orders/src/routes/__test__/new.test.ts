import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('Returns an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();
  const cookie = global.getCookie();

  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId })
    .expect(404);
});

it('Returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    title: 'tetten',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'blabla',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  const cookie = global.getCookie();

  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticket: ticket.id })
    .expect(400);
});

it('creates an order and reserves a ticket', async () => {
  const ticket = Ticket.build({
    title: 'tetten',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const cookie = global.getCookie();

  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    title: 'tetten',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const cookie = global.getCookie();

  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
