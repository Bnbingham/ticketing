import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  return ticket;
};

it('has a route handler listening to /api/orders for get requests', async () => {
  const response = await request(app).get('/api/orders').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).get('/api/orders').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', global.getAuthCookie())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('fetches orders for a particular user', async () => {
  const userTicket1 = await buildTicket();
  const userTicket2 = await buildTicket();
  const userTicket3 = await buildTicket();

  const userOne = global.getAuthCookie();
  const userTwo = global.getAuthCookie();

  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: userTicket1.id })
    .expect(201);

  // Create two orders as User #2
  const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: userTicket2.id })
    .expect(201);

  const { body: order3 } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: userTicket3.id })
    .expect(201);

  // Get orders for User #2
  const response = await request(app).get('/api/orders').set('Cookie', userTwo).expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order2.id);
  expect(response.body[1].id).toEqual(order3.id);
  expect(response.body[0].ticket.id).toEqual(userTicket2.id);
  expect(response.body[1].ticket.id).toEqual(userTicket3.id);
});
