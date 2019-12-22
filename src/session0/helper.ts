import fs from 'fs';
import Mocha from 'mocha';
import path from 'path';

//var Mochat = require('mocha'),
//  fs = require('fs'),
//  path = require('path');

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
  //return buf;
  return toBuffer(n, 'little', length);
  Buffer.from(n.toString(16), 'hex');
  const x = n.toString(16).length == 1 ? '0' + n.toString(16) : n.toString(16);
  return Buffer.from(flipEndian(x), 'hex');
}

function flipEndian(str: string): string {
  return str
    .match(/.{2}/g)!
    .reverse()
    .join('');
}

export const bigintBytes = (num: bigint | number): number => {
  if (typeof num === 'number' && num > 2 ** 32 - 1) num = BigInt(num);
  let bytesNeeded = 0;
  let bitsNeeded = 0;

  while (num > 0) {
    if (bitsNeeded % 8 === 0) {
      bytesNeeded += 1;
    }
    bitsNeeded += 1;
    num = typeof num === 'bigint' ? num >> 1n : num >> 1;
  }
  return bytesNeeded;
};

export const toBuffer = (
  num: number | bigint,
  endian: 'big' | 'little' = 'little',
  byteLength?: number
): Buffer => {
  let length = byteLength || bigintBytes(num);
  const bits = [];

  while (num > 0) {
    const remainder = typeof num === 'bigint' ? num % 2n : num % 2;
    bits.push(remainder);
    num = typeof num === 'bigint' ? num / 2n : Math.floor(num / 2);
  }

  let counter = 0;
  let total = 0;
  const buffer = Buffer.alloc(length);

  const writeByte = (byte: number) => {
    if (endian === 'little') {
      buffer[buffer.byteLength - length] = byte;
    } else {
      buffer[length - 1] = byte;
    }
  };

  for (const bit of bits) {
    if (counter % 8 == 0 && counter > 0) {
      writeByte(total);
      total = 0;
      counter = 0;
      length--;
    }

    if (bit) {
      // bit is set
      total += Math.pow(2, counter);
    }
    counter++;
  }
  writeByte(total);
  return buffer;
};

module.exports.strToBytes = strToBytes;
module.exports.bytesToString = bytesToString;
module.exports.littleEndianToInt = littleEndianToInt;
module.exports.intToLittleEndian = intToLittleEndian;
module.exports.runTest = runTest;
