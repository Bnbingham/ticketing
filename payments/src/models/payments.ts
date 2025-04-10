import mongoose from 'mongoose';

interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    require: true,
  },
  stripeId: {
    type: String,
    require: true,
  },
});

paymentSchema.methods.toJSON = function () {
  const obj = this.toObject();

  const { __v, _id, ...rest } = obj;
  return {
    id: _id,
    ...rest,
  };
};

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };
