import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import { TicketCreatedEvent } from '@bnbtickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);

  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'concert',
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe('TicketCreatedListener', () => {
  it('should create a ticket with correct data', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
    expect(ticket!.id).toEqual(data.id);
  });

  it('acks the message after successful processing', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('should not create duplicate tickets with same id', async () => {
    const { listener, data, msg } = await setup();

    // First creation
    await listener.onMessage(data, msg);

    // Try to create again
    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
  });

  it('should handle invalid ticket data gracefully', async () => {
    const { listener, msg } = await setup();
    const invalidData = {
      id: 'invalid-id',
      version: 0,
      title: '',
      price: -10,
      userId: 'asdf',
    };

    await expect(listener.onMessage(invalidData, msg)).rejects.toThrow();
    expect(msg.ack).not.toHaveBeenCalled();
  });

  it('should not ack the message if ticket creation fails', async () => {
    const { listener, data, msg } = await setup();

    // Mock a failure in ticket creation
    jest.spyOn(Ticket, 'build').mockImplementationOnce(() => {
      throw new Error('Failed to create ticket');
    });

    await expect(listener.onMessage(data, msg)).rejects.toThrow();
    expect(msg.ack).not.toHaveBeenCalled();
  });
});
