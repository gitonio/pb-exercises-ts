var { assert, expect } = require('chai');
var helper = require('./helper');

describe('bytes', function () {
    const bytes = helper.strToBytes('hello world', 'ascii')
    const str = helper.bytesToString(bytes, 'ascii')
    it('strToBytes', function () {
        assert.deepEqual(bytes, Buffer.from('hello world', 'ascii'))
        assert.deepEqual(str, 'hello world')
    })
})

describe('little endian to int', function () {
    let bytes = helper.strToBytes('99c3980000000000', 'hex')

    let want = 10011545
    it('le1', function () {
        assert.equal(helper.littleEndianToInt(bytes), want)
    })

    bytes = helper.strToBytes('a135ef0100000000', 'hex')
    want = 32454049
    it('le2', function () {
        assert.equal(helper.littleEndianToInt(bytes), want)
    })
})

describe('int to little endian', function () {
    let n = 1;
    let buf = helper.intToLittleEndian(n, 4);
    let want = Buffer.from([0x01, 0x0, 0x0, 0x0]);
    it('le', function () {
        assert.deepEqual(buf, want)
    })
    n = 10011545;
    buf = helper.intToLittleEndian(n, 8);
    want = Buffer.from([0x99, 0xc3, 0x98, 0x00, 0x00, 0x00, 0x00, 0x00]);
    it('le2', function () {
        assert.deepEqual(buf, want)
    })
})

