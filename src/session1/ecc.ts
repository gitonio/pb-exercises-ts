//https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
var hash = require('hash.js');
var helper = require('./helper');
var Readable = require('stream').Readable;

export class FieldElement {
  num: bigint;
  prime: bigint;

  constructor(n: bigint | number, p: bigint | number) {
    if (n == undefined) {
      this.num = 0n;
      this.prime = BigInt(p);
    } else {
      this.num = typeof n === 'bigint' ? n : BigInt(n);
      this.prime = BigInt(p);
    }
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

  pow(f: bigint): FieldElement {
    let num;
    if (f < 0) {
      num = helper.pow(
        helper.pow(this.num, -BigInt(f), this.prime),
        this.prime - 2n,
        this.prime
      );
    } else if (typeof f === 'bigint') {
      num = helper.pow(this.num, f, this.prime);
    } else {
      num = helper.pow(this.num, BigInt(f), this.prime);
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
    this.x = _x === undefined && typeof _x !== 'bigint' ? _x : BigInt(_x);
    this.y = _y === undefined && typeof _y !== 'bigint' ? _y : BigInt(_y);
    this.a = typeof _a === 'bigint' ? _a : BigInt(_a);
    this.b = typeof _b === 'bigint' ? _b : BigInt(_b);
    /*
    if (x instanceof FieldElement) {
      if (this.x.num == undefined) {
        return;
      }
      if (
        !this.y.pow(2).num.eq(
          this.x
            .pow(3)
            .add(this.a.mul(this.x))
            .add(this.b).num
        )
      ) {
        throw new Error(`(${this.x.num}, ${this.y.num}) is not on the curve1`);
      }
    } else {
			*/
    if (this.x === undefined || this.y === undefined) {
      return;
    }
    if (this.y ** 2n != this.x ** 3n + this.a * this.x + this.b) {
      throw new Error(`(${this.x}, ${this.y}) is not on the curve`);
    }
  }

  eq(other: Point): boolean {
    /*
		if (x instanceof FieldElement) {
      return (
        this.x.equals(other.x) &&
        this.y.equals(other.y) &&
        this.a.equals(other.a) &&
        this.b.equals(other.b)
      );
    } else {
	*/
    return (
      this.x == other.x &&
      this.y == other.y &&
      this.a == other.a &&
      this.b == other.b
    );
    //}
  }

  add(other: Point): Point {
    /*
		if (this.x instanceof FieldElement) {
			if (this.x.num == undefined) {
				return other;
			}
			if (other.x.num == undefined) {
				return this;
			}
			if (!this.a.num.eq(other.a.num) || !this.b.num.eq(other.b.num)) {
				throw new Error(`Points (${this}, ${other}) are not on the same curve`)
			}
			if (this.x.num && !this.x.num.eq(other.x.num)) {
				const s = other.y.sub(this.y).div(other.x.sub(this.x));

				let x = s.pow(2).sub(this.x).sub(other.x);
				let y = s.mul(this.x.sub(x)).sub(this.y);
				return new Point(x, y, this.a, this.b);

			}
			if (this.x.num && this.x.num.eq(other.x.num) && this.y.num.eq(other.y.num)) {
				const s = (this.x.pow(2).rmul(3).add(this.a)).div(this.y.rmul(2));
				let x = s.pow(2).sub(this.x.rmul(2));
				let y = s.mul(this.x.sub(x)).sub(this.y);
				return new Point(x, y, this.a, this.b);
			}
			if (this.x.num && this.x.num.eq(other.x.num) && !this.y.num.eq(other.y.num)) {
				return new Point(new FieldElement(undefined, this.x.prime),
					new FieldElement(undefined, this.x.prime),
					this.a, this.b)
			}
		} else {
			*/
    //Real
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

    //}
  }

  /*
	rmul(coefficient) {
		if (this.x instanceof FieldElement || BN.isBN(this.x.num)) {
			x1 = new FieldElement(undefined, this.x.prime);
			y1 = new FieldElement(undefined, this.x.prime);
			let product = new Point(x1, y1, this.a, this.b);
			for (let index = 0; index < coefficient; index++) {

				product = product.add(this);

			}
			return product;
		}
	}
	*/
}

Point.prototype.toString = function() {
  if (this.x == undefined || this.y == undefined) {
    return 'Point(infinity)';
  } else {
    return `Point (${this.x.toString()}, ${this.y.toString()})`;
  }
};
