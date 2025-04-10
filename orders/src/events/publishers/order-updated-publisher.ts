import { Publisher, OrderUpdatedEvent, Subjects } from '@bnbtickets/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderUpdated;
}
