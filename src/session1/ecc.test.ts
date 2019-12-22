import { assert, expect } from 'chai';
import { FieldElement, Point } from './ecc';

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
    //b = -3;
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
      let p = new Point(x, y, 5, 7);
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

/*
describe('ECC', function() {
	
	it('test_on_curve', function () {
		prime = 223;
		a = new ecc.FieldElement(0, prime);
		b = new ecc.FieldElement(7, prime);
		valid_points =   [ {x:192,y:105}, {x:17,y:56}, {x:1,y:193}];
		invalid_points = [ {x:200,y:119}, {x:42,y:99}];
		valid_points.map(obj => {
			x = new ecc.FieldElement(obj.x, prime);
			y = new ecc.FieldElement(obj.y, prime);
			expect( function() {new ecc.Point(x, y, a, b)}).to.not.throw()
		})
		invalid_points.map(obj => {
			x = new ecc.FieldElement(obj.x, prime);
			y = new ecc.FieldElement(obj.y, prime);
			expect( function() {p = new ecc.Point(x, y, a, b); }).to.throw(`(${x.num}, ${y.num}) is not on the curve`)
		})		
	})
	it('test_add0', function() {
		prime = 223;
		a1 = new ecc.FieldElement(0, prime);
		b1 = new ecc.FieldElement(7, prime);
		x1 = new ecc.FieldElement(192, prime);
		y1 = new ecc.FieldElement(105, prime);
		p1 = new ecc.Point(x1, y1, a1, b1);
		a2 = new ecc.FieldElement(0, prime);
		b2 = new ecc.FieldElement(7, prime);
		x2 = new ecc.FieldElement(17, prime);
		y2 = new ecc.FieldElement(56, prime);
		p2 = new ecc.Point(x2, y2, a2, b2);
		p1.add(p2);
		p1.add(p1);
	})
	it('test_add1', function() {
		prime = 223;
		a = new ecc.FieldElement(0, prime);
		b = new ecc.FieldElement(7, prime);
		additions =   [[ {x:192,y:105}, {x:17,y:56}, {x:170,y:142} ],
		[ {x:47,y:71}, {x:117,y:141}, {x:60,y:139} ],
		[ {x:143,y:98}, {x:76,y:66}, {x:47,y:71} ]]
		additions.map(obj => {
			x1 = new ecc.FieldElement(obj[0].x, prime);
			y1 = new ecc.FieldElement(obj[0].y, prime);
			p1 = new ecc.Point(x1, y1, a, b);
			x2 = new ecc.FieldElement(obj[1].x, prime);
			y2 = new ecc.FieldElement(obj[1].y, prime);
			p2 = new ecc.Point(x2, y2, a, b);
			x3 = new ecc.FieldElement(obj[2].x, prime);
			y3 = new ecc.FieldElement(obj[2].y, prime);
			p3 = new ecc.Point(x3, y3, a, b);
			assert.deepEqual(p1.add(p2), p3)
		})
	})
	
	it('test_rmul', function() {
		prime = 223;
		a = new ecc.FieldElement(0, prime);
		b = new ecc.FieldElement(7, prime);
		multiplications = [
			{s:2,x1:192,y1:105,x2:49,y2:71},
			{s:2,x1:143,y1:98,x2:64,y2:168},
			{s:2,x1:47,y1:71,x2:36,y2:111},
			{s:4,x1:47,y1:71,x2:194,y2:51},  
			{s:8,x1:47,y1:71,x2:116,y2:55},
			{s:21,x1:47,y1:71,x2:undefined,y2:undefined},			
		] 
		multiplications.map(obj =>{
			s = obj.s;
			x1 = new ecc.FieldElement(obj.x1, prime);
			y1 = new ecc.FieldElement(obj.y1, prime);
			a = new ecc.FieldElement(0, prime);
			b = new ecc.FieldElement(7, prime);
			p1 = new ecc.Point(x1, y1, a, b);
			x2 = new ecc.FieldElement(obj.x2, prime);
			y2 = new ecc.FieldElement(obj.y2, prime);
			p2 = new ecc.Point(x2, y2, a, b);
			assert.deepEqual(p1.rmul(s), p2);
		})
	})
	
});
*/
/*
describe('S256Test', function() {

	it('test_order2', function() {
		G = new ecc.S256Point(
			new BN('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16),
			new BN('483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8', 16));		
		//G = new ecc.S256Point(
		//	new BN(47),
		//	new BN(71), prime=new BN(223));		
	
		N = new BN('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 16);
		nn = G.rmul(N);
		assert.isUndefined(nn.num); 
		
	})

	it('test_pubpoint', function() {
		G = new ecc.S256Point(
			new BN('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16),
			new BN('483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8', 16));	
		let secret1 = Math.pow(2,128);	
		points = [
			{secret: 7, x: '5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc', y: '6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da'},
            {secret:1485, x: 'c982196a7466fbbbb0e27a940b6af926c1a74d5ad07128c82824a11b5398afda', y: '7a91f9eae64438afb9ce6448a1c133db2d8fb9254e4546b6f001637d50901f55'},
            {secret: '340282366920938463463374607431768211456', x: '8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da', y: '662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82'},
            {secret: '1766847064778384329583297500742918515827483896875618958121606203440103424', x: '9577ff57c8234558f293df502ca4f09cbc65a6572c842b39b366f21717945116', y: '10b49c67fa9365ad7b90dab070be339a1daf9052373ec30ffae4f72d5e66d053'}

		]
		points.map(obj => {
			point = new ecc.S256Point(new BN(obj.x, 16), new BN(obj.y, 16));
			let res = G.rmul(new BN(obj.secret));
			assert.equal(res.x.num.toString(16), point.x.num.toString(16))
			//assert.deepEqual(res.x.num, point.x.num)
		})
	})

	it('test_sec', function() {
		G = new ecc.S256Point(
			new BN('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16),
			new BN('483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8', 16));		

		let coefficient = new BN(Math.pow(999,3));
		let uncompressed = new BN('049d5ca49670cbe4c3bfa84c96a8c87df086c6ea6a24ba6b809c9de234496808d56fa15cc7f3d38cda98dee2419f415b7513dde1301f8643cd9245aea7f3f911f9', 16);
		let compressed = new BN('039d5ca49670cbe4c3bfa84c96a8c87df086c6ea6a24ba6b809c9de234496808d5', 16);
		point = G.rmul(coefficient);
		assert.deepEqual(point.sec(false), uncompressed.toBuffer('be'))
		assert.deepEqual(point.sec(true), compressed.toBuffer('be'))

		coefficient = new BN(123);
		uncompressed = new BN('04a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b', 16);
		compressed = new BN('03a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5', 16);
		point = G.rmul(coefficient);
		assert.deepEqual(point.sec(false), uncompressed.toBuffer('be'))
		assert.deepEqual(point.sec(true), compressed.toBuffer('be'))
		
		coefficient = new BN(42424242);
		uncompressed = new BN('04aee2e7d843f7430097859e2bc603abcc3274ff8169c1a469fee0f20614066f8e21ec53f40efac47ac1c5211b2123527e0e9b57ede790c4da1e72c91fb7da54a3', 16);
		compressed = new BN('03aee2e7d843f7430097859e2bc603abcc3274ff8169c1a469fee0f20614066f8e', 16);
		point = G.rmul(coefficient);
		assert.deepEqual(point.sec(false), uncompressed.toBuffer('be'))
		assert.deepEqual(point.sec(true), compressed.toBuffer('be'))

	})
	
	
	G = new ecc.S256Point(
	new BN('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16),
	new BN('483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8', 16));	
				
			
	it('mainnet_address', function () {
		secret = Math.pow(888,3);
		point = G.rmul(secret);
		mainnetAddress = '148dY81A9BmdpMhvYEVznrM45kWN32vSCN';
		assert.deepEqual(
			point.address(true, false), mainnetAddress
		)
	})
		
	
		
		it('testnet_address', function () {
			secret = Math.pow(888,3);
			point = G.rmul(secret);
			testnetAddress = 'mieaqB68xDCtbUBYFoUNcmZNwk74xcBfTP';
			assert.deepEqual(
				point.address(true, true), testnetAddress
			)
		})
		
		it('mainnet_address_321', function () {
			secret = 321;
			point = G.rmul(secret);
			mainnetAddress = '1S6g2xBJSED7Qr9CYZib5f4PYVhHZiVfj';
			assert.deepEqual(
				point.address(false, false), mainnetAddress
			)
		})
		
		it('testnet_address_321', function () {
			secret = 321;
			point = G.rmul(secret);
			testnetAddress = 'mfx3y63A7TfTtXKkv7Y6QzsPFY6QCBCXiP';
			assert.deepEqual(
				point.address(false, true), testnetAddress
			)
		})
		
		it('mainnet_address_42', function () {
			secret = 4242424242;
			point = G.rmul(secret);
			mainnetAddress = '1226JSptcStqn4Yq9aAmNXdwdc2ixuH9nb';
			assert.deepEqual(
				point.address(false, false), mainnetAddress
			)
		})
		
		it('testnet_address_42', function () {
			secret = 4242424242;
			point = G.rmul(secret);
			testnetAddress = 'mgY3bVusRUL6ZB2Ss999CSrGVbdRwVpM8s';
			assert.deepEqual(
				point.address(false, true), testnetAddress
			)
		})
		
		it('test verify', function () {
			point = new ecc.S256Point(
				new BN('887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06c', 16),
				new BN('61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34', 16));
			z = new BN('ec208baa0fc1c19f708a9ca96fdeff3ac3f230bb4a7ba4aede4942ad003c0f60', 16);
			r = new BN('ac8d1c87e51d0d441be8b3dd5b05c8795b48875dffe00b7ffcfac23010d3a395', 16)
			s = new BN('68342ceff8935ededd102dd876ffd6ba72d6a427a3edb13d26eb0781cb423c4', 16);
			assert.ok(point.verify(z, new ecc.Signature(r, s)))
			z = new BN('7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d', 16);
			r = new BN('eff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c', 16);
			s = new BN('c7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6', 16);
			assert.ok(point.verify(z, new ecc.Signature(r, s)))
		})

		it('test parse', function() {
			sec = Buffer.from('0349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278a','hex')
			point = ecc.S256Point.parse(sec)
			want = new BN('a56c896489c71dfc65701ce25050f542f336893fb8cd15f4e8e5c124dbf58e47', 16)
			assert.equal(point.y.num.toString(16), want.toString(16))
		})
})

describe ('signature', function() {
	it('sig', function() {
		sig = new ecc.Signature(new BN(19), new BN(23));
		der = sig.der(); 
		sig2 = ecc.Signature.parse(der);
		assert.equal(sig.r.toString(16), sig2.r.toString(16));
		assert.equal(sig.s.toString(16), sig2.s.toString(16));
	})
})

describe('PrivateKeyTest', function() {
	it('test_sign', function() {
		let sec1 = new BN(22)
		pk = new ecc.PrivateKey( sec1 );
		z1 = new BN(23);
		sig = pk.sign(z1);
		assert.ok(pk.point.verify(z1,sig)); 
	})

	it('test wif', function() {
		let secret = new BN('115792089237316194620101962879192770082288938495059262778356087116516711989248',10);
		pk = new ecc.PrivateKey(secret);
		let expected = 'L5oLkpV3aqBJ4BgssVAsax1iRa77G5CVYnv9adQ6Z87te7TyUdSC';
		assert.equal(pk.wif(true,false), expected)
	})
})

*/
