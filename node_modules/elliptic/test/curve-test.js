var assert = require('assert');
var bn = require('bn.js');
var elliptic = require('../');

describe('Curve', function() {
  it('should work with example curve', function() {
    var curve = new elliptic.curve.short({
      p: '1d',
      a: '4',
      b: '14'
    });

    var p = curve.point('18', '16');
    assert(p.validate());
    assert(p.dbl().validate());
    assert(p.dbl().add(p).validate());
    assert(p.dbl().add(p.dbl()).validate());
    assert(p.dbl().add(p.dbl()).eq(p.add(p).add(p).add(p)));
  });

  it('should work with secp112k1', function() {
    var curve = new elliptic.curve.short({
      p: 'db7c 2abf62e3 5e668076 bead208b',
      a: 'db7c 2abf62e3 5e668076 bead2088',
      b: '659e f8ba0439 16eede89 11702b22'
    });

    var p = curve.point(
      '0948 7239995a 5ee76b55 f9c2f098',
      'a89c e5af8724 c0a23e0e 0ff77500');
    assert(p.validate());
    assert(p.dbl().validate());
  });

  it('should work with secp256k1', function() {
    var curve = new elliptic.curve.short({
      p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ' +
             'fffffc2f',
      a: '0',
      b: '7',
      n: 'ffffffff ffffffff ffffffff fffffffe ' +
             'baaedce6 af48a03b bfd25e8c d0364141',
      g: [
        '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
        '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'
      ]
    });

    var p = curve.point(
      '79be667e f9dcbbac 55a06295 ce870b07 029bfcdb 2dce28d9 59f2815b 16f81798',
      '483ada77 26a3c465 5da4fbfc 0e1108a8 fd17b448 a6855419 9c47d08f fb10d4b8'
    );
    assert(p.validate());
    assert(p.dbl().validate());
    assert(p.toJ().dbl().toP().validate());
    assert(p.mul(new bn('79be667e f9dcbbac 55a06295 ce870b07', 16)).validate());

    var j = p.toJ();
    assert(j.trpl().eq(j.dbl().add(j)));

    // Endomorphism test
    assert(curve.endo);
    assert.equal(
      curve.endo.beta.fromRed().toString(16),
      '7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee');
    assert.equal(
      curve.endo.lambda.toString(16),
      '5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72');

    var k = new bn('1234567890123456789012345678901234', 16);
    var split = curve._endoSplit(k);
    assert.equal(
      split.k1.add(split.k2.mul(curve.endo.lambda)).mod(curve.n).toString(16),
      k.toString(16));
  });

  it('should compute this problematic secp256k1 multiplication', function() {
    var curve = elliptic.curves.secp256k1.curve;
    var g1 = curve.g; // precomputed g
    assert(g1.precomputed);
    var g2 = curve.point(g1.getX(), g1.getY()); // not precomputed g
    assert(!g2.precomputed);
    var a = new bn(
        '6d1229a6b24c2e775c062870ad26bc261051e0198c67203167273c7c62538846', 16);
    var p1 = g1.mul(a);
    var p2 = g2.mul(a);
    assert(p1.eq(p2));
  });

  it('should not use fixed NAF when k is too large', function() {
    var curve = elliptic.curves.secp256k1.curve;
    var g1 = curve.g; // precomputed g
    assert(g1.precomputed);
    var g2 = curve.point(g1.getX(), g1.getY()); // not precomputed g
    assert(!g2.precomputed);

    var a = new bn(
        '6d1229a6b24c2e775c062870ad26bc26' +
            '1051e0198c67203167273c7c6253884612345678',
        16);
    var p1 = g1.mul(a);
    var p2 = g2.mul(a);
    assert(p1.eq(p2));
  });

  it('should not fail on secp256k1 regression', function() {
    var curve = elliptic.curves.secp256k1.curve;
    var k1 = new bn(
        '32efeba414cd0c830aed727749e816a01c471831536fd2fce28c56b54f5a3bb1', 16);
    var k2 = new bn(
        '5f2e49b5d64e53f9811545434706cde4de528af97bfd49fde1f6cf792ee37a8c', 16);

    var p1 = curve.g.mul(k1);
    var p2 = curve.g.mul(k2);

    // 2 + 2 + 1 = 2 + 1 + 2
    var two = p2.dbl();
    var five = two.dbl().add(p2);
    var three = two.add(p2);
    var maybeFive = three.add(two);

    assert(maybeFive.eq(five));

    p1 = p1.mul(k2);
    p2 = p2.mul(k1);

    assert(p1.validate());
    assert(p2.validate());
    assert(p1.eq(p2));
  });

  it('should correctly double the affine point on secp256k1', function() {
    var bad = {
      x: '026a2073b1ef6fab47ace18e60e728a05180a82755bbcec9a0abc08ad9f7a3d4',
      y: '9cd8cb48c3281596139f147c1364a3ede88d3f310fdb0eb98c924e599ca1b3c9',
      z: 'd78587ad45e4102f48b54b5d85598296e069ce6085002e169c6bad78ddc6d9bd'
    };

    var good = {
      x: 'e7789226739ac2eb3c7ccb2a9a910066beeed86cdb4e0f8a7fee8eeb29dc7016',
      y: '4b76b191fd6d47d07828ea965e275b76d0e3e0196cd5056d38384fbb819f9fcb',
      z: 'cbf8d99056618ba132d6145b904eee1ce566e0feedb9595139c45f84e90cfa7d'
    };

    var curve = elliptic.curves.secp256k1.curve;
    bad = curve.jpoint(bad.x, bad.y, bad.z);
    good = curve.jpoint(good.x, good.y, good.z);

    // They are the same points
    assert(bad.add(good.neg()).isInfinity());

    // But doubling borks them out
    assert(bad.dbl().add(good.dbl().neg()).isInfinity());
  });

  it('should store precomputed values correctly on negation', function() {
    var curve = elliptic.curves.secp256k1.curve;
    var p = curve.g.mul('2');
    p.precompute();
    var neg = p.neg(true);
    var neg2 = neg.neg(true);
    assert(p.eq(neg2));
  });
});
