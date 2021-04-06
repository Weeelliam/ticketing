import { TicketCreatedEvent } from '@simbatique/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'tetten',
    price: 69,
    userId: 'me',
  };
  // create a fake message object (but don't implement everything for it..)
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  // call the onMessage function with both objects
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  // write assertions
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  // call the onMessage function with both objects
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  // write assertions

  expect(msg.ack).toHaveBeenCalled();
});
