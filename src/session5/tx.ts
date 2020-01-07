import { Readable } from 'stream';
var request = require('request');

//var https = require('https');
var helper = require('./helper');
import { Script } from './script';
import { hash256 } from './helper';
//var request = require('sync-request');
var ecc = require('./ecc');
const fs = require('fs');

export class TxFetcher {
  //constructor(
  //public cache: Tx[]
  //){}
  static cache: { [txId: string]: Tx } = {};
  //cache = {};
  static getUrl(testnet = false) {
    return testnet
      ? 'https://testnet.blockexplorer.com/api'
      : 'https://blockexplorer.com/api';
  }

  static fetch(txId: string, testnet = false, fresh = false): Tx {
    if (fresh || !(txId in this.cache)) {
      const url = this.getUrl(testnet) + '/tx/' + txId;
      const req = request('GET', url);
      const rawtx = JSON.parse(req.getBody('utf8')).rawtx;
      const raw = Buffer.from(rawtx, 'hex');
      let readable = new Readable();
      readable.push(raw);
      readable.push(null);
      let tx = Tx.parse(readable);
      this.cache[txId] = tx;
    }
    return this.cache[txId];
    //return tx
  }

  static loadCache(filename: string): void {
    const diskCache = JSON.parse(fs.readFileSync(filename)) as {
      txId: string;
      rawHex: string;
    }[];
    let readable: Readable;

    diskCache.map(obj => {
      readable = new Readable();
      readable.push(Buffer.from(obj.rawHex, 'hex'));
      readable.push(null);
      this.cache[obj.txId] = Tx.parse(readable);
    });
  }
}

export class Tx {
  constructor(
    public version: number,
    public inputs: TxIn[],
    public outputs: TxOut[],
    public locktime: number,
    public testnet = false
  ) {}

  static parse(s: Readable) {
    let x = s.read(4);
    const version = helper.littleEndianToInt(x);
    //this.version = version
    const numInputs = helper.readVarint(s);
    let inputs = [];
    for (let index = 0; index < numInputs; index++) {
      inputs.push(TxIn.parse(s));
    }
    const numOutputs = helper.readVarint(s);
    let outputs = [];
    for (let index = 0; index < numOutputs; index++) {
      outputs.push(TxOut.parse(s));
    }
    const locktime = helper.littleEndianToInt(s.read(4));
    return new Tx(version, inputs, outputs, locktime);
  }

  serialize(): Buffer {
    let result = helper.intToLittleEndian(this.version, 4);
    result = Buffer.concat([result, helper.encodeVarint(this.inputs.length)]);
    this.inputs.map(obj => {
      result = Buffer.concat([result, obj.serialize()]);
    });
    result = Buffer.concat([result, helper.encodeVarint(this.outputs.length)]);
    this.outputs.map(obj => {
      result = Buffer.concat([result, obj.serialize()]);
    });
    result = Buffer.concat([
      result,
      helper.intToLittleEndian(this.locktime, 4)
    ]);
    return result;
  }

  // feeAsync() {
  // 	//TODO cleanup
  // 	let inputSum = 0;
  // 	let outputSum = 0;
  // 	let x = this.inputs.map(obj => {
  // 		return obj.value()
  // 	})

  // 	let results = Promise.all(x)
  // 	let y = this.outputs.map(obj => {
  // 		return obj.amount
  // 	})

  // 	let resultsy = Promise.all(y)

  // 	const reducer = (ac,cu) => ac + cu;

  // 	return results.then(data => data.reduce(reducer))
  // 		   .then(  xx => resultsy.then(data => {data.reduce(reducer); return xx - data.reduce(reducer)   }))

  // }

  fee(): number {
    //TODO cleanup
    let inputSum = 0;
    let outputSum = 0;
    let x = this.inputs.map(obj => {
      return obj.value();
    });

    let y = this.outputs.map(obj => {
      return obj.amount;
    });

    const reducer = (ac: number, cu: number) => ac + cu;

    return x.reduce(reducer) - y.reduce(reducer);
  }

  // sigHashAsync(inputIndex, hashType) {
  // 	let altTxIns = []
  // 	this.inputs.map( obj => altTxIns.push(new TxIn(obj.prevTx, obj.prevIndex, Buffer.from([]), obj.sequence ,{})))
  // 	let signingInput = altTxIns[inputIndex];
  // 	return signingInput.scriptPubkeyAsync(this.testnet).then(scriptPubkey => {
  // 		signingInput.scriptSig = scriptPubkey;
  // 		const altTx = new Tx(this.version, altTxIns, this.outputs, this.locktime)
  // 		const result = Buffer.concat([altTx.serialize() , helper.intToLittleEndian(hashType, 4) ])
  // 		const s256 = helper.doubleSha256(Buffer.from(result));
  // 		return new BN(s256, 16)
  // 	})
  // }

