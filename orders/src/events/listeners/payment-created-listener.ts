import { OrderStatus, PaymentCreatedEvent, Subjects } from '@bnbtickets/common';
import { Listener } from '@bnbtickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderUpdatedPublisher } from '../publishers/order-updated-publisher';
import { natsWrapper } from '../../nats-wrapper';

class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
    try {
      if (!data.id || !data.orderId || !data.stripeId) {
        throw new Error('Invalid payment data');
      }

      const order = await Order.findById(data.orderId).populate('ticket');
      if (!order) {
        throw new Error('Order not found');
      }

      order.set({ status: OrderStatus.Complete });
      await order.save();

      new OrderUpdatedPublisher(this.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
          id: order.ticket.id,
          price: order.ticket.price,
        },
      });

      msg.ack();
    } catch (err) {
      console.error('Error processing payment created event:', err);
      throw err;
    }
  }
}

export { PaymentCreatedListener };
