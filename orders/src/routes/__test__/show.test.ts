import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';

it('fetches the correct order', async () => {
  const ticket = Ticket.build({
    title: 'tetten',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns a 401 if a user tries to fetch another users order', async () => {
  const ticket = Ticket.build({
    title: 'tetten',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(401);
});
