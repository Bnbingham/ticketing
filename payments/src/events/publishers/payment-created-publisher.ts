import { PaymentCreatedEvent, Publisher, Subjects } from '@bnbtickets/common';

class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}

export { PaymentCreatedPublisher };
