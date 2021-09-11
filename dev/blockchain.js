const sha256 = require('sha256');
const { v4 } = require('uuid');

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];

  this.networkNodes = [];
  this.currentNodeUrl = process.env.NODE_URL;

  this.createNewBlock(100, '0', '0');
}

Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce,
    hash,
    previousBlockHash,
  };

  this.pendingTransactions = [];
  this.chain.push(newBlock);

  return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
  const newTransaction = {
    amount,
    sender,
    recipient,
    id: v4().split('-').join(''),
  };

  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function (transactionObj) {
  this.pendingTransactions.push(transactionObj);

  return this.getLastBlock()['index'] + 1;
};

Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
  const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);
  return hash;
};

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
  let nonce = 0,
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

  while (hash.substring(0, 3) !== '000') {
    nonce += 1;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }

  return nonce;
};

Blockchain.prototype.chainIsValid = function (blockchain) {
  let validChain = true;

  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const prevBlock = blockchain[i - 1];
    const blockHash = this.hashBlock(
      prevBlock.hash,
      { transactions: currentBlock.transactions, index: prevBlock.index + 1 },
      currentBlock.nonce,
    );

    if (blockHash.substring(0, 3) !== '000') {
      validChain = false;
    }

    if (currentBlock.previousBlockHash !== prevBlock.hash) {
      validChain = false;
    }
  }

  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock.nonce === 100;
  const correctPreviousBlockHash = genesisBlock.previousBlockHash === '0';
  const correctHash = genesisBlock.hash === '0';
  const correctTransactions = genesisBlock.transactions.length === 0;

  if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) {
    validChain = false;
  }

  return validChain;
};

Blockchain.prototype.getBlock = function (hash) {
  return this.chain.find((b) => b.hash === hash);
};

Blockchain.prototype.getTransaction = function (transactionId) {
  let transaction = null;

  this.chain.forEach((c) => {
    c.transactions.forEach((t) => {
      if (t.id === transactionId) {
        transaction = t;
        return;
      }
    });
  });

  return transaction;
};

Blockchain.prototype.getAddressData = function (address) {
  const transactions = [];
  let balance = 0;

  this.chain.forEach((c) => {
    c.transactions.forEach((t) => {
      if (t.sender === address || t.recipient === address) {
        transactions.push(t);
      }
    });
  });

  transactions.forEach((t) => {
    if (t.sender === address) {
      balance -= t.amount;
    }

    if (t.recipient === address) {
      balance += t.amount;
    }
  });

  return {
    transactions,
    balance,
  };
};

module.exports = Blockchain;
