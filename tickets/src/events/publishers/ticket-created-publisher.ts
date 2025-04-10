import { Publisher, Subjects, TicketCreatedEvent } from '@bnbtickets/common';

class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

export { TicketCreatedPublisher };
