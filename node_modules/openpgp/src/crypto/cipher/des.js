//Paul Tero, July 2001
//http://www.tero.co.uk/des/
//
//Optimised for performance with large blocks by Michael Hayworth, November 2001
//http://www.netdealing.com
//
// Modified by Recurity Labs GmbH

//THIS SOFTWARE IS PROVIDED "AS IS" AND
//ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
//FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
//DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
//OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
//HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
//LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
//OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
//SUCH DAMAGE.

//des
//this takes the key, the message, and whether to encrypt or decrypt

/**
 * @module crypto/cipher/des
 */

'use strict';

function des(keys, message, encrypt, mode, iv, padding) {
  //declaring this locally speeds things up a bit
  var spfunction1 = new Array(0x1010400, 0, 0x10000, 0x1010404, 0x1010004, 0x10404, 0x4, 0x10000, 0x400, 0x1010400,
    0x1010404, 0x400, 0x1000404, 0x1010004, 0x1000000, 0x4, 0x404, 0x1000400, 0x1000400, 0x10400, 0x10400, 0x1010000,
    0x1010000, 0x1000404, 0x10004, 0x1000004, 0x1000004, 0x10004, 0, 0x404, 0x10404, 0x1000000, 0x10000, 0x1010404, 0x4,
    0x1010000, 0x1010400, 0x1000000, 0x1000000, 0x400, 0x1010004, 0x10000, 0x10400, 0x1000004, 0x400, 0x4, 0x1000404,
    0x10404, 0x1010404, 0x10004, 0x1010000, 0x1000404, 0x1000004, 0x404, 0x10404, 0x1010400, 0x404, 0x1000400,
    0x1000400, 0, 0x10004, 0x10400, 0, 0x1010004);
  var spfunction2 = new Array(-0x7fef7fe0, -0x7fff8000, 0x8000, 0x108020, 0x100000, 0x20, -0x7fefffe0, -0x7fff7fe0, -
    0x7fffffe0, -0x7fef7fe0, -0x7fef8000, -0x80000000, -0x7fff8000, 0x100000, 0x20, -0x7fefffe0, 0x108000, 0x100020, -
    0x7fff7fe0, 0, -0x80000000, 0x8000, 0x108020, -0x7ff00000, 0x100020, -0x7fffffe0, 0, 0x108000, 0x8020, -0x7fef8000, -
    0x7ff00000, 0x8020, 0, 0x108020, -0x7fefffe0, 0x100000, -0x7fff7fe0, -0x7ff00000, -0x7fef8000, 0x8000, -0x7ff00000, -
    0x7fff8000, 0x20, -0x7fef7fe0, 0x108020, 0x20, 0x8000, -0x80000000, 0x8020, -0x7fef8000, 0x100000, -0x7fffffe0,
    0x100020, -0x7fff7fe0, -0x7fffffe0, 0x100020, 0x108000, 0, -0x7fff8000, 0x8020, -0x80000000, -0x7fefffe0, -
    0x7fef7fe0, 0x108000);
  var spfunction3 = new Array(0x208, 0x8020200, 0, 0x8020008, 0x8000200, 0, 0x20208, 0x8000200, 0x20008, 0x8000008,
    0x8000008, 0x20000, 0x8020208, 0x20008, 0x8020000, 0x208, 0x8000000, 0x8, 0x8020200, 0x200, 0x20200, 0x8020000,
    0x8020008, 0x20208, 0x8000208, 0x20200, 0x20000, 0x8000208, 0x8, 0x8020208, 0x200, 0x8000000, 0x8020200, 0x8000000,
    0x20008, 0x208, 0x20000, 0x8020200, 0x8000200, 0, 0x200, 0x20008, 0x8020208, 0x8000200, 0x8000008, 0x200, 0,
    0x8020008, 0x8000208, 0x20000, 0x8000000, 0x8020208, 0x8, 0x20208, 0x20200, 0x8000008, 0x8020000, 0x8000208, 0x208,
    0x8020000, 0x20208, 0x8, 0x8020008, 0x20200);
  var spfunction4 = new Array(0x802001, 0x2081, 0x2081, 0x80, 0x802080, 0x800081, 0x800001, 0x2001, 0, 0x802000,
    0x802000, 0x802081, 0x81, 0, 0x800080, 0x800001, 0x1, 0x2000, 0x800000, 0x802001, 0x80, 0x800000, 0x2001, 0x2080,
    0x800081, 0x1, 0x2080, 0x800080, 0x2000, 0x802080, 0x802081, 0x81, 0x800080, 0x800001, 0x802000, 0x802081, 0x81, 0,
    0, 0x802000, 0x2080, 0x800080, 0x800081, 0x1, 0x802001, 0x2081, 0x2081, 0x80, 0x802081, 0x81, 0x1, 0x2000, 0x800001,
    0x2001, 0x802080, 0x800081, 0x2001, 0x2080, 0x800000, 0x802001, 0x80, 0x800000, 0x2000, 0x802080);
  var spfunction5 = new Array(0x100, 0x2080100, 0x2080000, 0x42000100, 0x80000, 0x100, 0x40000000, 0x2080000,
    0x40080100, 0x80000, 0x2000100, 0x40080100, 0x42000100, 0x42080000, 0x80100, 0x40000000, 0x2000000, 0x40080000,
    0x40080000, 0, 0x40000100, 0x42080100, 0x42080100, 0x2000100, 0x42080000, 0x40000100, 0, 0x42000000, 0x2080100,
    0x2000000, 0x42000000, 0x80100, 0x80000, 0x42000100, 0x100, 0x2000000, 0x40000000, 0x2080000, 0x42000100,
    0x40080100, 0x2000100, 0x40000000, 0x42080000, 0x2080100, 0x40080100, 0x100, 0x2000000, 0x42080000, 0x42080100,
    0x80100, 0x42000000, 0x42080100, 0x2080000, 0, 0x40080000, 0x42000000, 0x80100, 0x2000100, 0x40000100, 0x80000, 0,
    0x40080000, 0x2080100, 0x40000100);
  var spfunction6 = new Array(0x20000010, 0x20400000, 0x4000, 0x20404010, 0x20400000, 0x10, 0x20404010, 0x400000,
    0x20004000, 0x404010, 0x400000, 0x20000010, 0x400010, 0x20004000, 0x20000000, 0x4010, 0, 0x400010, 0x20004010,
    0x4000, 0x404000, 0x20004010, 0x10, 0x20400010, 0x20400010, 0, 0x404010, 0x20404000, 0x4010, 0x404000, 0x20404000,
    0x20000000, 0x20004000, 0x10, 0x20400010, 0x404000, 0x20404010, 0x400000, 0x4010, 0x20000010, 0x400000, 0x20004000,
    0x20000000, 0x4010, 0x20000010, 0x20404010, 0x404000, 0x20400000, 0x404010, 0x20404000, 0, 0x20400010, 0x10, 0x4000,
    0x20400000, 0x404010, 0x4000, 0x400010, 0x20004010, 0, 0x20404000, 0x20000000, 0x400010, 0x20004010);
  var spfunction7 = new Array(0x200000, 0x4200002, 0x4000802, 0, 0x800, 0x4000802, 0x200802, 0x4200800, 0x4200802,
    0x200000, 0, 0x4000002, 0x2, 0x4000000, 0x4200002, 0x802, 0x4000800, 0x200802, 0x200002, 0x4000800, 0x4000002,
    0x4200000, 0x4200800, 0x200002, 0x4200000, 0x800, 0x802, 0x4200802, 0x200800, 0x2, 0x4000000, 0x200800, 0x4000000,
    0x200800, 0x200000, 0x4000802, 0x4000802, 0x4200002, 0x4200002, 0x2, 0x200002, 0x4000000, 0x4000800, 0x200000,
    0x4200800, 0x802, 0x200802, 0x4200800, 0x802, 0x4000002, 0x4200802, 0x4200000, 0x200800, 0, 0x2, 0x4200802, 0,
    0x200802, 0x4200000, 0x800, 0x4000002, 0x4000800, 0x800, 0x200002);
  var spfunction8 = new Array(0x10001040, 0x1000, 0x40000, 0x10041040, 0x10000000, 0x10001040, 0x40, 0x10000000,
    0x40040, 0x10040000, 0x10041040, 0x41000, 0x10041000, 0x41040, 0x1000, 0x40, 0x10040000, 0x10000040, 0x10001000,
    0x1040, 0x41000, 0x40040, 0x10040040, 0x10041000, 0x1040, 0, 0, 0x10040040, 0x10000040, 0x10001000, 0x41040,
    0x40000, 0x41040, 0x40000, 0x10041000, 0x1000, 0x40, 0x10040040, 0x1000, 0x41040, 0x10001000, 0x40, 0x10000040,
    0x10040000, 0x10040040, 0x10000000, 0x40000, 0x10001040, 0, 0x10041040, 0x40040, 0x10000040, 0x10040000, 0x10001000,
    0x10001040, 0, 0x10041040, 0x41000, 0x41000, 0x1040, 0x1040, 0x40040, 0x10000000, 0x10041000);

  //create the 16 or 48 subkeys we will need
  var m = 0,
    i, j, temp, right1, right2, left, right, looping;
  var cbcleft, cbcleft2, cbcright, cbcright2;
  var endloop, loopinc;
  var len = message.length;

  //set up the loops for single and triple des
  var iterations = keys.length === 32 ? 3 : 9; //single or triple des
  if (iterations === 3) {
    looping = encrypt ? new Array(0, 32, 2) : new Array(30, -2, -2);
  } else {
    looping = encrypt ? new Array(0, 32, 2, 62, 30, -2, 64, 96, 2) : new Array(94, 62, -2, 32, 64, 2, 30, -2, -2);
  }

  //pad the message depending on the padding parameter
  //only add padding if encrypting - note that you need to use the same padding option for both encrypt and decrypt
  if (encrypt) {
    message = des_addPadding(message, padding);
    len = message.length;
  }

  //store the result here
  var result = new Uint8Array(len);
  var k = 0;

  if (mode === 1) { //CBC mode
    cbcleft = (iv[m++] << 24) | (iv[m++] << 16) | (iv[m++] << 8) | iv[m++];
    cbcright = (iv[m++] << 24) | (iv[m++] << 16) | (iv[m++] << 8) | iv[m++];
    m = 0;
  }

  //loop through each 64 bit chunk of the message
  while (m < len) {
    left = (message[m++] << 24) | (message[m++] << 16) | (message[m++] << 8) | message[m++];
    right = (message[m++] << 24) | (message[m++] << 16) | (message[m++] << 8) | message[m++];

    //for Cipher Block Chaining mode, xor the message with the previous result
    if (mode === 1) {
      if (encrypt) {
        left ^= cbcleft;
        right ^= cbcright;
      } else {
        cbcleft2 = cbcleft;
        cbcright2 = cbcright;
        cbcleft = left;
        cbcright = right;
      }
    }

    //first each 64 but chunk of the message must be permuted according to IP
    temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
    right ^= temp;
    left ^= (temp << 4);
    temp = ((left >>> 16) ^ right) & 0x0000ffff;
    right ^= temp;
    left ^= (temp << 16);
    temp = ((right >>> 2) ^ left) & 0x33333333;
    left ^= temp;
    right ^= (temp << 2);
    temp = ((right >>> 8) ^ left) & 0x00ff00ff;
    left ^= temp;
    right ^= (temp << 8);
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= (temp << 1);

    left = ((left << 1) | (left >>> 31));
    right = ((right << 1) | (right >>> 31));

    //do this either 1 or 3 times for each chunk of the message
    for (j = 0; j < iterations; j += 3) {
      endloop = looping[j + 1];
      loopinc = looping[j + 2];
      //now go through and perform the encryption or decryption
      for (i = looping[j]; i !== endloop; i += loopinc) { //for efficiency
        right1 = right ^ keys[i];
        right2 = ((right >>> 4) | (right << 28)) ^ keys[i + 1];
        //the result is attained by passing these bytes through the S selection functions
        temp = left;
        left = right;
        right = temp ^ (spfunction2[(right1 >>> 24) & 0x3f] | spfunction4[(right1 >>> 16) & 0x3f] | spfunction6[(right1 >>>
          8) & 0x3f] | spfunction8[right1 & 0x3f] | spfunction1[(right2 >>> 24) & 0x3f] | spfunction3[(right2 >>> 16) &
          0x3f] | spfunction5[(right2 >>> 8) & 0x3f] | spfunction7[right2 & 0x3f]);
      }
      temp = left;
      left = right;
      right = temp; //unreverse left and right
    } //for either 1 or 3 iterations

    //move then each one bit to the right
    left = ((left >>> 1) | (left << 31));
    right = ((right >>> 1) | (right << 31));

    //now perform IP-1, which is IP in the opposite direction
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= (temp << 1);
    temp = ((right >>> 8) ^ left) & 0x00ff00ff;
    left ^= temp;
    right ^= (temp << 8);
    temp = ((right >>> 2) ^ left) & 0x33333333;
    left ^= temp;
    right ^= (temp << 2);
    temp = ((left >>> 16) ^ right) & 0x0000ffff;
    right ^= temp;
    left ^= (temp << 16);
    temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
    right ^= temp;
    left ^= (temp << 4);

    //for Cipher Block Chaining mode, xor the message with the previous result
    if (mode === 1) {
      if (encrypt) {
        cbcleft = left;
        cbcright = right;
      } else {
        left ^= cbcleft2;
        right ^= cbcright2;
      }
    }

    result[k++] = (left >>> 24);
    result[k++] = ((left >>> 16) & 0xff);
    result[k++] = ((left >>> 8) & 0xff);
    result[k++] = (left & 0xff);
    result[k++] = (right >>> 24);
    result[k++] = ((right >>> 16) & 0xff);
    result[k++] = ((right >>> 8) & 0xff);
    result[k++] = (right & 0xff);
  } //for every 8 characters, or 64 bits in the message

  //only remove padding if decrypting - note that you need to use the same padding option for both encrypt and decrypt
  if (!encrypt) {
    result = des_removePadding(result, padding);
  }

  return result;
} //end of des



