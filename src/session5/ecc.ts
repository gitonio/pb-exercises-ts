import { Readable } from 'stream';

//https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
var hash = require('hash.js');
var helper = require('./helper');
import { hash256 } from './helper';

export class FieldElement {
  num: bigint;
  prime: bigint;

  constructor(n: bigint | number, p: bigint | number) {
    this.num = BigInt(n);
    this.prime = BigInt(p);
    if (n && n < 0 && typeof p === 'bigint') {
      throw new Error(`Num ${n} not in field range 0 to ${p - 1n}`);
    }
  }

  equals(fe: FieldElement): boolean {
    if (this.num === fe.num) return true;
    else return false;
  }

  add(fe: FieldElement): FieldElement {
    if (this.prime != fe.prime) {
      throw new Error('Primes must be the same');
    }
    const num = helper.mod(this.num + fe.num, this.prime);
    return new FieldElement(num, fe.prime);
  }

  sub(fe: FieldElement): FieldElement {
    if (this.prime != fe.prime) {
      throw new Error('Primes must be the same');
    }
    //https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
    //const num = (((this.num - fe.num) % this.prime) + this.prime) % this.prime;
    const num = helper.mod(this.num - fe.num, this.prime);
    return new FieldElement(num, fe.prime);
  }

  mul(fe: FieldElement): FieldElement {
    if (this.prime != fe.prime) {
      throw new Error('Primes must be the same');
    }
    const num = helper.mod(this.num * fe.num, this.prime);
    return new FieldElement(num, fe.prime);
  }

  rmul(n: bigint): FieldElement;
  rmul(n: number): FieldElement;
  rmul(n: number | bigint): FieldElement {
    if (typeof n === 'number') {
      const num = helper.mod(this.num * BigInt(n), this.prime);
      return new FieldElement(num, this.prime);
    } else {
      const num = helper.mod(this.num * n, this.prime);
      return new FieldElement(num, this.prime);
    }
  }

  pow(n: bigint | number): FieldElement {
    let num;
    const e = BigInt(n);
    if (e < 0) {
      num = helper.pow(
        helper.pow(this.num, -BigInt(e), this.prime),
        this.prime - 2n,
        this.prime
      );
    } else {
      num = helper.pow(this.num, e, this.prime);
    }
    return new FieldElement(num, this.prime);
  }

  div(fe: FieldElement): FieldElement {
    if (this.prime != fe.prime) {
      throw new Error('Primes must be the same');
    }
    const num = helper.mod(
      this.num * helper.pow(fe.num, fe.prime - 2n, fe.prime),
      fe.prime
    );
    return new FieldElement(num, this.prime);
  }
}

FieldElement.prototype.toString = function() {
  return `FieldElement_${this.prime}(${this.num})`;
};

type InfinityPoint = {
  x: undefined;
  y: undefined;
  a: bigint | FieldElement;
  b: bigint | FieldElement;
};
type NumberPoint = {
  x: bigint;
  y: bigint;
  a: bigint;
  b: bigint;
};

type FEPoint = {
  x: FieldElement;
  y: FieldElement;
  a: FieldElement;
  b: FieldElement;
};

