const P2pServer = require('./p2p-server');
const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');


const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const pool = new TransactionPool();
const p2pServer = new P2pServer(blockchain, pool);
const miner = new Miner(blockchain, pool, wallet, p2pServer);
app.use(bodyParser.json());


app.get('/blocks', (req, res) => {
  res.json(blockchain.chain);
})

app.get('/mine', (req, res) => {
  const block = miner.mine();
  console.log(`New block added: ${block.toString()}`);
  res.redirect('/blocks');
})


app.get('/transactions', (req, res) => {
  res.json(pool.transactions);
})

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body;
  const  transaction = wallet.createTransaction(recipient, amount, blockchain, pool);

  if (transaction){
      p2pServer.broadcastTransaction(transaction);
  }

  res.redirect('/transactions');
})

app.get('/public/key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
})

app.get('/balance', (req, res) => {
  res.json({ balance: wallet.calculateBalance(blockchain) });
})

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen()