//des_createKeys
//this takes as input a 64 bit key (even though only 56 bits are used)
//as an array of 2 integers, and returns 16 48 bit keys

function des_createKeys(key) {
  //declaring this locally speeds things up a bit
  var pc2bytes0 = new Array(0, 0x4, 0x20000000, 0x20000004, 0x10000, 0x10004, 0x20010000, 0x20010004, 0x200, 0x204,
    0x20000200, 0x20000204, 0x10200, 0x10204, 0x20010200, 0x20010204);
  var pc2bytes1 = new Array(0, 0x1, 0x100000, 0x100001, 0x4000000, 0x4000001, 0x4100000, 0x4100001, 0x100, 0x101, 0x100100,
    0x100101, 0x4000100, 0x4000101, 0x4100100, 0x4100101);
  var pc2bytes2 = new Array(0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808, 0, 0x8, 0x800, 0x808,
    0x1000000, 0x1000008, 0x1000800, 0x1000808);
  var pc2bytes3 = new Array(0, 0x200000, 0x8000000, 0x8200000, 0x2000, 0x202000, 0x8002000, 0x8202000, 0x20000, 0x220000,
    0x8020000, 0x8220000, 0x22000, 0x222000, 0x8022000, 0x8222000);
  var pc2bytes4 = new Array(0, 0x40000, 0x10, 0x40010, 0, 0x40000, 0x10, 0x40010, 0x1000, 0x41000, 0x1010, 0x41010, 0x1000,
    0x41000, 0x1010, 0x41010);
  var pc2bytes5 = new Array(0, 0x400, 0x20, 0x420, 0, 0x400, 0x20, 0x420, 0x2000000, 0x2000400, 0x2000020, 0x2000420,
    0x2000000, 0x2000400, 0x2000020, 0x2000420);
  var pc2bytes6 = new Array(0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002, 0, 0x10000000,
    0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002);
  var pc2bytes7 = new Array(0, 0x10000, 0x800, 0x10800, 0x20000000, 0x20010000, 0x20000800, 0x20010800, 0x20000, 0x30000,
    0x20800, 0x30800, 0x20020000, 0x20030000, 0x20020800, 0x20030800);
  var pc2bytes8 = new Array(0, 0x40000, 0, 0x40000, 0x2, 0x40002, 0x2, 0x40002, 0x2000000, 0x2040000, 0x2000000, 0x2040000,
    0x2000002, 0x2040002, 0x2000002, 0x2040002);
  var pc2bytes9 = new Array(0, 0x10000000, 0x8, 0x10000008, 0, 0x10000000, 0x8, 0x10000008, 0x400, 0x10000400, 0x408,
    0x10000408, 0x400, 0x10000400, 0x408, 0x10000408);
  var pc2bytes10 = new Array(0, 0x20, 0, 0x20, 0x100000, 0x100020, 0x100000, 0x100020, 0x2000, 0x2020, 0x2000, 0x2020,
    0x102000, 0x102020, 0x102000, 0x102020);
  var pc2bytes11 = new Array(0, 0x1000000, 0x200, 0x1000200, 0x200000, 0x1200000, 0x200200, 0x1200200, 0x4000000, 0x5000000,
    0x4000200, 0x5000200, 0x4200000, 0x5200000, 0x4200200, 0x5200200);
  var pc2bytes12 = new Array(0, 0x1000, 0x8000000, 0x8001000, 0x80000, 0x81000, 0x8080000, 0x8081000, 0x10, 0x1010,
    0x8000010, 0x8001010, 0x80010, 0x81010, 0x8080010, 0x8081010);
  var pc2bytes13 = new Array(0, 0x4, 0x100, 0x104, 0, 0x4, 0x100, 0x104, 0x1, 0x5, 0x101, 0x105, 0x1, 0x5, 0x101, 0x105);

  //how many iterations (1 for des, 3 for triple des)
  var iterations = key.length > 8 ? 3 : 1; //changed by Paul 16/6/2007 to use Triple DES for 9+ byte keys
  //stores the return keys
  var keys = new Array(32 * iterations);
  //now define the left shifts which need to be done
  var shifts = new Array(0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0);
  //other variables
  var lefttemp, righttemp, m = 0,
    n = 0,
    temp;

  for (var j = 0; j < iterations; j++) { //either 1 or 3 iterations
    var left = (key[m++] << 24) | (key[m++] << 16) | (key[m++] << 8) | key[m++];
    var right = (key[m++] << 24) | (key[m++] << 16) | (key[m++] << 8) | key[m++];

    temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
    right ^= temp;
    left ^= (temp << 4);
    temp = ((right >>> -16) ^ left) & 0x0000ffff;
    left ^= temp;
    right ^= (temp << -16);
    temp = ((left >>> 2) ^ right) & 0x33333333;
    right ^= temp;
    left ^= (temp << 2);
    temp = ((right >>> -16) ^ left) & 0x0000ffff;
    left ^= temp;
    right ^= (temp << -16);
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= (temp << 1);
    temp = ((right >>> 8) ^ left) & 0x00ff00ff;
    left ^= temp;
    right ^= (temp << 8);
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= (temp << 1);

    //the right side needs to be shifted and to get the last four bits of the left side
    temp = (left << 8) | ((right >>> 20) & 0x000000f0);
    //left needs to be put upside down
    left = (right << 24) | ((right << 8) & 0xff0000) | ((right >>> 8) & 0xff00) | ((right >>> 24) & 0xf0);
    right = temp;

    //now go through and perform these shifts on the left and right keys
    for (var i = 0; i < shifts.length; i++) {
      //shift the keys either one or two bits to the left
      if (shifts[i]) {
        left = (left << 2) | (left >>> 26);
        right = (right << 2) | (right >>> 26);
      } else {
        left = (left << 1) | (left >>> 27);
        right = (right << 1) | (right >>> 27);
      }
      left &= -0xf;
      right &= -0xf;

      //now apply PC-2, in such a way that E is easier when encrypting or decrypting
      //this conversion will look like PC-2 except only the last 6 bits of each byte are used
      //rather than 48 consecutive bits and the order of lines will be according to
      //how the S selection functions will be applied: S2, S4, S6, S8, S1, S3, S5, S7
      lefttemp = pc2bytes0[left >>> 28] | pc2bytes1[(left >>> 24) & 0xf] | pc2bytes2[(left >>> 20) & 0xf] | pc2bytes3[(
        left >>> 16) & 0xf] | pc2bytes4[(left >>> 12) & 0xf] | pc2bytes5[(left >>> 8) & 0xf] | pc2bytes6[(left >>> 4) &
        0xf];
      righttemp = pc2bytes7[right >>> 28] | pc2bytes8[(right >>> 24) & 0xf] | pc2bytes9[(right >>> 20) & 0xf] |
        pc2bytes10[(right >>> 16) & 0xf] | pc2bytes11[(right >>> 12) & 0xf] | pc2bytes12[(right >>> 8) & 0xf] |
        pc2bytes13[(right >>> 4) & 0xf];
      temp = ((righttemp >>> 16) ^ lefttemp) & 0x0000ffff;
      keys[n++] = lefttemp ^ temp;
      keys[n++] = righttemp ^ (temp << 16);
    }
  } //for each iterations
  //return the keys we've created
  return keys;
} //end of des_createKeys