  sigHash(inputIndex: number): bigint {
    let s = helper.intToLittleEndian(this.version, 4);
    s = Buffer.concat([s, helper.encodeVarint(this.inputs.length)]);
    this.inputs.map((obj: TxIn, i: number) => {
      const scriptSig =
        i === inputIndex ? obj.scriptPubkey(this.testnet) : undefined;
      const newTxIn = new TxIn(
        obj.prevTx,
        obj.prevIndex,
        scriptSig,
        obj.sequence
      );
      s = Buffer.concat([s, newTxIn.serialize()]);
    });

    s = Buffer.concat([s, helper.encodeVarint(this.outputs.length)]);
    this.outputs.map(obj => (s = Buffer.concat([s, obj.serialize()])));
    s = Buffer.concat([
      s,
      helper.intToLittleEndian(this.locktime, 4),
      helper.intToLittleEndian(1, 4)
    ]);
    const s256 = hash256(Buffer.from(s));
    return BigInt('0x' + s256.toString('hex'));
  }

  verifyInput(inputIndex: number): boolean {
    const txIn = this.inputs[inputIndex];
    //const point = ecc.S256Point.parse(txIn.secPubkey());
    //const signature = ecc.Signature.parse(txIn.derSignature());
    //const hashType = txIn.hashType();
    const z = this.sigHash(inputIndex);
    const combinedScript = txIn.scriptSig.add(txIn.scriptPubkey(this.testnet));
    console.log('combi:', combinedScript);
    return combinedScript.evaluate(z);
  }

  verify(): boolean {
    if (this.fee() < 0) return false;
    for (let index = 0; index < this.inputs.length; index++) {
      if (!this.verifyInput(index)) return false;
    }
    return true;
  }
  /*
  signInput(inputIndex, privateKey, hashType) {
    const z = this.sigHash(inputIndex, hashType);
    const der = privateKey.sign(z).der();
    const sig = Buffer.concat([der, Buffer.from([hashType])]);
    const sec = privateKey.point.sec();
    const ss = [sig, sec];
    const scriptSig = new script.Script(ss);
    this.inputs[inputIndex].scriptSig = scriptSig;
    return this.verifyInput(inputIndex);
  }
  
	isCoinbase() {
		if (this.inputs.length != 1) {
			return false;
		} 
		const firstInput = this.inputs[0]
		if (firstInput.prevTx.toString('hex') != Buffer.alloc(32).toString('hex')) {
			return false;
		}
		if(firstInput.prevIndex != 0xffffffff) {
			return false;
		}
		return true;
	}

	coinbaseHeight() {
		if (!this.isCoinbase()) {
			return undefined;
		}
		const firstInput = this.inputs[0];
		const firstElement = firstInput.scriptSig.elements[0];
		return helper.littleEndianToInt(firstElement);
	}
*/
}

Tx.prototype.toString = function() {
  let inputs = '';
  this.inputs.map(obj => {
    inputs = inputs + obj.toString() + '\n';
  });
  let outputs = '';
  this.outputs.map(obj => {
    outputs = outputs + obj.toString() + '\n';
  });
  return `version: ${this.version}\nInputs:\n ${inputs}\nOutputs:\n ${outputs}\nLocktime:${this.locktime}`;
};

export class TxIn {
  constructor(
    public prevTx: Buffer,
    public prevIndex: number,
    public scriptSig: Script = new Script([]),
    public sequence: number = parseInt('0xffffffff', 16) //public cache: object = {}
  ) {}

  static parse(s: Readable): TxIn {
    const prevTx = Buffer.from(
      Array.prototype.reverse.call(new Uint16Array(s.read(32)))
    );
    const prevIndex = helper.littleEndianToInt(s.read(4));
    const scriptSig = Script.parse(s);
    const x = s.read(4);
    const sequence = helper.littleEndianToInt(x);
    //const cache = {};
    return new TxIn(prevTx, prevIndex, scriptSig, sequence);
  }

