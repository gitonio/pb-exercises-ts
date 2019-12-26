var { assert, expect } = require('chai');
var helper = require('./helper');
import {
  decodeBase58,
  encodeBase58Checksum,
  h160ToP2pkhAddress
} from './helper';

describe('bytes', function() {
  const bytes = helper.strToBytes('hello world', 'ascii');
  const str = helper.bytesToString(bytes, 'ascii');
  it('strToBytes', function() {
    assert.deepEqual(bytes, Buffer.from('hello world', 'ascii'));
    assert.deepEqual(str, 'hello world');
  });
});

describe('little endian to int', function() {
  let bytes = helper.strToBytes('99c3980000000000', 'hex');

  let want = 10011545;
  it('le1', function() {
    assert.equal(helper.littleEndianToInt(bytes), want);
  });

  bytes = helper.strToBytes('a135ef0100000000', 'hex');
  want = 32454049;
  it('le2', function() {
    assert.equal(helper.littleEndianToInt(bytes), want);
  });
});

describe('int to little endian', function() {
  let n = 1;
  let buf = helper.intToLittleEndian(n, 4);
  let want = Buffer.from([0x01, 0x0, 0x0, 0x0]);
  it('le', function() {
    assert.deepEqual(buf, want);
  });
  n = 10011545;
  buf = helper.intToLittleEndian(n, 8);
  want = Buffer.from([0x99, 0xc3, 0x98, 0x00, 0x00, 0x00, 0x00, 0x00]);
  it('le2', function() {
    assert.deepEqual(buf, want);
  });
});

describe('b58', function() {
  const bytes = Buffer.from(
    '003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187',
    'hex'
  );
  const address = helper.encodeBase58(bytes);
  it('base58', function() {
    assert.equal(address, '16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS');
  });
});

describe('test_base58', function() {
  let addr = 'mnrVtF8DWjMu839VW3rBfgYaAfKk8983Xf';
  let h160 = decodeBase58(addr).toString('hex');
  it('1', function() {
    assert.equal(h160, '507b27411ccf7f16f10297de6cef3f291623eddf');
  });
  const bh160 = Buffer.from(
    '6f507b27411ccf7f16f10297de6cef3f291623eddf',
    'hex'
  );

  it('2', function() {
    const got = encodeBase58Checksum(
      Buffer.concat([Buffer.from('6f', 'hex'), Buffer.from(h160, 'hex')])
    );
    assert.equal(got, addr);
  });

  it('test_encode_base58_checksum', function() {
    const raw = Buffer.from(
      '005dedfbf9ea599dd4e3ca6a80b333c472fd0b3f69',
      'hex'
    );
    assert.equal(
      encodeBase58Checksum(raw),
      '19ZewH8Kk1PDbSNdJ97FP4EiCjTRaZMZQA'
    );
  });
});
describe('test_p2pkh_address', function() {
  it('1', function() {
    const h160 = Buffer.from('74d691da1574e6b3c192ecfb52cc8984ee7b6c56', 'hex');
    assert.equal(
      h160ToP2pkhAddress(h160, false),
      '1BenRpVUFK65JFWcQSuHnJKzc4M8ZP8Eqa'
    );
  });
});