/*
export class Point {
  point!: NumberPoint | FEPoint | InfinityPoint;
  constructor(
    x: undefined | FieldElement | bigint | number,
    y: undefined | FieldElement | bigint | number,
    a: FieldElement | bigint | number,
    b: FieldElement | bigint | number
  ) {
    if (x === undefined) {
      a = BigInt(a);
      b = BigInt(b);
      this.point = { x: undefined, y: undefined, a, b };
    } else if (
      (typeof x == 'bigint' || typeof x == 'number') &&
      (typeof y == 'bigint' || typeof y == 'number') &&
      (typeof a == 'bigint' || typeof a == 'number') &&
      (typeof b == 'bigint' || typeof b == 'number')
    ) {
      x = BigInt(x);
      y = BigInt(y);
      a = BigInt(a);
      b = BigInt(b);
      if (y ** 2n != x ** 3n + a * x + b) {
        throw new Error(`(${x}, ${y}) is not on the curve`);
      } else {
        this.point = { x, y, a, b };
      }
    } else if (
      x instanceof FieldElement &&
      y instanceof FieldElement &&
      a instanceof FieldElement &&
      b instanceof FieldElement
    ) {
      if (y.num ** 2n != x.num ** 3n + a.num * x.num + b.num) {
        throw new Error(`(${x.num}, ${y.num}) is not on the curve`);
      } else {
        this.point = { x, y, a, b };
      }
    }
  }

  isFE(obj: FEPoint | NumberPoint | InfinityPoint): obj is FEPoint {
    return (
      (obj as FEPoint) !== undefined &&
      (obj as FEPoint).x instanceof FieldElement
    );
  }
  isInf(obj: FEPoint | NumberPoint | InfinityPoint): obj is InfinityPoint {
    return obj === undefined;
  }
  isNum(obj: FEPoint | NumberPoint | InfinityPoint): obj is NumberPoint {
    return typeof obj.x === 'bigint';
  }

  eq(other: Point): boolean {
    if (this.isFE(this.point)) {
      return (
        this.point.x == other.point.x &&
        this.point.y == other.point.y &&
        this.point.a == other.point.a &&
        this.point.b == other.point.b
      );
    } else if (this.isInf(this.point)) {
      return false;
    } else if (this.isNum(this.point)) {
      return (
        this.point.x == other.point.x &&
        this.point.y == other.point.y &&
        this.point.a == other.point.a &&
        this.point.b == other.point.b
      );
    }
    return false;
  }

  add(other: Point): Point {
    if (this.isInf(this.point)) {
      return other;
    } else if (this.isInf(other.point)) {
      return this;
    } else if (this.isFE(other.point) && this.isFE(this.point)) {
      if (this.point.x == undefined) {
        return other;
      }
      if (other.point.x == undefined || other.point.y == undefined) {
        return this;
      }
      if (
        this.point.a.num !== other.point.a.num ||
        this.point.b.num !== other.point.b.num
      ) {
        throw new Error(`Points (${this}, ${other}) are not on the same curve`);
      }
      if (this.point.x.num && this.point.x.num !== other.point.x.num) {
        const s = other.point.y
          .sub(this.point.y!)
          .div(other.point.x.sub(this.point.x));

        let x = s
          .pow(2n)
          .sub(this.point.x)
          .sub(other.point.x);
        let y = s.mul(this.point.x.sub(x)).sub(this.point.y!);
        return new Point(x, y, this.point.a, this.point.b);
      }
      if (
        this.point.x.num &&
        this.point.x.num == other.point.x.num &&
        this.point.y!.num == other.point.y.num
      ) {
        const s = this.point.x
          .pow(2n)
          .rmul(3n)
          .add(this.point.a)
          .div(this.point.y!.rmul(2n));
        let x = s.pow(2n).sub(this.point.x.rmul(2));
        let y = s.mul(this.point.x.sub(x)).sub(this.point.y!);
        return new Point(x, y, this.point.a, this.point.b);
      }
      if (
        this.point.x.num &&
        this.point.x.num == other.point.x.num &&
        this.point.y!.num !== other.point.y.num
      ) {
        return new Point(undefined, undefined, this.point.a, this.point.b);
      }
      //return new Point2({x:undefined, y:undefined, a:this.point.a, b:this.point.b});
    } else if (this.point == undefined) {
      return other;
    } else if (this.isNum(other.point) && this.isNum(this.point)) {
      if (this.point.a != other.point.a || this.point.b != other.point.b) {
        throw new Error(`Points (${this}, ${other}) are not on the same curve`);
      } else if (this.point.x == undefined || this.point.y == undefined)
        return other;
      else if (other.point.x == undefined || other.point.y == undefined)
        return this;
      else if (this.point.x == other.point.x && this.point.y != other.point.y)
        return new Point(undefined, undefined, 5n, 7n);
      else if (this.point.x != other.point.x) {
        const s =
          (other.point.y - this.point.y) / (other.point.x - this.point.x);
        let x = s ** 2n - this.point.x - other.point.x;
        let y = s * (this.point.x - x) - this.point.y;
        return new Point(x, y, this.point.a, this.point.b);
      } else {
        const s =
          (3n * this.point.x ** 2n + this.point.a) / (2n * this.point.y);
        let x = s ** 2n - 2n * this.point.x;
        let y = s * (this.point.x - x) - this.point.y;
        return new Point(x, y, this.point.a, this.point.b);
      }
    }
    return new Point(undefined, undefined, 5n, 7n);

    //}
  }

  
	// rmul(coefficient) {
	// 	if (this.x instanceof FieldElement || BN.isBN(this.x.num)) {
	// 		x1 = new FieldElement(undefined, this.x.prime);
	// 		y1 = new FieldElement(undefined, this.x.prime);
	// 		let product = new Point(x1, y1, this.a, this.b);
	// 		for (let index = 0; index < coefficient; index++) {

	// 			product = product.add(this);

	// 		}
	// 		return product;
	// 	}
	// }
	
}
*/

