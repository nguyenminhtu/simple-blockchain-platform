const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

const testData = {
  chain: [
    {
      index: 1,
      timestamp: 1631358531660,
      transactions: [],
      nonce: 100,
      hash: '0',
      previousBlockHash: '0',
    },
    {
      index: 2,
      timestamp: 1631358535156,
      transactions: [],
      nonce: 13791,
      hash: '000510d13e973f97a7ab8517776d7c60281d0f0b2dc5786fbf4f73446201410c',
      previousBlockHash: '0',
    },
    {
      index: 3,
      timestamp: 1631358575442,
      transactions: [
        {
          amount: 12.5,
          sender: '00',
          recipient: '72b88d9c5a084bdc93b4b242f3e9c682',
          id: '13818fb8ca1c4d7ba2a5929c094dc5bd',
        },
        {
          amount: 111,
          sender: 'as9d79a7sd98asd',
          recipient: 'as8d9a8sd98a7sd98',
          id: '15df903e1d014a7e85835307cfeed557',
        },
        {
          amount: 222,
          sender: 'as9d79a7sd98asd',
          recipient: 'as8d9a8sd98a7sd98',
          id: 'bc8ef5bb351348faa7140f744abf5f95',
        },
      ],
      nonce: 12201,
      hash: '000535e1146b543127d30b64b5b7c4ef0964e42e454dcd5a68c3efaa3474a311',
      previousBlockHash: '000510d13e973f97a7ab8517776d7c60281d0f0b2dc5786fbf4f73446201410c',
    },
    {
      index: 4,
      timestamp: 1631358602918,
      transactions: [
        {
          amount: 12.5,
          sender: '00',
          recipient: '72b88d9c5a084bdc93b4b242f3e9c682',
          id: '67e55b34d6e241758e59416ae8b5a144',
        },
        {
          amount: 333,
          sender: 'as9d79a7sd98asd',
          recipient: 'as8d9a8sd98a7sd98',
          id: '8d9b4b5560164d898cd5abaa4924d46d',
        },
        {
          amount: 444,
          sender: 'as9d79a7sd98asd',
          recipient: 'as8d9a8sd98a7sd98',
          id: 'f63754a498cf405fade94654853e3119',
        },
        {
          amount: 555,
          sender: 'as9d79a7sd98asd',
          recipient: 'as8d9a8sd98a7sd98',
          id: 'a3465081ec2c4b1b95015d1b51e7ceab',
        },
        {
          amount: 666,
          sender: 'as9d79a7sd98asd',
          recipient: 'as8d9a8sd98a7sd98',
          id: 'f36c0e7b563844628f61b30e90b34aff',
        },
      ],
      nonce: 2862,
      hash: '0001ca27ee9a305dce4779d2ad185db97452c5809420686b1ce0871910f831e0',
      previousBlockHash: '000535e1146b543127d30b64b5b7c4ef0964e42e454dcd5a68c3efaa3474a311',
    },
  ],
  pendingTransactions: [
    {
      amount: 12.5,
      sender: '00',
      recipient: '72b88d9c5a084bdc93b4b242f3e9c682',
      id: '563c0e58605a46ffa37efb1eadf9195d',
    },
  ],
  networkNodes: [],
  currentNodeUrl: 'http://localhost:3002',
};

console.log(blockchain.chainIsValid(testData.chain));
