module.exports.functionSignatures = {
  walletExecuteUserOp: 'executeUserOp(address,uint256,bytes)',
  walletGrantGuardian: 'grantGuardian(address)',
  walletRevokeGuardian: 'revokeGuardian(address)',
  walletTransferOwner: 'transferOwner(address)',
  erc20Transfer: 'transfer(address,uint256)',
  erc20Approve: 'approve(address,uint256)',
};

module.exports.eventSignatures = {
  erc20Transfer: 'Transfer(address,address,uint256)',
};

module.exports.type = {
  genericRelay: 'genericRelay',
  recoverAccount: 'recoverAccount',
  newPayment: 'newPayment',
};

module.exports.status = {
  pending: 'pending',
  success: 'success',
  failed: 'failed',
};

module.exports.chainId = {
  polygon: 137,
  mumbai: 80001,
};
