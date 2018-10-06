/* globals tryTests: true */

'use strict';

var openpgp = typeof window !== 'undefined' && window.openpgp ? window.openpgp : require('../../dist/openpgp');

var sinon = require('sinon'),
  chai = require('chai'),
  expect = chai.expect;

var pub_key =
  ['-----BEGIN PGP PUBLIC KEY BLOCK-----',
  'Version: GnuPG v2.0.19 (GNU/Linux)',
  '',
  'mI0EUmEvTgEEANyWtQQMOybQ9JltDqmaX0WnNPJeLILIM36sw6zL0nfTQ5zXSS3+',
  'fIF6P29lJFxpblWk02PSID5zX/DYU9/zjM2xPO8Oa4xo0cVTOTLj++Ri5mtr//f5',
  'GLsIXxFrBJhD/ghFsL3Op0GXOeLJ9A5bsOn8th7x6JucNKuaRB6bQbSPABEBAAG0',
  'JFRlc3QgTWNUZXN0aW5ndG9uIDx0ZXN0QGV4YW1wbGUuY29tPoi5BBMBAgAjBQJS',
  'YS9OAhsvBwsJCAcDAgEGFQgCCQoLBBYCAwECHgECF4AACgkQSmNhOk1uQJQwDAP6',
  'AgrTyqkRlJVqz2pb46TfbDM2TDF7o9CBnBzIGoxBhlRwpqALz7z2kxBDmwpQa+ki',
  'Bq3jZN/UosY9y8bhwMAlnrDY9jP1gdCo+H0sD48CdXybblNwaYpwqC8VSpDdTndf',
  '9j2wE/weihGp/DAdy/2kyBCaiOY1sjhUfJ1GogF49rC4jQRSYS9OAQQA6R/PtBFa',
  'JaT4jq10yqASk4sqwVMsc6HcifM5lSdxzExFP74naUMMyEsKHP53QxTF0Grqusag',
  'Qg/ZtgT0CN1HUM152y7ACOdp1giKjpMzOTQClqCoclyvWOFB+L/SwGEIJf7LSCEr',
  'woBuJifJc8xAVr0XX0JthoW+uP91eTQ3XpsAEQEAAYkBPQQYAQIACQUCUmEvTgIb',
  'LgCoCRBKY2E6TW5AlJ0gBBkBAgAGBQJSYS9OAAoJEOCE90RsICyXuqIEANmmiRCA',
  'SF7YK7PvFkieJNwzeK0V3F2lGX+uu6Y3Q/Zxdtwc4xR+me/CSBmsURyXTO29OWhP',
  'GLszPH9zSJU9BdDi6v0yNprmFPX/1Ng0Abn/sCkwetvjxC1YIvTLFwtUL/7v6NS2',
  'bZpsUxRTg9+cSrMWWSNjiY9qUKajm1tuzPDZXAUEAMNmAN3xXN/Kjyvj2OK2ck0X',
  'W748sl/tc3qiKPMJ+0AkMF7Pjhmh9nxqE9+QCEl7qinFqqBLjuzgUhBU4QlwX1GD',
  'AtNTq6ihLMD5v1d82ZC7tNatdlDMGWnIdvEMCv2GZcuIqDQ9rXWs49e7tq1NncLY',
  'hz3tYjKhoFTKEIq3y3Pp',
  '=h/aX',
  '-----END PGP PUBLIC KEY BLOCK-----'].join('\n');

var priv_key =
  ['-----BEGIN PGP PRIVATE KEY BLOCK-----',
  'Version: GnuPG v2.0.19 (GNU/Linux)',
  '',
  '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',
  '=lw5e',
  '-----END PGP PRIVATE KEY BLOCK-----'].join('\n');

var pub_key_de =
  ['-----BEGIN PGP PUBLIC KEY BLOCK-----',
  'Version: GnuPG v2.0.22 (GNU/Linux)',
  '',
  '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',
  'og2umGfGng==',
  '=v3+L',
  '-----END PGP PUBLIC KEY BLOCK-----'].join('\n');

var priv_key_de =
  ['-----BEGIN PGP PRIVATE KEY BLOCK-----',
  'Version: GnuPG v2.0.22 (GNU/Linux)',
  '',
  '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',
  'DHTORVqAOdoOcu5Qh7AQg1GdSmfFAsx2',
  '=kyeP',
  '-----END PGP PRIVATE KEY BLOCK-----'].join('\n');

