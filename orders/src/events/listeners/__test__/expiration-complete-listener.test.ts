import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { ExpirationCompleteEvent, OrderStatus } from '@bnbtickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Create and save an order
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });
  await ticket.save();
  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'asdf',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

describe('ExpirationCompleteListener', () => {
  it('should update the order status to cancelled', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
  });

  it('should publish an order cancelled event', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const orderCancelledData = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(orderCancelledData.id).toEqual(order.id);
  });

  it('should not publish an order cancelled event if the order is already complete', async () => {
    const { listener, data, msg, order } = await setup();

    order.status = OrderStatus.Complete;
    await order.save();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).not.toHaveBeenCalled();
  });

  it('acks the message after successful processing', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('should handle invalid order data gracefully', async () => {
    const { listener, msg } = await setup();
    const invalidData = {
      orderId: new mongoose.Types.ObjectId().toHexString(),
    };

    await expect(listener.onMessage(invalidData, msg)).rejects.toThrow();
    expect(msg.ack).not.toHaveBeenCalled();
  });
});
