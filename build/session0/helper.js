"use strict";
var Mocha = require('mocha'), fs = require('fs'), path = require('path');
function runTest(test) {
    // Instantiate a Mocha instance.
    var mocha = new Mocha();
    var testDir = '.';
    // Add each .js file to the mocha instance
    fs.readdirSync(testDir)
        .filter(function (file) {
        // Only keep the .js files
        return file.substr(-3) === '.js';
    })
        .forEach(function (file) {
        mocha.addFile(path.join(testDir, file));
    });
    // Run the tests.
    mocha.grep(test).run(function (failures) {
        process.exitCode = failures ? -1 : 0; // exit with non-zero status if there were failures
    });
}
function strToBytes(s, encoding) {
    if (encoding === void 0) { encoding = 'ascii'; }
    return Buffer.from(s, encoding);
}
function bytesToString(b, encoding) {
    if (encoding === void 0) { encoding = 'ascii'; }
    return b.toString(encoding);
}
function littleEndianToInt(b) {
    return b.readUIntLE(6, 2) + b.readUIntLE(0, Buffer.byteLength(b) - 2);
}
function intToLittleEndian(n, length) {
    var buf = Buffer.alloc(length);
    buf.writeUInt32LE(n);
    return buf;
}
module.exports.strToBytes = strToBytes;
module.exports.bytesToString = bytesToString;
module.exports.littleEndianToInt = littleEndianToInt;
module.exports.intToLittleEndian = intToLittleEndian;
module.exports.runTest = runTest;
