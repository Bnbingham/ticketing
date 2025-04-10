import { ExpirationCompleteEvent, OrderStatus, Subjects } from '@bnbtickets/common';
import { Listener } from '@bnbtickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message): Promise<void> {
    try {
      if (!data.orderId) {
        throw new Error('Invalid order data');
      }

      const order = await Order.findById(data.orderId).populate('ticket');
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === OrderStatus.Complete) {
        return msg.ack();
      }

      order.set({
        status: OrderStatus.Cancelled,
      });
      await order.save();

      await new OrderCancelledPublisher(this.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
          id: order.ticket.id,
        },
      });

      msg.ack();
    } catch (err) {
      console.error('Error processing expiration complete event:', err);
      throw err;
    }
  }
}

export { ExpirationCompleteListener };