var passphrase = 'hello world';
var plaintext = 'short message\nnext line\n한국어/조선말';
var password1 = 'I am a password';
var password2 = 'I am another password';

describe('OpenPGP.js public api tests', function() {

  describe('initWorker, getWorker, destroyWorker - unit tests', function() {
    afterEach(function() {
      openpgp.destroyWorker(); // cleanup worker in case of failure
    });

    it('should work', function() {
      var workerStub = {
        postMessage: function() {}
      };
      openpgp.initWorker({
        worker: workerStub
      });
      expect(openpgp.getWorker()).to.exist;
      openpgp.destroyWorker();
      expect(openpgp.getWorker()).to.not.exist;
    });
  });

  describe('generateKey - unit tests', function() {
    var keyGenStub, keyObjStub, getWebCryptoAllStub;

    beforeEach(function() {
      keyObjStub = {
        armor: function() {
          return 'priv_key';
        },
        toPublic: function() {
          return {
            armor: function() {
              return 'pub_key';
            }
          };
        }
      };
      keyGenStub = sinon.stub(openpgp.key, 'generate');
      keyGenStub.returns(resolves(keyObjStub));
      getWebCryptoAllStub = sinon.stub(openpgp.util, 'getWebCryptoAll');
    });

    afterEach(function() {
      keyGenStub.restore();
      openpgp.destroyWorker();
      getWebCryptoAllStub.restore();
    });

    it('should fail for invalid user name', function() {
      var opt = {
        userIds: [{ name: {}, email: 'text@example.com' }]
      };
      var test = openpgp.generateKey.bind(null, opt);
      expect(test).to.throw(/Invalid user id format/);
    });

    it('should fail for invalid user email address', function() {
      var opt = {
        userIds: [{ name: 'Test User', email: 'textexample.com' }]
      };
      var test = openpgp.generateKey.bind(null, opt);
      expect(test).to.throw(/Invalid user id format/);
    });

    it('should fail for invalid user email address', function() {
      var opt = {
        userIds: [{ name: 'Test User', email: 'text@examplecom' }]
      };
      var test = openpgp.generateKey.bind(null, opt);
      expect(test).to.throw(/Invalid user id format/);
    });

    it('should fail for invalid string user id', function() {
      var opt = {
        userIds: ['Test User text@example.com>']
      };
      var test = openpgp.generateKey.bind(null, opt);
      expect(test).to.throw(/Invalid user id format/);
    });

    it('should fail for invalid single string user id', function() {
      var opt = {
        userIds: 'Test User text@example.com>'
      };
      var test = openpgp.generateKey.bind(null, opt);
      expect(test).to.throw(/Invalid user id format/);
    });

    it('should work for valid single string user id', function() {
      var opt = {
        userIds: 'Test User <text@example.com>'
      };
      return openpgp.generateKey(opt);
    });

    it('should work for valid string user id', function() {
      var opt = {
        userIds: ['Test User <text@example.com>']
      };
      return openpgp.generateKey(opt);
    });

    it('should work for valid single user id hash', function() {
      var opt = {
        userIds: { name: 'Test User', email: 'text@example.com' }
      };
      return openpgp.generateKey(opt);
    });

    it('should work for valid single user id hash', function() {
      var opt = {
        userIds: [{ name: 'Test User', email: 'text@example.com' }]
      };
      return openpgp.generateKey(opt);
    });

    it('should work for an empty name', function() {
      var opt = {
        userIds: { email: 'text@example.com' }
      };
      return openpgp.generateKey(opt);
    });

    it('should work for an empty email address', function() {
      var opt = {
        userIds: { name: 'Test User' }
      };
      return openpgp.generateKey(opt);
    });

    it('should have default params set', function() {
      var opt = {
        userIds: { name: 'Test User', email: 'text@example.com' },
        passphrase: 'secret',
        unlocked: true
      };
      return openpgp.generateKey(opt).then(function(newKey) {
        expect(keyGenStub.withArgs({
          userIds: ['Test User <text@example.com>'],
          passphrase: 'secret',
          numBits: 2048,
          unlocked: true,
          keyExpirationTime: 0
        }).calledOnce).to.be.true;
        expect(newKey.key).to.exist;
        expect(newKey.privateKeyArmored).to.exist;
        expect(newKey.publicKeyArmored).to.exist;
      });
    });

    it('should work for no params', function() {
      return openpgp.generateKey().then(function(newKey) {
        expect(keyGenStub.withArgs({
          userIds: [],
          passphrase: undefined,
          numBits: 2048,
          unlocked: false,
          keyExpirationTime: 0
        }).calledOnce).to.be.true;
        expect(newKey.key).to.exist;
      });
    });

    it('should delegate to async proxy', function() {
      var workerStub = {
        postMessage: function() {}
      };
      openpgp.initWorker({
        worker: workerStub
      });
      var proxyGenStub = sinon.stub(openpgp.getWorker(), 'delegate');
      getWebCryptoAllStub.returns();

      openpgp.generateKey();
      expect(proxyGenStub.calledOnce).to.be.true;
      expect(keyGenStub.calledOnce).to.be.false;
    });
  });

  describe('generateKey - integration tests', function() {
    var use_nativeVal;

    beforeEach(function() {
      use_nativeVal = openpgp.config.use_native;
    });

    afterEach(function() {
      openpgp.config.use_native = use_nativeVal;
      openpgp.destroyWorker();
    });

    it('should work in JS (without worker)', function() {
      openpgp.config.use_native = false;
      openpgp.destroyWorker();
      var opt = {
        userIds: [{ name: 'Test User', email: 'text@example.com' }],
        numBits: 512
      };

      return openpgp.generateKey(opt).then(function(newKey) {
        expect(newKey.key.getUserIds()[0]).to.equal('Test User <text@example.com>');
        expect(newKey.publicKeyArmored).to.match(/^-----BEGIN PGP PUBLIC/);
        expect(newKey.privateKeyArmored).to.match(/^-----BEGIN PGP PRIVATE/);
      });
    });

    it('should work in JS (with worker)', function() {
      openpgp.config.use_native = false;
      openpgp.initWorker({ path:'../dist/openpgp.worker.js' });
      var opt = {
        userIds: [{ name: 'Test User', email: 'text@example.com' }],
        numBits: 512
      };

      return openpgp.generateKey(opt).then(function(newKey) {
        expect(newKey.key.getUserIds()[0]).to.equal('Test User <text@example.com>');
        expect(newKey.publicKeyArmored).to.match(/^-----BEGIN PGP PUBLIC/);
        expect(newKey.privateKeyArmored).to.match(/^-----BEGIN PGP PRIVATE/);
      });
    });

    it('should work in with native crypto', function() {
      openpgp.config.use_native = true;
      var opt = {
        userIds: [{ name: 'Test User', email: 'text@example.com' }],
        numBits: 512
      };
      if (openpgp.util.getWebCryptoAll()) { opt.numBits = 2048; } // webkit webcrypto accepts minimum 2048 bit keys

      return openpgp.generateKey(opt).then(function(newKey) {
        expect(newKey.key.getUserIds()[0]).to.equal('Test User <text@example.com>');
        expect(newKey.publicKeyArmored).to.match(/^-----BEGIN PGP PUBLIC/);
        expect(newKey.privateKeyArmored).to.match(/^-----BEGIN PGP PRIVATE/);
      });
    });
  });

  describe('encrypt, decrypt, sign, verify - integration tests', function() {
    var privateKey, publicKey, zero_copyVal, use_nativeVal, aead_protectVal;

    beforeEach(function() {
      publicKey = openpgp.key.readArmored(pub_key);
      expect(publicKey.keys).to.have.length(1);
      expect(publicKey.err).to.not.exist;
      privateKey = openpgp.key.readArmored(priv_key);
      expect(privateKey.keys).to.have.length(1);
      expect(privateKey.err).to.not.exist;
      zero_copyVal = openpgp.config.zero_copy;
      use_nativeVal = openpgp.config.use_native;
      aead_protectVal = openpgp.config.aead_protect;
    });

    afterEach(function() {
      openpgp.config.zero_copy = zero_copyVal;
      openpgp.config.use_native = use_nativeVal;
      openpgp.config.aead_protect = aead_protectVal;
    });

    it('Decrypting key with wrong passphrase returns false', function () {
      expect(privateKey.keys[0].decrypt('wrong passphrase')).to.be.false;
    });

    it('Decrypting key with correct passphrase returns true', function () {
      expect(privateKey.keys[0].decrypt(passphrase)).to.be.true;
    });

    tryTests('CFB mode (asm.js)', tests, {
      if: true,
      beforeEach: function() {
        openpgp.config.use_native = true;
        openpgp.config.aead_protect = false;
      }
    });

    tryTests('CFB mode (asm.js, worker)', tests, {
      if: typeof window !== 'undefined' && window.Worker,
      before: function() {
        openpgp.initWorker({ path:'../dist/openpgp.worker.js' });
      },
      beforeEach: function() {
        openpgp.config.use_native = true;
        openpgp.config.aead_protect = false;
      },
      after: function() {
        openpgp.destroyWorker();
      }
    });

    tryTests('GCM mode (native)', tests, {
      if: openpgp.util.getWebCrypto() || openpgp.util.getNodeCrypto(),
      beforeEach: function() {
        openpgp.config.use_native = true;
        openpgp.config.aead_protect = true;
      }
    });

    function tests() {
      it('Configuration', function() {
        openpgp.config.show_version = false;
        openpgp.config.commentstring = 'different';
        if (openpgp.getWorker()) { // init again to trigger config event
          openpgp.initWorker({ path:'../dist/openpgp.worker.js' });
        }
        return openpgp.encrypt({ publicKeys:publicKey.keys, data:plaintext }).then(function(encrypted) {
          expect(encrypted.data).to.exist;
          expect(encrypted.data).not.to.match(/^Version:/);
          expect(encrypted.data).to.match(/Comment: different/);
        });
      });

      it('Calling decrypt with not decrypted key leads to exception', function() {
        var encOpt = {
          data: plaintext,
          publicKeys: publicKey.keys,
        };
        var decOpt = {
          privateKey: privateKey.keys[0]
        };
        return openpgp.encrypt(encOpt).then(function(encrypted) {
          decOpt.message = openpgp.message.readArmored(encrypted.data);
          return openpgp.decrypt(decOpt);
        }).catch(function(error) {
          expect(error.message).to.match(/not decrypted/);
        });
      });

      describe('decryptKey', function() {
        it('should work for correct passphrase', function() {
          return openpgp.decryptKey({
            privateKey: privateKey.keys[0],
            passphrase: passphrase
          }).then(function(unlocked){
            expect(unlocked.key.primaryKey.getKeyId().toHex()).to.equal(privateKey.keys[0].primaryKey.getKeyId().toHex());
            expect(unlocked.key.primaryKey.isDecrypted).to.be.true;
          });
        });

        it('should fail for incorrect passphrase', function() {
          return openpgp.decryptKey({
            privateKey: privateKey.keys[0],
            passphrase: 'incorrect'
          }).catch(function(error){
            expect(error.message).to.match(/Invalid passphrase/);
          });
        });
      });

      describe('encryptSessionKey, decryptSessionKey', function() {
        var sk = new Uint8Array([0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01]);

        beforeEach(function() {
          expect(privateKey.keys[0].decrypt(passphrase)).to.be.true;
        });

        it('should encrypt with public key', function() {
          return openpgp.encryptSessionKey({
            data: sk,
            algorithm: 'aes128',
            publicKeys: publicKey.keys
          }).then(function(encrypted) {
            return openpgp.decryptSessionKey({
              message: encrypted.message,
              privateKey: privateKey.keys[0]
            });
          }).then(function(decrypted) {
            expect(decrypted.data).to.deep.equal(sk);
          });
        });

        it('should encrypt with password', function() {
          return openpgp.encryptSessionKey({
            data: sk,
            algorithm: 'aes128',
            passwords: password1
          }).then(function(encrypted) {
            return openpgp.decryptSessionKey({
              message: encrypted.message,
              password: password1
            });
          }).then(function(decrypted) {
            expect(decrypted.data).to.deep.equal(sk);
          });
        });

        it('roundtrip workflow: encrypt, decryptSessionKey, decrypt with pgp key pair', function() {
          var msgAsciiArmored;
          return openpgp.encrypt({
            data: plaintext,
            publicKeys: publicKey.keys
          }).then(function(encrypted) {
            msgAsciiArmored = encrypted.data;
            return openpgp.decryptSessionKey({
              message: openpgp.message.readArmored(msgAsciiArmored),
              privateKey: privateKey.keys[0]
            });

          }).then(function(decryptedSessionKey) {
            return openpgp.decrypt({
              sessionKey: decryptedSessionKey,
              message: openpgp.message.readArmored(msgAsciiArmored)
            });

          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
          });
        });

        it('roundtrip workflow: encrypt, decryptSessionKey, decrypt with password', function() {
          var msgAsciiArmored;
          return openpgp.encrypt({
            data: plaintext,
            passwords: password1
          }).then(function(encrypted) {
            msgAsciiArmored = encrypted.data;
            return openpgp.decryptSessionKey({
              message: openpgp.message.readArmored(msgAsciiArmored),
              password: password1
            });

          }).then(function(decryptedSessionKey) {
            return openpgp.decrypt({
              sessionKey: decryptedSessionKey,
              message: openpgp.message.readArmored(msgAsciiArmored)
            });

          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
          });
        });
      });

      describe('AES / RSA encrypt, decrypt, sign, verify', function() {
        var wrong_pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n' +
          'Version: OpenPGP.js v0.9.0\r\n' +
          'Comment: Hoodiecrow - https://hoodiecrow.com\r\n' +
          '\r\n' +
          'xk0EUlhMvAEB/2MZtCUOAYvyLFjDp3OBMGn3Ev8FwjzyPbIF0JUw+L7y2XR5\r\n' +
          'RVGvbK88unV3cU/1tOYdNsXI6pSp/Ztjyv7vbBUAEQEAAc0pV2hpdGVvdXQg\r\n' +
          'VXNlciA8d2hpdGVvdXQudGVzdEB0LW9ubGluZS5kZT7CXAQQAQgAEAUCUlhM\r\n' +
          'vQkQ9vYOm0LN/0wAAAW4Af9C+kYW1AvNWmivdtr0M0iYCUjM9DNOQH1fcvXq\r\n' +
          'IiN602mWrkd8jcEzLsW5IUNzVPLhrFIuKyBDTpLnC07Loce1\r\n' +
          '=6XMW\r\n' +
          '-----END PGP PUBLIC KEY BLOCK-----\r\n\r\n';

        beforeEach(function() {
          expect(privateKey.keys[0].decrypt(passphrase)).to.be.true;
        });

        it('should encrypt then decrypt', function() {
          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
          };
          var decOpt = {
            privateKey: privateKey.keys[0]
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            expect(encrypted.data).to.match(/^-----BEGIN PGP MESSAGE/);
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures).to.exist;
            expect(decrypted.signatures.length).to.equal(0);
          });
        });

        it('should encrypt then decrypt using returned session key', function() {
          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
            returnSessionKey: true
          };

          return openpgp.encrypt(encOpt).then(function(encrypted) {
            expect(encrypted.data).to.match(/^-----BEGIN PGP MESSAGE/);
            var decOpt = {
              sessionKey: encrypted.sessionKey,
              message: openpgp.message.readArmored(encrypted.data)
            };
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures).to.exist;
            expect(decrypted.signatures.length).to.equal(0);
          });
        });

        it('should encrypt using custom session key and decrypt using session key', function() {
          var sessionKey = {
            data: openpgp.crypto.generateSessionKey('aes256'),
            algorithm: 'aes256'
          };
          var encOpt = {
            data: plaintext,
            sessionKey: sessionKey,
            publicKeys: publicKey.keys
          };
          var decOpt = {
            sessionKey: sessionKey
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            expect(encrypted.data).to.match(/^-----BEGIN PGP MESSAGE/);
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
          });
        });

        it('should encrypt using custom session key and decrypt using private key', function() {
          var sessionKey = {
            data: openpgp.crypto.generateSessionKey('aes128'),
            algorithm: 'aes128'
          };
          var encOpt = {
            data: plaintext,
            sessionKey: sessionKey,
            publicKeys: publicKey.keys
          };
          var decOpt = {
            privateKey: privateKey.keys[0]
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            expect(encrypted.data).to.match(/^-----BEGIN PGP MESSAGE/);
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
          });
        });

        it('should encrypt/sign and decrypt/verify', function() {
          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys
          };
          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: publicKey.keys
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures[0].valid).to.be.true;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should encrypt/sign and decrypt/verify with null string input', function() {
          var encOpt = {
            data: '',
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys
          };
          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: publicKey.keys
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal('');
            expect(decrypted.signatures[0].valid).to.be.true;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should encrypt/sign and decrypt/verify with detached signatures', function() {
          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys,
            detached: true
          };
          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: publicKey.keys
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            decOpt.signature = openpgp.signature.readArmored(encrypted.signature);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures[0].valid).to.be.true;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should encrypt and decrypt/verify with detached signature input and detached flag set for encryption', function() {
          var signOpt = {
            data: plaintext,
            privateKeys: privateKey.keys[0],
            detached: true
          };

          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
            detached: true
          };

          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: publicKey.keys[0]
          };

          return openpgp.sign(signOpt).then(function(signed) {
            encOpt.signature = openpgp.signature.readArmored(signed.signature);
            return openpgp.encrypt(encOpt);
          }).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            decOpt.signature = openpgp.signature.readArmored(encrypted.signature);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures[0].valid).to.be.true;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should encrypt and decrypt/verify with detached signature as input and detached flag not set for encryption', function() {
          var privKeyDE = openpgp.key.readArmored(priv_key_de).keys[0];
          privKeyDE.decrypt(passphrase);

          var pubKeyDE = openpgp.key.readArmored(pub_key_de).keys[0];

          var signOpt = {
            data: plaintext,
            privateKeys: privKeyDE,
            detached: true
          };

          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys[0]
          };

          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: [publicKey.keys[0], pubKeyDE]
          };

          return openpgp.sign(signOpt).then(function(signed) {
            encOpt.signature = openpgp.signature.readArmored(signed.signature);
            return openpgp.encrypt(encOpt);
          }).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures[0].valid).to.be.true;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
            expect(decrypted.signatures[1].valid).to.be.true;
            expect(decrypted.signatures[1].keyid.toHex()).to.equal(privKeyDE.getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[1].signature.packets.length).to.equal(1);
          });
        });

        it('should fail to encrypt and decrypt/verify with detached signature input and detached flag set for encryption with wrong public key', function() {
          var signOpt = {
            data: plaintext,
            privateKeys: privateKey.keys,
            detached: true
          };

          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
            detached: true
          };

          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: openpgp.key.readArmored(wrong_pubkey).keys
          };

          return openpgp.sign(signOpt).then(function(signed) {
            encOpt.signature = openpgp.signature.readArmored(signed.signature);
            return openpgp.encrypt(encOpt);
          }).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            decOpt.signature = openpgp.signature.readArmored(encrypted.signature);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures[0].valid).to.be.null;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should fail to encrypt and decrypt/verify with detached signature as input and detached flag not set for encryption with wrong public key', function() {
          var signOpt = {
            data: plaintext,
            privateKeys: privateKey.keys,
            detached: true
          };

          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys
          };

          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: openpgp.key.readArmored(wrong_pubkey).keys
          };

          return openpgp.sign(signOpt).then(function(signed) {
            encOpt.signature = openpgp.signature.readArmored(signed.signature);
            return openpgp.encrypt(encOpt);
          }).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures[0].valid).to.be.null;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should fail to verify decrypted data with wrong public pgp key', function() {
          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys
          };
          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: openpgp.key.readArmored(wrong_pubkey).keys
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures[0].valid).to.be.null;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should fail to verify decrypted null string with wrong public pgp key', function() {
          var encOpt = {
            data: '',
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys
          };
          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: openpgp.key.readArmored(wrong_pubkey).keys
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal('');
            expect(decrypted.signatures[0].valid).to.be.null;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should successfully decrypt signed message without public keys to verify', function() {
          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys
          };
          var decOpt = {
            privateKey: privateKey.keys[0],
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures[0].valid).to.be.null;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should fail to verify decrypted data with wrong public pgp key with detached signatures', function() {
          var encOpt = {
            data: plaintext,
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys,
            detached: true
          };
          var decOpt = {
            privateKey: privateKey.keys[0],
            publicKeys: openpgp.key.readArmored(wrong_pubkey).keys
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            decOpt.signature = openpgp.signature.readArmored(encrypted.signature);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures[0].valid).to.be.null;
            expect(decrypted.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(decrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should sign and verify cleartext data', function() {
          var signOpt = {
            data: plaintext,
            privateKeys: privateKey.keys
          };
          var verifyOpt = {
            publicKeys: publicKey.keys
          };
          return openpgp.sign(signOpt).then(function(signed) {
            expect(signed.data).to.match(/-----BEGIN PGP SIGNED MESSAGE-----/);
            verifyOpt.message = openpgp.cleartext.readArmored(signed.data);
            return openpgp.verify(verifyOpt);
          }).then(function(verified) {
            expect(verified.data).to.equal(plaintext);
            expect(verified.signatures[0].valid).to.be.true;
            expect(verified.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(verified.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should sign and verify cleartext data with detached signatures', function() {
          var signOpt = {
            data: plaintext,
            privateKeys: privateKey.keys,
            detached: true
          };
          var verifyOpt = {
            publicKeys: publicKey.keys
          };
          return openpgp.sign(signOpt).then(function(signed) {
            verifyOpt.message = new openpgp.cleartext.CleartextMessage(plaintext);
            verifyOpt.signature = openpgp.signature.readArmored(signed.signature);
            return openpgp.verify(verifyOpt);
          }).then(function(verified) {
            expect(verified.data).to.equal(plaintext);
            expect(verified.signatures[0].valid).to.be.true;
            expect(verified.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(verified.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should sign and fail to verify cleartext data with wrong public pgp key', function() {
          var signOpt = {
            data: plaintext,
            privateKeys: privateKey.keys
          };
          var verifyOpt = {
            publicKeys: openpgp.key.readArmored(wrong_pubkey).keys
          };
          return openpgp.sign(signOpt).then(function(signed) {
            verifyOpt.message = openpgp.cleartext.readArmored(signed.data);
            return openpgp.verify(verifyOpt);
          }).then(function(verified) {
            expect(verified.data).to.equal(plaintext);
            expect(verified.signatures[0].valid).to.be.null;
            expect(verified.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(verified.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should sign and fail to verify cleartext data with wrong public pgp key with detached signature', function() {
          var signOpt = {
            data: plaintext,
            privateKeys: privateKey.keys,
            detached: true
          };
          var verifyOpt = {
            publicKeys: openpgp.key.readArmored(wrong_pubkey).keys
          };
          return openpgp.sign(signOpt).then(function(signed) {
            verifyOpt.message = new openpgp.cleartext.CleartextMessage(plaintext);
            verifyOpt.signature = openpgp.signature.readArmored(signed.signature);
            return openpgp.verify(verifyOpt);
          }).then(function(verified) {
            expect(verified.data).to.equal(plaintext);
            expect(verified.signatures[0].valid).to.be.null;
            expect(verified.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(verified.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should sign and verify cleartext data and not armor', function() {
          var signOpt = {
            data: plaintext,
            privateKeys: privateKey.keys,
            armor: false
          };
          var verifyOpt = {
            publicKeys: publicKey.keys
          };
          return openpgp.sign(signOpt).then(function(signed) {
            verifyOpt.message = signed.message;
            return openpgp.verify(verifyOpt);
          }).then(function(verified) {
            expect(verified.data).to.equal(plaintext);
            expect(verified.signatures[0].valid).to.be.true;
            expect(verified.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(verified.signatures[0].signature.packets.length).to.equal(1);
          });
        });

        it('should sign and verify cleartext data and not armor with detached signatures', function() {
          var signOpt = {
            data: plaintext,
            privateKeys: privateKey.keys,
            detached: true,
            armor: false
          };
          var verifyOpt = {
            publicKeys: publicKey.keys
          };
          return openpgp.sign(signOpt).then(function(signed) {
            verifyOpt.message = new openpgp.cleartext.CleartextMessage(plaintext);
            verifyOpt.signature = signed.signature;
            return openpgp.verify(verifyOpt);
          }).then(function(verified) {
            expect(verified.data).to.equal(plaintext);
            expect(verified.signatures[0].valid).to.be.true;
            expect(verified.signatures[0].keyid.toHex()).to.equal(privateKey.keys[0].getSigningKeyPacket().getKeyId().toHex());
            expect(verified.signatures[0].signature.packets.length).to.equal(1);
          });
        });
      });

      describe('ELG / DSA encrypt, decrypt, sign, verify', function() {
        it('round trip test', function() {
          var pubKeyDE = openpgp.key.readArmored(pub_key_de).keys[0];
          var privKeyDE = openpgp.key.readArmored(priv_key_de).keys[0];
          privKeyDE.decrypt(passphrase);
          return openpgp.encrypt({
            publicKeys: pubKeyDE,
            privateKeys: privKeyDE,
            data: plaintext
          }).then(function(encrypted) {
            return openpgp.decrypt({
              privateKey: privKeyDE,
              publicKeys: pubKeyDE,
              message: openpgp.message.readArmored(encrypted.data)
            });
          }).then(function(encrypted) {
            expect(encrypted.data).to.exist;
            expect(encrypted.data).to.equal(plaintext);
            expect(encrypted.signatures[0].valid).to.be.true;
            expect(encrypted.signatures[0].keyid.toHex()).to.equal(privKeyDE.getSigningKeyPacket().getKeyId().toHex());
            expect(encrypted.signatures[0].signature.packets.length).to.equal(1);
          });
        });
      });

      describe("3DES decrypt", function() {
        var pgp_msg =
            ['-----BEGIN PGP MESSAGE-----',
            'Version: GnuPG/MacGPG2 v2.0.19 (Darwin)',
            'Comment: GPGTools - http://gpgtools.org',
            '',
            'hIwDBU4Dycfvp2EBA/9tuhQgOrcATcm2PRmIOcs6q947YhlsBTZZdVJDfVjkKlyM',
            'M0yE+lnNplWb041Cpfkkl6IvorKQd2iPbAkOL0IXwmVN41l+PvVgMcuFvvzetehG',
            'Ca0/VEYOaTZRNqyr9FIzcnVy1I/PaWT3iqVAYa+G8TEA5Dh9RLfsx8ZA9UNIaNI+',
            'ASm9aZ3H6FerNhm8RezDY5vRn6xw3o/wH5YEBvV2BEmmFKZ2BlqFQxqChr8UNwd1',
            'Ieebnq0HtBPE8YU/L0U=',
            '=JyIa',
            '-----END PGP MESSAGE-----'].join('\n');

        var priv_key =
            ['-----BEGIN PGP PRIVATE KEY BLOCK-----',
            'Version: GnuPG/MacGPG2 v2.0.19 (Darwin)',
            'Comment: GPGTools - http://gpgtools.org',
            '',
            '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',
            '22q10ausyQXoOxXfDWVwKA==',
            '=IkKW',
            '-----END PGP PRIVATE KEY BLOCK-----'].join('\n');

        it('Decrypt message', function() {
          var privKey, message;

          privKey = openpgp.key.readArmored(priv_key).keys[0];
          privKey.decrypt('1234');
          message = openpgp.message.readArmored(pgp_msg);

          return openpgp.decrypt({ privateKey:privKey, message:message }).then(function(decrypted) {
            expect(decrypted.data).to.equal('hello 3des\n');
            expect(decrypted.signatures.length).to.equal(0);
          });
        });
      });

      describe('AES encrypt, decrypt', function() {
        it('should encrypt and decrypt with one password', function() {
          var encOpt = {
            data: plaintext,
            passwords: password1
          };
          var decOpt = {
            password: password1
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures.length).to.equal(0);
          });
        });

        it('should encrypt and decrypt with two passwords', function() {
          var encOpt = {
            data: plaintext,
            passwords: [password1, password2]
          };
          var decOpt = {
            password: password2
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = openpgp.message.readArmored(encrypted.data);
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures.length).to.equal(0);
          });
        });

        it('should encrypt and decrypt with password and not ascii armor', function() {
          var encOpt = {
            data: plaintext,
            passwords: password1,
            armor: false
          };
          var decOpt = {
            password: password1
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = encrypted.message;
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            expect(decrypted.data).to.equal(plaintext);
            expect(decrypted.signatures.length).to.equal(0);
          });
        });

        it('should encrypt and decrypt with binary data and transferable objects', function() {
          openpgp.config.zero_copy = true; // activate transferable objects
          var encOpt = {
            data: new Uint8Array([0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01]),
            passwords: password1,
            armor: false
          };
          var decOpt = {
            password: password1,
            format: 'binary'
          };
          return openpgp.encrypt(encOpt).then(function(encrypted) {
            decOpt.message = encrypted.message;
            return openpgp.decrypt(decOpt);
          }).then(function(decrypted) {
            if (openpgp.getWorker()) {
              expect(encOpt.data.byteLength).to.equal(0); // transfered buffer should be empty
            }
            expect(decrypted.data).to.deep.equal(new Uint8Array([0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01]));
            expect(decrypted.signatures.length).to.equal(0);
          });
        });
      });

      describe('Errors', function() {

        it('Error message should contain the original error message', function() {
          return openpgp.encrypt({
            data: new Uint8Array([0x01, 0x01, 0x01]),
            passwords: null
          })
          .then(function() {
            throw new Error('Error expected.');
          })
          .catch(function(error) {
            expect(error.message).to.match(/No keys, passwords, or session key provided/);
          });
        });

      });

    }

  });

});
