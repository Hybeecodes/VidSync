'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
      username: {
        type: String,
        unique: true,
        trim: true,
        required: true
      },
      email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      activation_token: {
        type: String,
        default: null
      },
      reset_token: {
        type: String,
        default: null
      }
    },
    {
      timestamps: true
    }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePass = function comparePass (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.toJson = function toJson() {
    return {
        id: this._id,
        email: this.email,
        username: this.username
    }
}

module.exports = mongoose.model('User', UserSchema);
