const express = require('express');
const bodyParser = require('body-parser');
const { v4 } = require('uuid');
const axios = require('axios').default;

const Blockchain = require('./blockchain');

const app = express();
const blockchain = new Blockchain();
const nodeAddress = v4().split('-').join('');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', function (req, res) {
  res.send(blockchain);
});

app.post('/transaction', function (req, res) {
  const newBlockIndex = blockchain.addTransactionToPendingTransactions(req.body);

  res.json({ message: `Transaction will be added in block ${newBlockIndex}` });
});

app.post('/transaction/broadcast', async function (req, res) {
  const { amount, sender, recipient } = req.body;

  const newTransaction = blockchain.createNewTransaction(amount, sender, recipient);
  blockchain.addTransactionToPendingTransactions(newTransaction);

  const regNodesPromises = [];

  blockchain.networkNodes.forEach((networkNodeUrl) => {
    regNodesPromises.push(axios.post(`${networkNodeUrl}/transaction`, newTransaction));
  });

  await Promise.all(regNodesPromises);

  res.json({ message: 'Transaction created and broadcasted successfully !' });
});

app.get('/mine', async function (_, res) {
  const lastBlock = blockchain.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    transactions: blockchain.pendingTransactions,
    index: lastBlock['index'] + 1,
  };
  const nonce = blockchain.proofOfWork(previousBlockHash, currentBlockData);
  const hash = blockchain.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = blockchain.createNewBlock(nonce, previousBlockHash, hash);

  const regNodesPromises = [];

  blockchain.networkNodes.forEach((networkNodeUrl) => {
    regNodesPromises.push(axios.post(`${networkNodeUrl}/receive-new-block`, newBlock));
  });

  await Promise.all(regNodesPromises);

  const newRewardTransaction = blockchain.createNewTransaction(12.5, '00', nodeAddress);
  await axios.post(`${blockchain.currentNodeUrl}/transaction/broadcast`, newRewardTransaction);

  res.json({
    message: 'New block mined and broadcasted successfully !',
    block: newBlock,
  });
});

app.post('/receive-new-block', function (req, res) {
  const newBlock = req.body;
  const lastBlock = blockchain.getLastBlock();

  const isHashCorrect = newBlock.previousBlockHash === lastBlock.hash;
  const isIndexCorrect = newBlock.index === lastBlock.index + 1;

  if (isHashCorrect && isIndexCorrect) {
    blockchain.chain.push(newBlock);
    blockchain.pendingTransactions = [];

    res.json({ message: 'New block received and accepted', newBlock });
    return;
  }

  res.json({ message: 'New block rejected', newBlock });
});

app.post('/register-and-broadcast-node', async function (req, res) {
  const { newNodeUrl } = req.body;

  if (!blockchain.networkNodes.includes(newNodeUrl)) {
    blockchain.networkNodes.push(newNodeUrl);
  }

  const regNodesPromises = [];

  blockchain.networkNodes.forEach((networkNodeUrl) => {
    regNodesPromises.push(axios.post(`${networkNodeUrl}/register-node`, { newNodeUrl }));
  });

  await Promise.all(regNodesPromises);

  await axios.post(`${newNodeUrl}/register-node-bulk`, {
    allNetworkNodes: [...blockchain.networkNodes, blockchain.currentNodeUrl],
  });

  res.json({ message: 'New node registered with network successfully !' });
});

app.post('/register-node', function (req, res) {
  const { newNodeUrl } = req.body;

  if (!blockchain.networkNodes.includes(newNodeUrl) && newNodeUrl !== blockchain.currentNodeUrl) {
    blockchain.networkNodes.push(newNodeUrl);
  }

  res.json({ message: 'New node registered successfully !' });
});

app.post('/register-node-bulk', function (req, res) {
  const { allNetworkNodes } = req.body;

  allNetworkNodes.forEach((networkNodeUrl) => {
    if (!blockchain.networkNodes.includes(networkNodeUrl) && networkNodeUrl !== blockchain.currentNodeUrl) {
      blockchain.networkNodes.push(networkNodeUrl);
    }
  });

  res.json({ message: 'Bulk registration successful !' });
});

app.get('/consensus', async function (req, res) {
  const regNodesPromises = [];

  blockchain.networkNodes.forEach((networkNodeUrl) => {
    regNodesPromises.push(axios.get(`${networkNodeUrl}/blockchain`));
  });

  const blockchainList = await Promise.all(regNodesPromises);

  let maxChainLength = blockchain.chain.length;
  let newLongestChain = null;
  let newPendingTransactions = null;

  blockchainList
    .map((bc) => bc.data)
    .forEach((bc) => {
      if (bc.chain.length > maxChainLength) {
        maxChainLength = bc.chain.length;
        newLongestChain = bc.chain;
        newPendingTransactions = bc.pendingTransactions;
      }
    });

  if (!newLongestChain || (newLongestChain && !blockchain.chainIsValid(newLongestChain))) {
    res.json({
      message: 'Current chain has not been replaced.',
      chain: blockchain.chain,
    });
    return;
  }

  if (newLongestChain && blockchain.chainIsValid(newLongestChain)) {
    blockchain.chain = newLongestChain;
    blockchain.pendingTransactions = newPendingTransactions;
    res.json({
      message: 'Current chain has been replaced.',
      chain: blockchain.chain,
    });
  }
});

app.get('/block/:blockHash', function (req, res) {
  const { blockHash } = req.params;

  const response = blockchain.getBlock(blockHash);

  if (!response) {
    res.json({
      message: 'Can not find your block hash',
    });
    return;
  }

  res.json({
    block: response,
    message: 'Found your block hash!',
  });
});

app.get('/transaction/:transactionId', function (req, res) {
  const { transactionId } = req.params;

  const response = blockchain.getTransaction(transactionId);

  if (!response) {
    res.json({
      message: 'Can not find your transaction !',
    });
    return;
  }

  res.json({
    transaction: response,
    message: 'Found your transaction!',
  });
});

app.get('/address/:address', function (req, res) {
  const { address } = req.params;

  const response = blockchain.getAddressData(address);

  if (!response.transactions.length) {
    res.json({
      message: 'Address is not exist !',
    });
    return;
  }

  res.json({
    ...response,
    message: 'Found address!',
  });
});

app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
