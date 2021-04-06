import { ExpirationCompleteEvent, OrderStatus } from '@simbatique/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';

const setup = async () => {
  // create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'tetten',
    price: 69
  })
  await ticket.save()

  const order = Order.build({
    userId: 'bla',
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket
  })
  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }
  //@ts-ignore
  const msg: Message = { ack: jest.fn()}

  return {listener, ticket, data, order, msg}

};

it('updates the orderstatus to cancelled', async () => {
  const {listener, data, order, msg} = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  const {listener, data, order, msg} = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect (eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const {listener,  data,  msg} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});