export class Point {
  x: bigint | undefined;
  y: bigint | undefined;
  a: bigint;
  b: bigint;

  constructor(
    _x: number | bigint | undefined,
    _y: number | bigint | undefined,
    _a: number | bigint,
    _b: number | bigint
  ) {
    this.x = _x === undefined ? _x : BigInt(_x);
    this.y = _y === undefined ? _y : BigInt(_y);
    this.a = BigInt(_a);
    this.b = BigInt(_b);
    if (this.x === undefined || this.y === undefined) {
      return;
    }
    if (this.y ** 2n != this.x ** 3n + this.a * this.x + this.b) {
      throw new Error(`(${this.x}, ${this.y}) is not on the curve`);
    }
  }

  eq(other: Point): boolean {
    return (
      this.x == other.x &&
      this.y == other.y &&
      this.a == other.a &&
      this.b == other.b
    );
  }

  add(other: Point): Point {
    if (this.x == undefined) {
      return other;
    }
    if (this.a != other.a || this.b != other.b) {
      throw new Error(`Points (${this}, ${other}) are not on the same curve`);
    } else if (this.x == undefined || this.y == undefined) return other;
    else if (other.x == undefined || other.y == undefined) return this;
    else if (this.x == other.x && this.y != other.y)
      return new Point(undefined, undefined, 5n, 7n);
    else if (this.x != other.x) {
      const s = (other.y - this.y) / (other.x - this.x);
      let x = s ** 2n - this.x - other.x;
      let y = s * (this.x - x) - this.y;
      return new Point(x, y, this.a, this.b);
    } else {
      const s = (3n * this.x ** 2n + this.a) / (2n * this.y);
      let x = s ** 2n - 2n * this.x;
      let y = s * (this.x - x) - this.y;
      return new Point(x, y, this.a, this.b);
    }
  }
}

Point.prototype.toString = function() {
  if (this.x == undefined || this.y == undefined) {
    return 'Point(infinity)';
  } else {
    return `Point (${this.x.toString()}, ${this.y.toString()})`;
  }
};

export class ECCPoint {
  constructor(
    public x: FieldElement | undefined,
    public y: FieldElement | undefined,
    public a: FieldElement,
    public b: FieldElement
  ) {
    if (this.x instanceof FieldElement) {
      if (
        this.y!.pow(2n).num !=
        this.x!.pow(3n)
          .add(this.a.mul(this.x!))
          .add(this.b).num
      ) {
        throw new Error(
          `(${this.x!.num}, ${this.y!.num}) is not on the curve1`
        );
      }
    }
  }

  rmul(s: number | bigint): ECCPoint {
    let product: ECCPoint = new ECCPoint(undefined, undefined, this.a, this.b);
    for (let index = 0; index < s; index++) {
      product = product.add(this);
    }
    return product;
  }

  add(other: ECCPoint): ECCPoint {
    if (this.x == undefined) {
      return other;
    }
    if (other.x == undefined || other.y == undefined) {
      return this;
    }
    if (this.a.num !== other.a.num || this.b.num !== other.b.num) {
      throw new Error(`Points (${this}, ${other}) are not on the same curve`);
    }
    if (this.x.num && this.x.num !== other.x.num) {
      const s = other.y.sub(this.y!).div(other.x.sub(this.x));

      let x = s
        .pow(2n)
        .sub(this.x)
        .sub(other.x);
      let y = s.mul(this.x.sub(x)).sub(this.y!);
      return new ECCPoint(x, y, this.a, this.b);
    }
    if (this.x.num && this.x.num == other.x.num && this.y!.num == other.y.num) {
      const s = this.x
        .pow(2n)
        .rmul(3n)
        .add(this.a)
        .div(this.y!.rmul(2n));
      let x = s.pow(2n).sub(this.x.rmul(2));
      let y = s.mul(this.x.sub(x)).sub(this.y!);
      return new ECCPoint(x, y, this.a, this.b);
    }
    if (
      this.x.num &&
      this.x.num == other.x.num &&
      this.y!.num !== other.y.num
    ) {
      return new ECCPoint(undefined, undefined, this.a, this.b);
    }
    return new ECCPoint(undefined, undefined, this.a, this.b);
  }
}

