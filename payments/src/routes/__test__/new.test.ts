import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

// jest.mock('../../stripe.ts');

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({
      token: 'aahahahahahah',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 20,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({
      token: 'aahahahahahah',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: userId,
    status: OrderStatus.Cancelled,
    price: 20,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(userId))
    .send({
      token: 'aahahahahahah',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 204 and creates a charge with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: userId,
    status: OrderStatus.Created,
    price,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  // only when working with mocks:
  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(chargeOptions.source).toEqual('tok_visa');
  // expect(chargeOptions.currency).toEqual('eur');
  // expect(chargeOptions.amount).toEqual(order.price * 100);

  // when working with the actual stripe API for testing:

  const charges = await stripe.charges.list({ limit: 50 });
  const stripecharge = charges.data.find((charge) => {
    return charge.amount === price * 100;
  });
  expect(stripecharge).toBeDefined();
  expect(stripecharge!.currency).toEqual('eur');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripecharge!.id,
  });

  expect(payment).not.toBeNull();
});
