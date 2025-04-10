import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { PaymentCreatedListener } from '../payment-created-listener';
import { OrderStatus, PaymentCreatedEvent } from '@bnbtickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new PaymentCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'userId',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: PaymentCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    orderId: order.id,
    stripeId: 'stripeId',
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order, ticket };
};

describe('PaymentCreatedListener', () => {
  it('should update the order status to complete', async () => {
    const { listener, data, msg, order, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
    expect(updatedOrder!.id).toEqual(order.id);
    expect(msg.ack).toHaveBeenCalled();
  });

  it('should publish an order updated event', async () => {
    const { listener, data, msg, order, ticket } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
    expect(eventData.status).toEqual(OrderStatus.Complete);
    console.log('eventData', eventData);

    expect(msg.ack).toHaveBeenCalled();
  });
});
