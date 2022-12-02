# INBOX CONTRACT

BLOCKCHAIN

Faucet Link for Goerli: https://faucets.chain.link

Metamask Address -> External Address -> Can be used for all the network (Main, Rinkeby or Goerli)

Contract Address -> Internal Address -> It's specific ,to single network like Rinkeby or Goerli

Remix IDE: https://remix.ethereum.org/

Whenever you are using a test network then the Block time reduces to less than 1 sec instead of 15 sec (which is average block time for ETH network)

Infura API: Using Infura, we can directly interact with one of the node already existing in the Main or test network. We don't have to create a local node and then interact with A node of the network instead we can use the service of Infura do the same!

Remix Drawbacks:
  - No Version Control Support
  - Most code we write is in UI development hence we preferred VS code or general code editor




This lecture will walk you through all of the changes needed to bring your project up to date with the latest Solc v0.8.9.
Environment Setup

Due to expected dependency conflicts with old installed versions, it would be best to create a brand new project.

In your terminal of choice, run the following:

mkdir inbox-updated

cd inbox-updated

npm init -y

npm install solc@0.8.9 web3 mocha ganache-cli @truffle/hdwallet-provider

Update your test script in the package.json file to be "test": "mocha"

Copy your contracts directory (containing Inbox.sol), test directory (containing Inbox.test.js), compile.js, and deploy.js into the new inbox-updated project directory.

Here is the package.json file for reference (your versions should not be lower than those specified below):

{
  "name": "inbox-updated",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "mocha"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@truffle/hdwallet-provider": "2.0.1",
    "ganache-cli": "^6.12.2",
    "mocha": "^9.1.2",
    "solc": "^0.8.9",
    "web3": "^1.6.0"
  }
}
Inbox.sol

// SPDX-License-Identifier: MIT
 
pragma solidity ^0.8.9;
 
contract Inbox {
    string public message;
    
    constructor(string memory initialMessage) {
        message = initialMessage;
    }
    
    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
}
Outline of changes:

Update the pragma version at the top of the contract file to ^0.8.9

Refactor the Inbox constructor to use the new constructor keyword - Source.

Specify the data location of the variables to be memory - Source.

Remove the public keyword from the constructor - Source.

Add an SPDX identifier to the top of the contract (will address compilation warnings) - Source.

compile.js

const path = require('path');
const fs = require('fs');
const solc = require('solc');
 
const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');
const source = fs.readFileSync(inboxPath, 'utf8');
 
const input = {
  language: 'Solidity',
  sources: {
    'Inbox.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};
 
module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  'Inbox.sol'
].Inbox;
Outline of changes:

Add the expected JSON formatted input, specifying the language, sources, and outputSelection - Source.

Update the export to provide the expected JSON formatted output - Source

Note - the output is structured differently so the accessors have changed slightly. If you have a doubt you can add a console.log to view this structure:

console.log(JSON.parse(solc.compile(JSON.stringify(input))).contracts);
This will return the following:

{
  'Inbox.sol': {
    Inbox: {
      abi: [Array],
      devdoc: [Object],
      evm: [Object],
      ewasm: [Object],
      metadata: '{...}',
      storageLayout: [Object],
      userdoc: [Object]
    }
  }
}
Inbox.test.js

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
 
const { abi, evm } = require('../compile');
 
let accounts;
let inbox;
 
beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  inbox = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
      arguments: ['Hi there!'],
    })
    .send({ from: accounts[0], gas: '1000000' });
});
 
describe('Inbox', () => {
  it('deploys a contract', () => {
    assert.ok(inbox.options.address);
  });
  it('has a default message', async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, 'Hi there!');
  });
  it('can change the message', async () => {
    await inbox.methods.setMessage('bye').send({ from: accounts[0] });
    const message = await inbox.methods.message().call();
    assert.equal(message, 'bye');
  });
});
Outline of changes:

Update the import to destructure the abi (formerly the interface) and the evm (bytecode)
const { abi, evm } = require('../compile');

Pass the abi to the contract object
  inbox = await new web3.eth.Contract(abi)

Assign the bytecode to the data property of the deploy method:

    .deploy({
      data: evm.bytecode.object, 
deploy.js

const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
 
const { abi, evm } = require('./compile');
 
provider = new HDWalletProvider(
  'YOUR_MNEMONIC',
  'YOUR_INFURA_URL'
);
 
const web3 = new Web3(provider);
 
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
 
  console.log('Attempting to deploy from account', accounts[0]);
 
  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object, arguments: ['Hi there!'] })
    .send({ gas: '1000000', from: accounts[0] });
 
  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
 
deploy();
Outline of changes:

Update the import to use the newer @truffle/hdwallet-provider module.

Update the import to destructure the abi (formerly the interface) and the evm (bytecode)
const { abi, evm } = require('./compile');

Pass the abi to the contract object:
const result = await new web3.eth.Contract(abi)

Assign the bytecode to the data property of the deploy method:

    .deploy({
      data: evm.bytecode.object, 
Call provider.engine.stop() to prevent deployment from hanging in the terminal - Source

Completed Code

Completed project with all changes described above can be found attached to this lecture note as a zip file.