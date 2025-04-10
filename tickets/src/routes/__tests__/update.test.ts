import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';
import { Subjects } from '@bnbtickets/common';

describe('Update Ticket', () => {
  it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({ title: 'new title', price: 100 })
      .expect(401);
  });

  it('returns a 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.getAuthCookie())
      .send({ title: 'new title', price: 100 })
      .expect(404);
  });

  it('returns a 400 if the user does not own the ticket', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.getAuthCookie())
      .send({ title: 'new title', price: 100 })
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.getAuthCookie())
      .send({ title: 'new title', price: 100 })
      .expect(401);
  });

  it('returns a 400 if the user does not provide valid title or price', async () => {
    const cookie = global.getAuthCookie();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'new title', price: 100 })
      .expect(201);

    //invalid title
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: '', price: 100 })
      .expect(400);

    //missing title
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ price: 100 })
      .expect(400);

    //invalid price
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'valid title', price: -10 })
      .expect(400);

    //missing price
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'valid title' })
      .expect(400);

    //invalid title and price
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: '', price: -10 })
      .expect(400);

    //missing title and price
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({})
      .expect(400);
  });

  it('updates the ticket provided valid inputs', async () => {
    const cookie = global.getAuthCookie();

    const originalTitle = 'new title';
    const originalPrice = 100;
    const updatedTitle = 'updated title';
    const updatedPrice = 200;

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: originalTitle, price: originalPrice })
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: updatedTitle, price: updatedPrice })
      .expect(200);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(ticketResponse.body.title).toEqual(updatedTitle);
    expect(ticketResponse.body.price).toEqual(updatedPrice);
  });

  it('publishes a ticket updated event', async () => {
    const cookie = global.getAuthCookie();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'new title', price: 100 })
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'updated title', price: 200 })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.getAuthCookie();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'new title', price: 100 })
      .expect(201);

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'updated title', price: 200 })
      .expect(400);

    expect(natsWrapper.client.publish).not.toHaveBeenCalledWith(
      Subjects.TicketUpdated,
      expect.any(String)
    );
  });
});
