import { Publisher, Subjects, TicketUpdatedEvent } from '@simbatique/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
