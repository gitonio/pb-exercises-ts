var { assert, expect } = require('chai');
import { Tx, TxIn, TxOut, TxFetcher } from './tx';
import { Script, p2pkhScript } from './script';
import { PrivateKey } from '../session5/ecc';
import { decodeBase58 } from './helper';
var Readable = require('stream').Readable;
var ecc = require('./ecc');
var helper = require('./helper');

describe('TxTest', function() {
  this.timeout(5000);

  TxFetcher.loadCache('./src/session5/tx.cache');
  /*
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
    assert.deepEqual(tx.serialize(), rawTx);
  });

  it('test_input_value', function() {
    const txIn = new TxIn(
      Buffer.from(
        'd1c789a9c60383bf715f3f6ad9d14b91fe55f3deb369fe5d9280cb1a01793f81',
        'hex'
      ),
      0
    );
    assert.deepEqual(txIn.value(), 42505594);
  });

  it('test_input_pubkey', function() {
    const want = Buffer.from(
      '1976a914a802fc56c704ce87c42d7c92eb75e7896bdc41ae88ac',
      'hex'
    );
    const txIn = new TxIn(
      Buffer.from(
        'd1c789a9c60383bf715f3f6ad9d14b91fe55f3deb369fe5d9280cb1a01793f81',
        'hex'
      ),
      0
    );

    assert.deepEqual(txIn.scriptPubkey().serialize(), want);
  });

  it('test_fee', function() {
    assert.equal(tx.fee(), 40000);

    const rawTx = Buffer.from(
      '010000000456919960ac691763688d3d3bcea9ad6ecaf875df5339e148a1fc61c6ed7a069e010000006a47304402204585bcdef85e6b1c6af5c2669d4830ff86e42dd205c0e089bc2a821657e951c002201024a10366077f87d6bce1f7100ad8cfa8a064b39d4e8fe4ea13a7b71aa8180f012102f0da57e85eec2934a82a585ea337ce2f4998b50ae699dd79f5880e253dafafb7feffffffeb8f51f4038dc17e6313cf831d4f02281c2a468bde0fafd37f1bf882729e7fd3000000006a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937feffffff567bf40595119d1bb8a3037c356efd56170b64cbcc160fb028fa10704b45d775000000006a47304402204c7c7818424c7f7911da6cddc59655a70af1cb5eaf17c69dadbfc74ffa0b662f02207599e08bc8023693ad4e9527dc42c34210f7a7d1d1ddfc8492b654a11e7620a0012102158b46fbdff65d0172b7989aec8850aa0dae49abfb84c81ae6e5b251a58ace5cfeffffffd63a5e6c16e620f86f375925b21cabaf736c779f88fd04dcad51d26690f7f345010000006a47304402200633ea0d3314bea0d95b3cd8dadb2ef79ea8331ffe1e61f762c0f6daea0fabde022029f23b3e9c30f080446150b23852028751635dcee2be669c2a1686a4b5edf304012103ffd6f4a67e94aba353a00882e563ff2722eb4cff0ad6006e86ee20dfe7520d55feffffff0251430f00000000001976a914ab0c0b2e98b1ab6dbf67d4750b0a56244948a87988ac005a6202000000001976a9143c82d7df364eb6c75be8c80df2b3eda8db57397088ac46430600',
      'hex'
    );

    const readable = new Readable();
    readable.push(rawTx);
    readable.push(null);

    const tx2 = Tx.parse(readable);
    assert.equal(tx2.fee(), 140500);
  });

  it('test_sig_hash', function() {
    assert.equal(
      tx.sigHash(0),
      BigInt(
        '0x27e0c5994dec7824e56dec6b2fcb342eb7cdb0d0957c2fce9882f715e85d81a6'
      )
    );
  });

  it('test_verify_p2pkh', function() {
    let tx = TxFetcher.fetch(
      '452c629d67e41baec3ac6f04fe744b4b9617f8f859c63b3002f8684e7a4fee03'
    );
    console.log(tx);
    assert.ok(tx.verify());

    TxFetcher.fetch(
      '5418099cc755cb9dd3ebc6cf1a7888ad53a1a3beb5a025bce89eb1bf7f1650a2',
      true
    );
    console.log(tx);
    assert.ok(tx.verify());
  });
*/
  it('test_sign_input', function() {
    const private_key = new PrivateKey(8675309n);
    const txIns = [];
    const prevTx = Buffer.from(
      '0025bc3c0fa8b7eb55b9437fdbd016870d18e0df0ace7bc9864efc38414147c8',
      'hex'
    );
    txIns.push(new TxIn(prevTx, 0));
    const txOuts = [];
    let h160 = decodeBase58('mzx5YhAH9kNHtcN481u6WkjeHjYtVeKVh2');
    txOuts.push(new TxOut(0.99 * 100000000, p2pkhScript(h160)));
    h160 = decodeBase58('mnrVtF8DWjMu839VW3rBfgYaAfKk8983Xf');
    txOuts.push(new TxOut(0.1 * 100000000, p2pkhScript(h160)));
    const tx = new Tx(1, txIns, txOuts, 0, true);
    assert.ok(tx.signInput(0, private_key));
  });
});
