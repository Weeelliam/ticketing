import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from '@simbatique/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const { orderId } = data;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found!');
    }

    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    // todo: send an order update event

    msg.ack();
  }
}
