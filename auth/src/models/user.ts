import mongoose from 'mongoose';
import { PasswordManager } from '../services/password-manager';

interface UserAttrs {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return {
    id: obj._id,
    email: obj.email,
  };
};

userSchema.pre('save', async function (done) {
  if (this.isModified('password') && this.get('password')) {
    const hashed = await PasswordManager.toHash(this.get('password')!);
    this.set('password', hashed);
  }
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
