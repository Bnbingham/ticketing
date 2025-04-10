import { Listener, OrderCreatedEvent, Subjects } from '@bnbtickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
    try {
      // Validate input data
      if (!data.id || !data.ticket.id) {
        throw new Error('Invalid order data');
      }

      // Find the ticket that the order is reserving
      const ticket = await Ticket.findById(data.ticket.id);

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Mark the ticket as being reserved by setting its orderId property
      ticket.set({ orderId: data.id });

      // Save the ticket
      await ticket.save();

      // Publish an event saying that a ticket was updated
      await new TicketUpdatedPublisher(this.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
        orderId: ticket.orderId,
      });

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
