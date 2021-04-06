import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('changes the status of the order to cancelled', async () => {
  const ticket = Ticket.build({
    title: 'tetten',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString()
  });

  await ticket.save();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const fetched = await Order.findById(order.id);
  expect(fetched!.status).toEqual(OrderStatus.Cancelled);
});

it('returns a 401 if a user tries to delete another users order', async () => {
  const ticket = Ticket.build({
    title: 'tetten',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString()
  });

  await ticket.save();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(401);
});

it('emits an order deleted event', async () => {
  const ticket = Ticket.build({
    title: 'tetten',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString()
  });

  await ticket.save();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
