import { Publisher, Subjects, TicketUpdatedEvent } from '@bnbtickets/common';

class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}

export { TicketUpdatedPublisher };
