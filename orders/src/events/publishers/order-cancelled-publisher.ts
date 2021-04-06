import { OrderCancelledEvent, Publisher, Subjects } from '@simbatique/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
