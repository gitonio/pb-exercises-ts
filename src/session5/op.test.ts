import { assert, expect } from 'chai';
import {
  FieldElement,
  Point,
  ECCPoint,
  S256Field,
  S256Point,
  G,
  N,
  Signature,
  PrivateKey
} from './ecc';

describe('OpTest', function() {
  const stack = Buffer.from('hello world');
  it('test_op_hash', function() {
    assert.equal(op_hash160(stack));
    assert.equal(
      stack[0].toString('hex'),
      'd7d5ee7824ff93f94c3055af9382c86c68b5ca92'
    );
  });
});
