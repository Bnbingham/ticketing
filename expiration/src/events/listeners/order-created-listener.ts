import { Subjects } from '@bnbtickets/common';
import { OrderCreatedEvent } from '@bnbtickets/common';
import { Listener } from '@bnbtickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
    try {
      // Validate input data
      if (!data.id || !data.ticket.id) {
        throw new Error('Invalid order data');
      }

      // Set a delay to expire the job
      const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
      await expirationQueue.add({ orderId: data.id }, { delay });
      console.log('Waiting this many milliseconds to process the job:', delay);

      // Acknowledge the message after successful processing
      msg.ack();
    } catch (err) {
      // Log the error but don't acknowledge the message
      // This will allow NATS to redeliver the message
      console.error('Error processing order created event:', err);
      throw err;
    }
  }
}

export { OrderCreatedListener };
