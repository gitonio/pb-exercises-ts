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

describe('FieldElement', function() {
  var newNum = new FieldElement(2, 3);
  it('constructor with valid args', function() {
    assert.equal(newNum.num, 2n);
    assert.equal(newNum.prime, 3n);
  });

  it('constructor with invalid args', function() {
    var x = -22;
    var y = 3n;
    expect(function() {
      new FieldElement(x, y);
    }).to.throw(`Num ${x} not in field range 0 to ${y - 1n}`);
  });

  it('test_ne', function() {
    let a = new FieldElement(2, 31);
    let b = new FieldElement(2, 31);
    let c = new FieldElement(15, 31);
    assert.equal(a.equals(b), true);
    assert.equal(a.equals(c), false);
  });

  it('test_add', function() {
    let a = new FieldElement(2, 31);
    let b = new FieldElement(15, 31);
    assert.deepEqual(a.add(b), new FieldElement(17, 31));
    a = new FieldElement(17, 31);
    b = new FieldElement(21, 31);
    assert.deepEqual(a.add(b), new FieldElement(7, 31));
  });

  it('test_sub', function() {
    let a = new FieldElement(29, 31);
    let b = new FieldElement(4, 31);
    assert.deepEqual(a.sub(b), new FieldElement(25, 31));
    a = new FieldElement(15, 31);
    b = new FieldElement(30, 31);
    assert.deepEqual(a.sub(b), new FieldElement(16, 31));
  });

  it('test_mul', function() {
    let a = new FieldElement(24, 31);
    let b = new FieldElement(19, 31);
    assert.deepEqual(a.mul(b), new FieldElement(22, 31));
  });

  it('rmul', function() {
    let a = new FieldElement(24, 31);
    let b = 2n;
    assert.deepEqual(a.rmul(b), a.add(a));
  });

  it('test_pow', function() {
    let a = new FieldElement(17, 31);
    let b = 3n;
    assert.deepEqual(a.pow(b), new FieldElement(15, 31));
    let c = new FieldElement(5, 31);
    let d = new FieldElement(18, 31);
    assert.deepEqual(c.pow(5n).mul(d), new FieldElement(16, 31));
  });

  it('test_div', function() {
    let a = new FieldElement(3, 31);
    let b = new FieldElement(24, 31);
    assert.deepEqual(a.div(b), new FieldElement(4, 31));
    a = new FieldElement(17, 31);
    assert.deepEqual(a.pow(-3n), new FieldElement(29, 31));
    a = new FieldElement(4, 31);
    b = new FieldElement(11, 31);
    assert.deepEqual(a.pow(-4n).mul(b), new FieldElement(13, 31));
  });
});

describe('Point', function() {
  let x = -2;
  let y = 4;
  it('should validate curve', function() {
    expect(function() {
      let p = new Point(-2, 4, 5, 7);
    }).to.throw(`(${x}, ${y}) is not on the curve`);
    expect(function() {
      new Point(3, -7, 5, 7);
    }).to.not.throw();
    expect(function() {
      new Point(18, 77, 5, 7);
    }).to.not.throw();
  });

  it('test_add0', function() {
    var a = new Point(undefined, undefined, 5, 7);
    var b = new Point(2, 5, 5, 7);
    var c = new Point(2, -5, 5, 7);
    assert.deepEqual(a.add(b), b);
    assert.deepEqual(b.add(a), b);
    assert.deepEqual(b.add(c), a);
  });
  it('test_add1', function() {
    let a = new Point(3, 7, 5, 7);
    let b = new Point(-1, -1, 5, 7);
    let c = new Point(2, -5, 5, 7);
    assert.deepEqual(a.add(b), c);
  });
  it('test_add2', function() {
    let a = new Point(-1, 1, 5, 7);
    let b = new Point(18, -77, 5, 7);
    assert.deepEqual(a.add(a), b);
  });
});

