import { Subjects } from '@bnbtickets/common';
import { TicketCreatedEvent } from '@bnbtickets/common';
import { Listener } from '@bnbtickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message): Promise<void> {
    try {
      // Validate input data
      if (!data.id || !data.title || data.price < 0) {
        throw new Error('Invalid ticket data');
      }

      // Check if ticket already exists
      const existingTicket = await Ticket.findById(data.id);
      if (existingTicket) {
        return msg.ack(); // Acknowledge but don't create duplicate
      }

      // Create and save the ticket
      const { id, title, price } = data;
      const ticket = Ticket.build({ id, title, price });
      await ticket.save();

      // Acknowledge the message after successful processing
      msg.ack();
    } catch (err) {
      // Log the error but don't acknowledge the message
      // This will allow NATS to redeliver the message
      console.error('Error processing ticket created event:', err);
      throw err;
    }
  }
}

export { TicketCreatedListener };
