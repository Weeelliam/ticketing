import { Subjects, Listener, OrderCancelledEvent } from '@simbatique/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // get the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);
    // if no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket was not found!');
    }

    // Mark the ticket as not reserved by removing its orderId property
    ticket.set({ orderId: undefined });
    // save it
    await ticket.save();

    //don't forget to publish an event that the ticket was updated
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });
    // ack the message
    msg.ack();
  }
}
