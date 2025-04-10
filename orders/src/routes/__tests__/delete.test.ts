import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';
import { OrderStatus } from '@bnbtickets/common';
import { Order } from '../../models/order';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  return ticket;
};

it('has a route handler listening to /api/orders/:orderId for delete requests', async () => {
  const response = await request(app).delete('/api/orders/:orderId').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  await request(app).delete(`/api/orders/${orderId}`).send({}).expect(401);
});

it('returns a 401 if the user is not the owner of the order', async () => {
  const ticket = await buildTicket();
  const userOne = global.getAuthCookie();
  const userTwo = global.getAuthCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app).delete(`/api/orders/${order.id}`).set('Cookie', userTwo).send().expect(401);
});

it('returns a 404 if the order is not found', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', global.getAuthCookie())
    .send()
    .expect(404);
});

it('cancels the order', async () => {
  const ticket = await buildTicket();
  const user = global.getAuthCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  const ticket = await buildTicket();
  const user = global.getAuthCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
