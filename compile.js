const fs = require('fs');
const path = require('path');
const solCompiler = require('solc');

const inboxContractPath = path.resolve(__dirname, 'contracts', 'inbox.sol');
const sourceCode = fs.readFileSync(inboxContractPath, 'utf8');

let input = {
    language: 'Solidity',
    sources: {
        'inbox.sol': {
            content: sourceCode
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
}

let compiledData = JSON.parse(solCompiler.compile(JSON.stringify(input)));

module.exports = compiledData.contracts['inbox.sol'].Inbox;