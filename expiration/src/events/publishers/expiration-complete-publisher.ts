import { ExpirationCompleteEvent, Publisher, Subjects } from '@simbatique/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
