const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const walletSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEthereumAddress(value)) {
          throw new Error('Invalid Ethereum address');
        }
      },
    },
    initImplementation: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEthereumAddress(value)) {
          throw new Error('Invalid Ethereum address');
        }
      },
    },
    initEntryPoint: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEthereumAddress(value)) {
          throw new Error('Invalid Ethereum address');
        }
      },
    },
    initOwner: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEthereumAddress(value)) {
          throw new Error('Invalid Ethereum address');
        }
      },
    },
    initGuardians: [
      {
        type: String,
        required: true,
        trim: true,
        validate(value) {
          if (!validator.isEthereumAddress(value)) {
            throw new Error('Invalid Ethereum address');
          }
        },
      },
    ],
    encryptedSigner: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isBase64(value)) {
          throw new Error('Invalid encrypted signer');
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
walletSchema.plugin(toJSON);
walletSchema.plugin(paginate);

/**
 * Check if user already has a wallet
 * @param {ObjectId} userId
 * @returns {Promise<boolean>}
 */
walletSchema.statics.alreadyCreated = async function (user) {
  const wallet = await this.findOne({ user });
  return !!wallet;
};

/**
 * @typedef Wallet
 */
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