  serialize(): Buffer {
    const ta = Buffer.from(this.prevTx);
    let result = Array.prototype.reverse.call(ta);
    let fresult = Buffer.concat([
      result,
      helper.intToLittleEndian(this.prevIndex, 4)
    ]);
    const rawScriptSig =
      this.scriptSig === undefined
        ? Buffer.from([])
        : this.scriptSig.serialize();
    //fresult = Buffer.concat([fresult, helper.encodeVarint(rawScriptSig.length)]);
    fresult = Buffer.concat([fresult, rawScriptSig]);
    fresult = Buffer.concat([
      fresult,
      helper.intToLittleEndian(this.sequence, 4)
    ]);
    return fresult;
  }
  /*	
	
	fetchTxAsync(testnet=false) {
		if (!(this.prevTx in this.cache)) {
			const url = this.getUrl(testnet) + '/rawtx/' + this.prevTx.toString('hex');
			const rr = request('GET', url)
			return new Promise((resolve, reject) => {
				https.get(url, function(res) { 
					if (res.statusCode < 200 || res.statusCode > 299) {
						reject(new Error('Failed to load page, status code: ' + response.statusCode));
					}
				
					const body = []
					res.on('data', (chunk) => body.push(chunk));
					res.on('end', () => {
						let html = body.join('');
						const raw = Buffer.from(JSON.parse(html).rawtx,'hex');
						let readable = new Readable();
						readable.push(raw);
						readable.push(null);
						let tx = Tx.parse(readable);
						resolve( tx );
					});			
				});
			})
		}
	}
	*/

  // fetchTx(testnet=false) {
  // 	if (!(this.prevTx in this.cache)) {
  // 		const url = this.getUrl(testnet) + '/rawtx/' + this.prevTx.toString('hex');
  // 		const req = request('GET', url)
  // 		const rawtx = JSON.parse(req.getBody('utf8')).rawtx
  // 		const raw = Buffer.from(rawtx,'hex');
  // 		let readable = new Readable();
  // 		readable.push(raw);
  // 		readable.push(null);
  // 		let tx = Tx.parse(readable);
  // 		this.cache[this.prevTx] = tx;

  // 	};
  // 	return this.cache[this.prevTx]
  // 	//return tx
  // }

  fetchTx(testnet = false): Tx {
    return TxFetcher.fetch(this.prevTx.toString('hex'), (testnet = testnet));
  }

  // valueAsync(testnet=false) {
  // 	return this.fetchTxAsync(testnet=testnet)
  // 		.then( (tx) => {
  // 			return tx.outputs[this.prevIndex].amount;
  // 		}).catch((err) => { console.log(err)});
  // }

  value(testnet = false): number {
    const tx = this.fetchTx((testnet = testnet));
    return tx.outputs[this.prevIndex].amount;
  }

  // scriptPubkeyAsync(testnet=false) {
  // 	return this.fetchTxAsync(testnet=testnet)
  // 	.then( (tx) => {
  // 		return tx.outputs[this.prevIndex].scriptPubkey;
  // 	}).catch((err) => { console.log(err)});
  // }

  scriptPubkey(testnet = false): Script {
    const tx = this.fetchTx((testnet = testnet));
    return tx.outputs[this.prevIndex].scriptPubkey;
  }

  /*
	derSignature(index=0) {
		const signature = this.scriptSig.signature(index=index)
		return signature.slice(0,signature.length-1);
	}
	
	hashType(index=0) {
		const signature = this.scriptSig.signature(index=index)
		return signature[signature.length-1]
	}
	
	secPubkey(index=0) {
		return this.scriptSig.secPubkey(index=index);
	}
	*/
}

TxIn.prototype.toString = function() {
  return `${this.prevTx.toString()}:${this.prevIndex}`;
};

class TxOut {
  constructor(public amount: number, public scriptPubkey: Script) {}

  static parse(s: Readable) {
    const amount = helper.littleEndianToInt(s.read(8));
    //const scriptPubkeyLength = helper.readVarint(s);
    const scriptPubkey = Script.parse(s);
    return new TxOut(amount, scriptPubkey);
  }

  serialize() {
    let result = helper.intToLittleEndian(this.amount, 8);
    const rawScriptPubkey = this.scriptPubkey.serialize();
    //result = Buffer.concat([result, helper.encodeVarint(rawScriptPubkey.length)]);
    result = Buffer.concat([result, rawScriptPubkey]);
    return result;
  }
}

TxOut.prototype.toString = function() {
  return `${this.amount} : ${this.scriptPubkey.toString()}`;
};
