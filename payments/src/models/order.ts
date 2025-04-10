import mongoose from 'mongoose';
import { OrderStatus } from '@bnbtickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  status: OrderStatus;
  price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  price: number;
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
  },
  price: {
    type: Number,
    require: true,
  },
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.methods.toJSON = function () {
  const obj = this.toObject();

  const { __v, _id, ...rest } = obj;
  return {
    id: _id,
    ...rest,
  };
};

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    userId: attrs.userId,
    status: attrs.status,
    price: attrs.price,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