export class S256Field extends FieldElement {
  //num: bigint
  constructor(num: bigint | number) {
    super(
      num,
      BigInt(
        '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f '
      )
    );
  }

  pow(e: bigint): S256Field {
    return new S256Field(super.pow(e).num);
  }

  add(fe: S256Field): S256Field {
    return new S256Field(super.add(fe).num);
  }

  sqrt(): S256Field {
    const P = BigInt(
      '115792089237316195423570985008687907853269984665640564039457584007908834671663'
    );
    const ep = (P + 1n) / 4n;
    return new S256Field(this.pow(ep).num);
  }
}

S256Field.prototype.toString = function() {
  if (this.num == undefined) {
    return 'undefined';
  } else {
    return this.num.toString(16);
  }
};

export class S256Point extends ECCPoint {
  constructor(
    public x: undefined | S256Field,
    public y: undefined | S256Field
  ) {
    super(x, y, new S256Field(0n), new S256Field(7n));
    let a = new S256Field(0n);
    let b = new S256Field(7n);
  }

  rmul(coefficient: bigint): S256Point {
    const bits = 256;
    let coef = BigInt(coefficient);
    let current = new S256Point(this.x, this.y);

    let result = new S256Point(undefined, undefined);
    for (let index = 0; index < bits; index++) {
      if (coef & 1n) {
        result = result.add(current) as S256Point;
      }
      current = current.add(current) as S256Point;
      coef = coef >> 1n;
    }

    if (typeof result.x === 'undefined') {
      return new S256Point(undefined, undefined);
    } else {
      let nx = new S256Field(result.x.num);
      let ny = new S256Field(result.y!.num);
      return new S256Point(nx, ny);
    }
  }

  sec(compressed = true) {
    if (this.x !== undefined && this.y !== undefined) {
      if (compressed) {
        //			let ba = this.x.num.toBuffer('be')
        let ba = Buffer.from(this.x.num.toString(16), 'hex');
        if (helper.mod(this.y.num, 2n) == 0) {
          let prefix = Buffer.from([2]);
          let arr = [prefix, ba];
          var buf = Buffer.concat(arr);
          return buf;
        } else {
          let prefix = Buffer.from([3]);
          let arr = [prefix, ba];
          var buf = Buffer.concat(arr);
          return buf;
        }
      } else {
        let prefix = Buffer.from([4]);
        //let nax = Buffer.alloc(8)
        //let nay = Buffer.alloc(8)
        //			let nax = this.x.num.toBuffer('be')
        //			let nay = this.y.num.toBuffer('be')
        //nax.writeBigUInt64BE(this.x.num,0)
        //nay.writeBigUInt64BE(this.y.num, 0)
        let nax = Buffer.from(this.x.num.toString(16), 'hex');
        let nay = Buffer.from(this.y.num.toString(16), 'hex');
        let arr = [prefix, nax, nay];
        return Buffer.concat(arr);
      }
    }
  }

  address(compressed = true, testnet = false) {
    const sec = this.sec(compressed);
    const h160 = Buffer.from(helper.hash160(sec), 'hex');
    if (testnet) {
      const prefix = Buffer.from([0x6f]);
      let arr = [prefix, h160];
      const raw = Buffer.concat(arr);
      const checksum = hash256(raw).slice(0, 4);
      const total = Buffer.concat([raw, checksum]);
      const address = helper.encodeBase58(total);
      return address;
    } else {
      let prefix = Buffer.from([0x00]);
      let arr = [prefix, h160];
      const raw = Buffer.concat(arr);
      const checksum = hash256(raw).slice(0, 4);
      const total = Buffer.concat([raw, checksum]);
      const address = helper.encodeBase58(total);
      return address;
    }
  }

  verify(z: bigint, sig: Signature): boolean {
    const N = BigInt(
      '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
    );

    const s_inv = helper.pow(sig.s, N - 2n, N);
    const u = helper.mod(z * s_inv, N);
    const v = helper.mod(sig.r * s_inv, N);
    const total = G.rmul(u).add(this.rmul(v));
    return total.x!.num === sig.r;
  }

