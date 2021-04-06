import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('Can only be accessed when a user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
  // expect(response.status).toEqual(401);
});

it('Returns a valid status, not 401, when a user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error on invalid title', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title: '', price: 10 })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ price: 10 })
    .expect(400);
});

it('it returns an error on invalid price', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title: 'tittle', price: -10 })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title: 'titttts' })
    .expect(400);
});

it('Creates a ticket on valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title: 'tittie', price: 10 })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
});

it('publishes an event', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title: 'tittie', price: 10 })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
