import mongoose from 'mongoose';
import { TicketDoc } from './ticket';
import { OrderStatus } from '@bnbtickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created,
  },
  expiresAt: {
    type: Date,
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  },
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return {
    id: obj._id,
    userId: obj.userId,
    status: obj.status,
    expiresAt: obj.expiresAt,
    version: obj.version,
    ticket: {
      id: obj.ticket._id,
      price: obj.ticket.price,
      title: obj.ticket.title,
    },
  };
};

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
