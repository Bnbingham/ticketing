import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus, Subjects } from '@bnbtickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payments';

describe('new payment route', () => {
  it('has a route handler listening to /api/payments for post requests', async () => {
    const response = await request(app).post('/api/payments').send({});

    expect(response.status).not.toEqual(404);
  });

  it('can only be accessed if the user is signed in', async () => {
    await request(app).post('/api/payments').send({}).expect(401);
  });

  it('returns a status other than 401 if the user is signed in', async () => {
    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', global.getAuthCookie())
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it('returns an error if the order does not exist', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .post('/api/payments')
      .set('Cookie', global.getAuthCookie())
      .send({ orderId, token: 'tok_visa' })
      .expect(404);
  });

  it('returns a 400 if order is cancelled', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.getAuthCookie(userId);

    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Cancelled,
      userId,
      price: 10,
    });
    await order.save();
    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({ orderId: order.id, token: 'tok_visa' })
      .expect(400);
  });

  it('returns an error if the order does not belong to the user', async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId: 'asdf',
      price: 10,
    });
    await order.save();
    await request(app)
      .post('/api/payments')
      .set('Cookie', global.getAuthCookie())
      .send({ orderId: order.id, token: 'tok_visa' })
      .expect(401);
  });

  it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.getAuthCookie(userId);

    const token = 'tok_visa';
    const price = Math.floor(Math.random() * 10000);

    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId,
      price: price,
    });
    await order.save();
    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({ orderId: order.id, token })
      .expect(201);

    // if using the actual stripe api to test
    // const stripeCharges = await stripe.charges.list({
    //   limit: 10,
    // });
    // const stripeCharge = stripeCharges.data.find((charge) => {
    //   return charge.amount === price * 100;
    // });
    // expect(stripeCharge).not.toBeUndefined();
    // expect(stripeCharge?.currency).toEqual('usd');

    expect(stripe.charges.create).toHaveBeenCalled();
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual(token);
    expect(chargeOptions.amount).toEqual(price * 100);
    expect(chargeOptions.currency).toEqual('usd');

    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: chargeOptions.id,
    });
    expect(payment).not.toBeNull();
  });

  it('publishes an event', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.getAuthCookie(userId);

    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId,
      price: 10,
    });
    await order.save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({ orderId: order.id, token: 'tok_visa' })
      .expect(201);

    const payment = await Payment.findOne({
      orderId: order.id,
    });

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(payment?.id);
    expect(eventData.orderId).toEqual(order.id);
    expect(eventData.stripeId).toEqual(payment?.stripeId);
  });
});
