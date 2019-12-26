import fs from 'fs';
import Mocha from 'mocha';
import path from 'path';
import hash from 'hash.js';
import { Readable } from 'stream';

function runTest(test: string) {
  // Instantiate a Mocha instance.
  var mocha = new Mocha();

  var testDir = '.';
  // Add each .js file to the mocha instance
  fs.readdirSync(testDir)
    .filter(function(file: string) {
      // Only keep the .js files
      return file.substr(-3) === '.js';
    })
    .forEach(function(file: string) {
      mocha.addFile(path.join(testDir, file));
    });

  // Run the tests.
  mocha.grep(test).run(function(failures: number) {
    process.exitCode = failures ? -1 : 0; // exit with non-zero status if there were failures
  });
}

function strToBytes(str: string, encoding: BufferEncoding): ArrayBuffer {
  return Buffer.from(str, encoding);
}

function bytesToString(b: Buffer, encoding: BufferEncoding): string {
  return b.toString(encoding);
}

function littleEndianToInt(b: Buffer): number {
  //return b.readUIntLE(6, 2) + b.readUIntLE(0, Buffer.byteLength(b) - 2);
  return parseInt(flipEndian(b.toString('hex')), 16);
}

function intToLittleEndian(n: number, length: number): Buffer {
  const buf = Buffer.alloc(length);
  buf.writeUInt32LE(n, 0);
  return buf;
  //return toBuffer(n, 'little', length);
  Buffer.from(n.toString(16), 'hex');
  const x = n.toString(16).length == 1 ? '0' + n.toString(16) : n.toString(16);
  return Buffer.from(flipEndian(x), 'hex');
}

function intToBigEndian(n: number | bigint): Buffer {
  const pref = n < 16 ? '0' : '';
  return Buffer.from(pref + n.toString(16), 'hex');
}

function readVarint(s: Readable): number {
  //Get first two bytes
  const i = s.read(1)[0];
  if (i == 0xfd) {
    return littleEndianToInt(s.read(2));
  } else if (i == 0xfe) {
    return littleEndianToInt(s.read(4));
  } else if (i == 0xff) {
    return littleEndianToInt(s.read(8));
  } else {
    return i;
  }
}

export function encodeVarint(i: number): Buffer {
  if (i < 0xfd) {
    return Buffer.from([i]);
  } else if (i < 0x1000) {
    return Buffer.concat([Buffer.from([0xfd]), intToLittleEndian(i, 2)]);
  } else if (i < 0x100000000) {
    return Buffer.concat([Buffer.from([0xfe]), intToLittleEndian(i, 4)]);
  } else if (i < 0x10000000000000000) {
    return Buffer.concat([Buffer.from([0xff]), intToLittleEndian(i, 8)]);
  } else {
    throw new Error('integer too large ${i}');
  }
}

function flipEndian(str: string): string {
  return str
    .match(/.{2}/g)!
    .reverse()
    .join('');
}

function mod(a: bigint, b: bigint): bigint {
  return ((a % b) + b) % b;
}

function pow(b: bigint, e: bigint, m: bigint): bigint {
  let result = BigInt(1);
  b = mod(b, m);
  while (e > 0) {
    if (e & BigInt(1)) {
      result = mod(result * b, m);
    }
    e = e >> BigInt(1);
    b = mod(b * b, m);
  }
  return result;
}

function invert(num: bigint, prime: bigint): bigint {
  //console.log(num % prime, prime);
  //return (num % prime) ** (prime - BigInt(2)) % prime;
  return pow(num, prime - 2n, prime);
}

function hash160(b: Buffer): string {
  const sha = Buffer.from(
    hash
      .sha256()
      .update(b)
      .digest('hex'),
    'hex'
  );
  return hash
    .ripemd160()
    .update(sha)
    .digest('hex');
}

function doubleSha256(b: Buffer): string {
  let sha1 = Buffer.from(
    hash
      .sha256()
      .update(b)
      .digest('hex'),
    'hex'
  );
  return hash
    .sha256()
    .update(sha1)
    .digest('hex');
}

function encodeBase58(b: Buffer): string {
  let s = BigInt('0x' + b.toString('hex'));
  const base = 58n;
  let count = 0;

  for (let index = 0; index < b.length; index++) {
    if (b[index] == 0) {
      count++;
    } else {
      break;
    }
  }

  let prefix = 1 * count;
  let result = [];

  while (s > 0) {
    let bmod = mod(s, base);
    result.unshift(BASE58_ALPHABET.charAt(Number(bmod)));
    s = s / base;
  }
  if (prefix > 0) {
    result.unshift(prefix);
  }
  return result.join('');
}

export function encodeBase58Checksum(b: Buffer): string {
  const checksum = Buffer.from(doubleSha256(b).slice(0, 8), 'hex');
  const total = Buffer.concat([b, checksum]);
  return encodeBase58(total);
}

export function decodeBase58(s: string): Buffer {
  let num = 0n;
  const base = 58n;
  let sb = Buffer.from(s, 'ascii');
  let ba = Buffer.from(BASE58_ALPHABET, 'ascii');
  for (let index = 0; index < sb.length; index++) {
    num = num * base;
    num = num + BigInt(ba.indexOf(sb[index]));
  }
  //	let combined = new BN(num).toBuffer('be');
  const combined = intToBigEndian(num);
  const l = Buffer.byteLength(combined);
  const checksum = combined.slice(l - 4, l);
  const res = doubleSha256(combined.slice(0, l - 4));

  if (res.slice(0, 8) != checksum.toString('hex')) {
    throw new Error(
      `bad address: ${checksum.toString('hex')} ${res.slice(0, 8)}`
    );
  }
  return combined.slice(1, Buffer.byteLength(combined) - 4);
}

export function h160ToP2pkhAddress(h160: Buffer, testnet = false): string {
  const prefix = testnet ? Buffer.from([0x6f]) : Buffer.from([0x00]);
  console.log(Buffer.concat([prefix, h160]));
  return encodeBase58(Buffer.concat([prefix, h160]));
}

export function h160ToP2shAddress(h160: Buffer, testnet = false): string {
  const prefix = testnet ? Buffer.from([0xc4]) : Buffer.from([0x05]);
  return encodeBase58(Buffer.concat([prefix, h160]));
}

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

module.exports.strToBytes = strToBytes;
module.exports.bytesToString = bytesToString;
module.exports.littleEndianToInt = littleEndianToInt;
module.exports.intToLittleEndian = intToLittleEndian;
module.exports.intToBigEndian = intToBigEndian;
module.exports.readVarint = readVarint;
module.exports.runTest = runTest;
module.exports.mod = mod;
module.exports.pow = pow;
module.exports.invert = invert;
module.exports.hash160 = hash160;
module.exports.doubleSha256 = doubleSha256;
module.exports.encodeBase58 = encodeBase58;