  static parse(secBin: Buffer): S256Point {
    const P = BigInt(
      '115792089237316195423570985008687907853269984665640564039457584007908834671663'
    );
    if (secBin[0] == 4) {
      let x = new S256Field(BigInt('0x' + secBin.slice(1, 33).toString('hex')));
      let y = new S256Field(
        BigInt('0x' + secBin.slice(33, 65).toString('hex'))
      );
      return new S256Point(x, y);
    }
    const isEven = secBin[0] == 2;
    let x = new S256Field(
      BigInt('0x' + secBin.slice(1, secBin.length).toString('hex'))
    );
    const B = new S256Field(7);
    const alpha = x.pow(3n).add(B);
    const beta = alpha.sqrt();
    let evenBeta, oddBeta;
    if (beta.num % 2n == 0n) {
      evenBeta = beta;
      oddBeta = new S256Field(P - beta.num);
    } else {
      evenBeta = new S256Field(P - beta.num);
      oddBeta = beta;
    }
    if (isEven) {
      return new S256Point(x, evenBeta);
    } else {
      return new S256Point(x, oddBeta);
    }
  }
}

S256Point.prototype.toString = function() {
  if (this.x == undefined) {
    return 'S256Point(infinity)';
  } else {
    return `S256Point (${this.x.toString()}, ${this.y!.toString()})`;
  }
};

export const G = new S256Point(
  new S256Field(
    BigInt('0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
  ),
  new S256Field(
    BigInt('0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
  )
);
export const N = BigInt(
  '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
);

export class Signature {
  constructor(public r: bigint, public s: bigint) {}

  der(): Buffer {
    let rbin: Buffer = helper.intToBigEndian(this.r);
    let pref = Buffer.from([]);
    if (rbin[0] >= 128) {
      pref = Buffer.from([0]);
      rbin = Buffer.concat([pref, rbin]);
    }
    //let result = Buffer.alloc(34);
    pref = Buffer.from([2, rbin.length]);
    let result = Buffer.concat([pref, rbin]);

    let sbin = helper.intToBigEndian(this.s);
    if (sbin[0] >= 128) {
      pref = Buffer.from([0]);
      sbin = Buffer.concat([pref, sbin]);
    }
    pref = Buffer.from([2, sbin.length]);
    result = Buffer.concat([result, pref, sbin]);
    pref = Buffer.from([0x30, result.length]);
    result = Buffer.concat([pref, result]);
    return result;
  }

  static parse(sig: Buffer): Signature {
    let ss = new Readable();
    ss.push(sig);
    ss.push(null);

    const compound = ss.read(1)[0];
    if (compound != 0x30) {
      throw new Error('Bad Signature');
    }
    const length = ss.read(1)[0];
    if (length + 2 != sig.length) {
      throw new Error('Bad Signature Length');
    }
    let marker = ss.read(1)[0];
    if (marker != 0x02) {
      throw new Error('Bad Signature');
    }
    const rlength = ss.read(1)[0];
    const r = ss.read(rlength);
    marker = ss.read(1)[0];
    if (marker != 0x02) {
      throw new Error('Bad Signature');
    }
    const slength = ss.read(1)[0];
    const s = ss.read(slength);
    if (sig.length != rlength + slength + 6) {
      throw new Error('Signature too long');
    }
    return new Signature(
      BigInt('0x' + r.toString('hex')),
      BigInt('0x' + s.toString('hex'))
    );
  }
}

export class PrivateKey {
  point: S256Point;
  constructor(public secret: bigint) {
    this.secret = BigInt(secret);
    this.point = G.rmul(BigInt(secret));
  }

  sign(z: bigint): Signature {
    const k = 400n;

    let r = G.rmul(k).x!.num;
    const k_inv = helper.pow(k, N - 2n, N);
    let s = helper.mod((r * this.secret + z) * k_inv, N);
    if (s > N / 2n) {
      s = N - s;
    }
    return new Signature(r, s);
  }
}

function parseHexString(str: string): number[] {
  var result = [];
  while (str.length >= 8) {
    result.push(parseInt(str.substring(0, 8), 16));

    str = str.substring(8, str.length);
  }

  return result;
}