function des_addPadding(message, padding) {
  var padLength = 8 - (message.length % 8);

  var pad;
  if (padding === 2 && (padLength < 8)) { //pad the message with spaces
    pad = " ".charCodeAt(0);
  } else if (padding === 1) { //PKCS7 padding
    pad = padLength;
  } else if (!padding && (padLength < 8)) { //pad the message out with null bytes
    pad = 0;
  } else if (padLength === 8) {
    return message;
  }
  else {
    throw new Error('des: invalid padding');
  }

  var paddedMessage = new Uint8Array(message.length + padLength);
  for(var i = 0; i < message.length; i++) {
    paddedMessage[i] = message[i];
  }
  for(var j = 0; j < padLength; j++) {
    paddedMessage[message.length + j] = pad;
  }

  return paddedMessage;
}

function des_removePadding(message, padding) {
  var padLength = null;
  var pad;
  if (padding === 2) { // space padded
    pad = " ".charCodeAt(0);
  } else if (padding === 1) { // PKCS7
    padLength = message[message.length - 1];
  } else if (!padding) { // null padding
    pad = 0;
  }
  else {
    throw new Error('des: invalid padding');
  }

  if(!padLength) {
    padLength = 1;
    while(message[message.length - padLength] === pad) {
      padLength++;
    }
    padLength--;
  }

  return message.subarray(0, message.length - padLength);
}

// added by Recurity Labs

function Des(key) {
  this.key = [];

  for (var i = 0; i < 3; i++) {
    this.key.push(new Uint8Array(key.subarray(i * 8, (i * 8) + 8)));
  }

  this.encrypt = function(block) {
    return des(des_createKeys(this.key[2]),
      des(des_createKeys(this.key[1]),
      des(des_createKeys(this.key[0]),
      block, true, 0, null, null),
      false, 0, null, null), true, 0, null, null);
  };
}

Des.keySize = Des.prototype.keySize = 24;
Des.blockSize = Des.prototype.blockSize = 8;

// This is "original" DES - Des is actually Triple DES.
// This is only exported so we can unit test.

function OriginalDes(key) {
  this.key = key;

  this.encrypt = function(block, padding) {
    var keys = des_createKeys(this.key);
    return des(keys, block, true, 0, null, padding);
  };

  this.decrypt = function(block, padding) {
    var keys = des_createKeys(this.key);
    return des(keys, block, false, 0, null, padding);
  };
}

export default {
  /** @static */
  des: Des,
  /** @static */
  originalDes: OriginalDes
};