describe('ECC', function() {
  it('test_on_curve', function() {
    const prime = 223;
    let a = new FieldElement(0, prime);
    let b = new FieldElement(7, prime);
    const valid_points = [
      { x: 192, y: 105 },
      { x: 17, y: 56 },
      { x: 1, y: 193 }
    ];
    const invalid_points = [
      { x: 200, y: 119 },
      { x: 42, y: 99 }
    ];
    valid_points.map(obj => {
      let x = new FieldElement(obj.x, prime);
      let y = new FieldElement(obj.y, prime);
      expect(function() {
        new ECCPoint(x, y, a, b);
      }).to.not.throw();
    });
    invalid_points.map(obj => {
      let x = new FieldElement(obj.x, prime);
      let y = new FieldElement(obj.y, prime);
      expect(function() {
        let p = new ECCPoint(x, y, a, b);
      }).to.throw(`(${x.num}, ${y.num}) is not on the curve`);
    });
  });

  it('test_add0', function() {
    const prime = 223;
    const a1 = new FieldElement(0, prime);
    const b1 = new FieldElement(7, prime);
    const x1 = new FieldElement(192, prime);
    const y1 = new FieldElement(105, prime);
    const p1 = new ECCPoint(x1, y1, a1, b1);
    const a2 = new FieldElement(0, prime);
    const b2 = new FieldElement(7, prime);
    const x2 = new FieldElement(17, prime);
    const y2 = new FieldElement(56, prime);
    const p2 = new ECCPoint(x2, y2, a2, b2);
    p1.add(p2);
    p1.add(p1);
  });

  it('test_add1', function() {
    const prime = 223;
    const a = new FieldElement(0, prime);
    const b = new FieldElement(7, prime);
    const additions = [
      [
        { x: 192, y: 105 },
        { x: 17, y: 56 },
        { x: 170, y: 142 }
      ],
      [
        { x: 47, y: 71 },
        { x: 117, y: 141 },
        { x: 60, y: 139 }
      ],
      [
        { x: 143, y: 98 },
        { x: 76, y: 66 },
        { x: 47, y: 71 }
      ]
    ];
    additions.map(obj => {
      const x1 = new FieldElement(obj[0].x, prime);
      const y1 = new FieldElement(obj[0].y, prime);
      const p1 = new ECCPoint(x1, y1, a, b);
      const x2 = new FieldElement(obj[1].x, prime);
      const y2 = new FieldElement(obj[1].y, prime);
      const p2 = new ECCPoint(x2, y2, a, b);
      const x3 = new FieldElement(obj[2].x, prime);
      const y3 = new FieldElement(obj[2].y, prime);
      const p3 = new ECCPoint(x3, y3, a, b);
      assert.deepEqual(p1.add(p2), p3);
    });
  });

  it('test_rmul', function() {
    const prime = 223;
    const a = new FieldElement(0, prime);
    const b = new FieldElement(7, prime);
    const multiplications = [
      { s: 2, x1: 192, y1: 105, x2: 49, y2: 71 },
      { s: 2, x1: 143, y1: 98, x2: 64, y2: 168 },
      { s: 2, x1: 47, y1: 71, x2: 36, y2: 111 },
      { s: 4, x1: 47, y1: 71, x2: 194, y2: 51 },
      { s: 8, x1: 47, y1: 71, x2: 116, y2: 55 },
      { s: 21, x1: 47, y1: 71, x2: undefined, y2: undefined }
    ];
    multiplications.map(obj => {
      const s = obj.s;
      const x1 = new FieldElement(obj.x1, prime);
      const y1 = new FieldElement(obj.y1, prime);
      const a = new FieldElement(0, prime);
      const b = new FieldElement(7, prime);
      const p1 = new ECCPoint(x1, y1, a, b);
      let p2: ECCPoint;
      if (obj.x2 == undefined) {
        p2 = new ECCPoint(undefined, undefined, a, b);
      } else {
        const x2 = new FieldElement(obj.x2, prime);
        const y2 = new FieldElement(obj.y2, prime);
        p2 = new ECCPoint(x2, y2, a, b);
      }
      assert.deepEqual(p1.rmul(s), p2);
    });
  });
});

