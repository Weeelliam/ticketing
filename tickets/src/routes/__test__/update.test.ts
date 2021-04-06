import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

const createTicket = (
  cookie: string[] = global.getCookie(),
  title: string = 'titties',
  price: number = 20
) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);
};

it('returns a 404 if the provided id is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.getCookie())
    .send({ title: 'bla', price: 20 })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const response = await createTicket();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.getCookie())
    .send({ title: 'bla', price: 20 })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await createTicket();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.getCookie())
    .send({ title: 'bla', price: 20 })
    .expect(401);
});

it('returns a 400 if the user provides invalid parameters', async () => {
  const cookie = global.getCookie();
  const response = await createTicket(cookie);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'bla', price: -20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ price: 20 })
    .expect(400);
});

it('updates the ticket if all is well', async () => {
  const cookie = global.getCookie();
  const response = await createTicket(cookie);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'afteredit', price: 100 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('afteredit');
  expect(ticketResponse.body.price).toEqual(100);
});

it('publishes an event on update', async () => {
  const cookie = global.getCookie();
  const response = await createTicket(cookie);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'afteredit', price: 100 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.getCookie();
  const response = await createTicket(cookie);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'bla', price: 20 })
    .expect(400);
});
