import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledEvent } from '@simbatique/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  //create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = mongoose.Types.ObjectId().toHexString();

  //create and save a ticket
  const ticket = Ticket.build({ title: 'tetten', price: 9, userId: 'bla' });
  ticket.set({ orderId });
  await ticket.save();

  //Create a fake data event!
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg, orderId };
};

it('removes the order id on the ticket correctly', async () => {
  const { listener, ticket, data, msg, orderId } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdateData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(ticketUpdateData.orderId).toBeUndefined();
});
