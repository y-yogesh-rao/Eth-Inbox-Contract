const assert = require('assert');
const ganache = require('ganache');
const compiledFile = require('../compile');

const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

let inbox;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    const abi = compiledFile.abi;
    const bytecode = compiledFile.evm.bytecode.object;

    inbox = await new web3.eth.Contract(abi)
        .deploy({ data: bytecode, arguments: ['Hi there!'] })
        .send({ from: accounts[0], gas: 1000000 })
});

describe('Inbox', () => {
    it('deploy contract', () => {
        assert.ok(inbox.options.address);          // passes if not ["undefined","null","empty string('')","0","false"]
    });

    it('has a default message', async () => {
        const initialMessage = await inbox.methods.message().call();
        assert.equal(initialMessage,'Hi there!');
    });

    it('can change the message', async () => {
        await inbox.methods.setMessage('bye').send({ from: accounts[0] });
        const updatedMessage = await inbox.methods.message().call();
        assert.equal(updatedMessage,'bye');
    });
});