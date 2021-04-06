import { OrderCreatedEvent, Publisher, Subjects } from '@simbatique/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
