import { TicketUpdatedEvent } from '@simbatique/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create a ticket
  const ticket = Ticket.build({
    title: 'tettas',
    price: 69,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'titties',
    price: 6969,
    userId: 'me',
  };

  // create a fake message object (but don't implement everything for it..)
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};

it('finds, updates and saves a ticket', async () => {
  // call the onMessage function with both objects
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  // write assertions
  const fetched = await Ticket.findById(ticket.id);

  expect(fetched).toBeDefined();
  expect(fetched!.title).toEqual(data.title);
  expect(fetched!.price).toEqual(data.price);
  expect(fetched!.version).toEqual(data.version);
});

it('acks the message', async () => {
  // call the onMessage function with both objects
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  // write assertions
  expect(msg.ack).toHaveBeenCalled();
});

it('does not ack the message when the event has a skipped version', async () => {
  // call the onMessage function with both objects
  const { listener, data, msg } = await setup();
  data.version = 10;

  // write assertions
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
