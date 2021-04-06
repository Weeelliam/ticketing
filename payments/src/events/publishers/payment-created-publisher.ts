import { PaymentCreatedEvent, Publisher, Subjects } from '@simbatique/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
