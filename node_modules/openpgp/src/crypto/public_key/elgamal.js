// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
//
// ElGamal implementation

/**
 * @requires crypto/public_key/jsbn
 * @requires crypto/random
 * @requires util
 * @module crypto/public_key/elgamal
 */

'use strict';

import BigInteger from './jsbn.js';
import random from '../random.js';
import util from '../../util.js';

export default function Elgamal() {

  function encrypt(m, g, p, y) {
    //  choose k in {2,...,p-2}
    var pMinus2 = p.subtract(BigInteger.TWO);
    var k = random.getRandomBigIntegerInRange(BigInteger.ONE, pMinus2);
    k = k.mod(pMinus2).add(BigInteger.ONE);
    var c = [];
    c[0] = g.modPow(k, p);
    c[1] = y.modPow(k, p).multiply(m).mod(p);
    return c;
  }

  function decrypt(c1, c2, p, x) {
    util.print_debug("Elgamal Decrypt:\nc1:" + util.hexstrdump(c1.toMPI()) + "\n" +
      "c2:" + util.hexstrdump(c2.toMPI()) + "\n" +
      "p:" + util.hexstrdump(p.toMPI()) + "\n" +
      "x:" + util.hexstrdump(x.toMPI()));
    return (c1.modPow(x, p).modInverse(p)).multiply(c2).mod(p);
    //var c = c1.pow(x).modInverse(p); // c0^-a mod p
    //return c.multiply(c2).mod(p);
  }

  // signing and signature verification using Elgamal is not required by OpenPGP.
  this.encrypt = encrypt;
  this.decrypt = decrypt;
}
