var { assert, expect } = require('chai');
import { Tx, TxIn, TxFetcher } from './tx';
import { Script } from './script';
var Readable = require('stream').Readable;
var ecc = require('./ecc');
var helper = require('./helper');

describe('TxTest', function() {

const cacheFile = Tx.cacheFile

TxFetcher.loadCache(cacheFile)



  const rawTx = Buffer.from(
    '0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600',
    'hex'
  );

  const readable = new Readable();
  readable.push(rawTx);
  readable.push(null);

  const tx = Tx.parse(readable);

  it('test_parse_version', function() {
    assert.equal(tx.version, 1);
  });

  it('test_parse_inputs', function() {
    assert.equal(tx.inputs.length, 1);
    let want = Buffer.from(
      'd1c789a9c60383bf715f3f6ad9d14b91fe55f3deb369fe5d9280cb1a01793f81',
      'hex'
    );
    assert.deepEqual(tx.inputs[0].prevTx, want);
    assert.deepEqual(tx.inputs[0].prevIndex, 0);
    want = Buffer.from(
      '6b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278a',
      'hex'
    );

    assert.deepEqual(tx.inputs[0].scriptSig.serialize(), want);
    assert.deepEqual(tx.inputs[0].sequence, 0xfffffffe);
  });

  it('test_parse_outputs', function() {
    assert.equal(tx.outputs.length, 2);
    assert.equal(tx.outputs[0].amount, 32454049);
    assert.deepEqual(
      tx.outputs[0].scriptPubkey.serialize(),
      Buffer.from('1976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac', 'hex')
    );
    assert.equal(tx.outputs[1].amount, 10011545);
    assert.deepEqual(
      tx.outputs[1].scriptPubkey.serialize(),
      Buffer.from('1976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac', 'hex')
    );
  });

  it('test_parse_locktime', function() {
    assert.deepEqual(tx.locktime, 410393);
  });

  it('test_serialize', function() {
    assert.deepEqual(tx.serialize(), rawTx)
  })

  it('test_input_value', function() {
    const txIn = new TxIn(Buffer.from('d1c789a9c60383bf715f3f6ad9d14b91fe55f3deb369fe5d9280cb1a01793f81','hex'),0)
    assert.deepEqual(txIn.value(), 42505594)
  })
});
