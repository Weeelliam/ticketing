import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const createTicket = (title: string = 'titties', price: number = 20) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title, price })
    .expect(201);
};

it('Can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get(`/api/tickets/`).send().expect(200);

  expect(response.body.length).toEqual(3);
});