describe('S256Test', function() {
  it('test_order2', function() {
    let x = new S256Field(
      BigInt(
        '0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
      )
    );
    let y = new S256Field(
      BigInt(
        '0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'
      )
    );
    let G = new S256Point(x, y);

    let N = BigInt(
      '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
    );
    let nn = G.rmul(N);
    assert.isUndefined(nn.x);
  });

  it('test_pubpoint', function() {
    let G = new S256Point(
      new S256Field(
        BigInt(
          '0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
        )
      ),
      new S256Field(
        BigInt(
          '0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'
        )
      )
    );
    let secret1 = Math.pow(2, 128);
    let points = [
      {
        secret: 7,
        x: '0x5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc',
        y: '0x6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da'
      },
      {
        secret: 1485,
        x: '0xc982196a7466fbbbb0e27a940b6af926c1a74d5ad07128c82824a11b5398afda',
        y: '0x7a91f9eae64438afb9ce6448a1c133db2d8fb9254e4546b6f001637d50901f55'
      },
      {
        secret: '340282366920938463463374607431768211456',
        x: '0x8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da',
        y: '0x662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82'
      },
      {
        secret:
          '1766847064778384329583297500742918515827483896875618958121606203440103424',
        x: '0x9577ff57c8234558f293df502ca4f09cbc65a6572c842b39b366f21717945116',
        y: '0x10b49c67fa9365ad7b90dab070be339a1daf9052373ec30ffae4f72d5e66d053'
      }
    ];
    points.map(obj => {
      let point = new S256Point(
        new S256Field(BigInt(obj.x)),
        new S256Field(BigInt(obj.y))
      );
      let res = G.rmul(BigInt(obj.secret));
      assert.equal(res.x!.num.toString(16), point.x!.num.toString(16));
      //assert.deepEqual(res.x.num, point.x.num)
    });
  });

  it('test_sec', function() {
    let coefficient = BigInt(Math.pow(999, 3));
    let uncompressed = BigInt(
      '0x049d5ca49670cbe4c3bfa84c96a8c87df086c6ea6a24ba6b809c9de234496808d56fa15cc7f3d38cda98dee2419f415b7513dde1301f8643cd9245aea7f3f911f9'
    );
    let compressed = BigInt(
      '0x039d5ca49670cbe4c3bfa84c96a8c87df086c6ea6a24ba6b809c9de234496808d5'
    );
    let point = G.rmul(coefficient);
    assert.deepEqual(
      point.sec(false),
      Buffer.from(
        '049d5ca49670cbe4c3bfa84c96a8c87df086c6ea6a24ba6b809c9de234496808d56fa15cc7f3d38cda98dee2419f415b7513dde1301f8643cd9245aea7f3f911f9',
        'hex'
      )
    );
    assert.deepEqual(
      point.sec(true),
      Buffer.from(
        '039d5ca49670cbe4c3bfa84c96a8c87df086c6ea6a24ba6b809c9de234496808d5',
        'hex'
      )
    );

    coefficient = BigInt(123);
    point = G.rmul(coefficient);
    assert.deepEqual(
      point.sec(false),
      Buffer.from(
        '04a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b',
        'hex'
      )
    );
    assert.deepEqual(
      point.sec(true),
      Buffer.from(
        '03a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5',
        'hex'
      )
    );

    coefficient = BigInt(42424242);
    point = G.rmul(coefficient);
    assert.deepEqual(
      point.sec(false),
      Buffer.from(
        '04aee2e7d843f7430097859e2bc603abcc3274ff8169c1a469fee0f20614066f8e21ec53f40efac47ac1c5211b2123527e0e9b57ede790c4da1e72c91fb7da54a3',
        'hex'
      )
    );
    assert.deepEqual(
      point.sec(true),
      Buffer.from(
        '03aee2e7d843f7430097859e2bc603abcc3274ff8169c1a469fee0f20614066f8e',
        'hex'
      )
    );
  });

  it('mainnet_address', function() {
    const secret = BigInt(Math.pow(888, 3));
    const point = G.rmul(secret);
    const mainnetAddress = '148dY81A9BmdpMhvYEVznrM45kWN32vSCN';
    assert.deepEqual(point.address(true, false), mainnetAddress);
  });

  it('testnet_address', function() {
    const secret = BigInt(Math.pow(888, 3));
    const point = G.rmul(secret);
    const testnetAddress = 'mieaqB68xDCtbUBYFoUNcmZNwk74xcBfTP';
    assert.deepEqual(point.address(true, true), testnetAddress);
  });

  it('mainnet_address_321', function() {
    const secret = 321n;
    const point = G.rmul(secret);
    const mainnetAddress = '1S6g2xBJSED7Qr9CYZib5f4PYVhHZiVfj';
    assert.deepEqual(point.address(false, false), mainnetAddress);
  });

  it('testnet_address_321', function() {
    const secret = 321n;
    const point = G.rmul(secret);
    const testnetAddress = 'mfx3y63A7TfTtXKkv7Y6QzsPFY6QCBCXiP';
    assert.deepEqual(point.address(false, true), testnetAddress);
  });

  it('mainnet_address_42', function() {
    const secret = 4242424242n;
    const point = G.rmul(secret);
    const mainnetAddress = '1226JSptcStqn4Yq9aAmNXdwdc2ixuH9nb';
    assert.deepEqual(point.address(false, false), mainnetAddress);
  });

  it('testnet_address_42', function() {
    const secret = 4242424242n;
    const point = G.rmul(secret);
    const testnetAddress = 'mgY3bVusRUL6ZB2Ss999CSrGVbdRwVpM8s';
    assert.deepEqual(point.address(false, true), testnetAddress);
  });

  it('test_verify', function() {
    const point = new S256Point(
      new S256Field(
        BigInt(
          '0x887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06c'
        )
      ),
      new S256Field(
        BigInt(
          '0x61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34'
        )
      )
    );

    let z = BigInt(
      '0xec208baa0fc1c19f708a9ca96fdeff3ac3f230bb4a7ba4aede4942ad003c0f60'
    );
    let r = BigInt(
      '0xac8d1c87e51d0d441be8b3dd5b05c8795b48875dffe00b7ffcfac23010d3a395'
    );
    let s = BigInt(
      '0x68342ceff8935ededd102dd876ffd6ba72d6a427a3edb13d26eb0781cb423c4'
    );
    assert.ok(point.verify(z, new Signature(r, s)));
    z = BigInt(
      '0x7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d'
    );
    r = BigInt(
      '0xeff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c'
    );
    s = BigInt(
      '0xc7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6'
    );
    assert.ok(point.verify(z, new Signature(r, s)));
  });

  it('test parse', function() {
    const sec = Buffer.from(
      '0349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278a',
      'hex'
    );
    const point = S256Point.parse(sec);
    const want = BigInt(
      '0xa56c896489c71dfc65701ce25050f542f336893fb8cd15f4e8e5c124dbf58e47'
    );
    assert.equal(point.y!.num.toString(16), want.toString(16));
  });
});

describe('signature', function() {
  const testCases = [
    { r: 1, s: 2 },
    { r: Math.floor(Math.random() * 10), s: Math.floor(Math.random() * 10) },
    { r: Math.floor(Math.random() * 10), s: Math.floor(Math.random() * 10) }
  ];

  it('sig', function() {
    testCases.map(obj => {
      const sig = new Signature(BigInt(obj.r), BigInt(obj.s));
      const der = sig.der();
      const sig2 = Signature.parse(der);

      assert.equal(sig2.r.toString(10), obj.r.toString(10));
    });
  });
});

describe('PrivateKeyTest', function() {
  it('test_sign', function() {
    const pk = new PrivateKey(BigInt(Math.floor(Math.random() * 10)));
    const z = BigInt(Math.floor(Math.random() * 10))
    const sig = pk.sign(z);
    assert.ok(pk.point.verify(z, sig));
  });
});
