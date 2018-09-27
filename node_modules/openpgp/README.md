OpenPGP.js [![Build Status](https://travis-ci.org/openpgpjs/openpgpjs.svg?branch=master)](https://travis-ci.org/openpgpjs/openpgpjs)
==========

[OpenPGP.js](http://openpgpjs.org/) is a Javascript implementation of the OpenPGP protocol. This is defined in [RFC 4880](http://tools.ietf.org/html/rfc4880).

[![Saucelabs Test Status](https://saucelabs.com/browser-matrix/openpgpjs.svg)](https://saucelabs.com/u/openpgpjs)


### Platform support

* OpenPGP.js v2.x is written in ES6 but is transpiled to ES5 using [Babel](https://babeljs.io/) to run in most environments. We support node.js v0.12+ and browsers that implement [window.crypto.getRandomValues](http://caniuse.com/#feat=getrandomvalues).

* The api uses ES6 promises which are available in [most modern browsers](http://caniuse.com/#feat=promises). If you need to support browsers that do not support Promises, fear not! There is a [polyfill](https://github.com/jakearchibald/es6-promise), which is included in our build. So no action required on your part!

* For the OpenPGP HTTP Key Server (HKP) client the new [fetch api](http://caniuse.com/#feat=fetch) is used. There is a polyfill for both [browsers](https://github.com/github/fetch) and [node.js](https://github.com/bitinn/node-fetch) runtimes. The node module is included as a dependency if you install via npm, but we do not include the browser polyfill in our build. So you'll need to include it in your app if you intend to use the HKP client.


### Performance

* Version 2.x of the library has been built from the ground up with Uint8Arrays. This allows for much better performance and memory usage than strings.

* If the user's browser supports [native WebCrypto](http://caniuse.com/#feat=cryptography) via the `window.crypto.subtle` api, this will be used. Under node.js the native [crypto module](https://nodejs.org/api/crypto.html#crypto_crypto) is used. This can be deactivated by setting `openpgp.config.use_native = false`.

* The library implements the [IETF proposal](https://tools.ietf.org/html/draft-ford-openpgp-format-00) for authenticated encryption [using native AES-GCM](https://github.com/openpgpjs/openpgpjs/pull/430). This makes symmetric encryption about 30x faster on supported platforms. Since the specification has not been finalized and other OpenPGP implementations haven't adopted it yet, the feature is currently behind a flag. You can activate it by setting `openpgp.config.aead_protect = true`. **Note: activating this setting can break compatibility with other OpenPGP implementations, so be careful if that's one of your requirements.**

* For environments that don't provide native crypto, the library falls back to [asm.js](http://caniuse.com/#feat=asmjs) implementations of AES, SHA-1, and SHA-256. We use [Rusha](https://github.com/srijs/rusha) and [asmCrypto Lite](https://github.com/openpgpjs/asmcrypto-lite) (a minimal subset of asmCrypto.js built specifically for OpenPGP.js).


### Getting started

#### Npm

    npm install --save openpgp

#### Bower

    bower install --save openpgp

Or just fetch a minified build under [dist](https://github.com/openpgpjs/openpgpjs/tree/master/dist).


### Examples

Here are some examples of how to use the v2.x api. For more elaborate examples and working code, please check out the [public api unit tests](https://github.com/openpgpjs/openpgpjs/blob/master/test/general/openpgp.js). If you're upgrading from v1.x it might help to check out the [documentation](https://github.com/openpgpjs/openpgpjs#documentation).

#### Set up

```js
var openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp

openpgp.initWorker({ path:'openpgp.worker.js' }) // set the relative web worker path

openpgp.config.aead_protect = true // activate fast AES-GCM mode (not yet OpenPGP standard)
```

#### Encrypt and decrypt *Uint8Array* data with a password

```js
var options, encrypted;

options = {
    data: new Uint8Array([0x01, 0x01, 0x01]), // input as Uint8Array (or String)
    passwords: ['secret stuff'],              // multiple passwords possible
    armor: false                              // don't ASCII armor (for Uint8Array output)
};

openpgp.encrypt(options).then(function(ciphertext) {
    encrypted = ciphertext.message.packets.write(); // get raw encrypted packets as Uint8Array
});
```

```js
options = {
    message: openpgp.message.read(encrypted), // parse encrypted bytes
    password: 'secret stuff',                 // decrypt with password
    format: 'binary'                          // output as Uint8Array
};

openpgp.decrypt(options).then(function(plaintext) {
    return plaintext.data // Uint8Array([0x01, 0x01, 0x01])
});
```

#### Encrypt and decrypt *String* data with PGP keys

```js
var options, encrypted;

var pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK ... END PGP PUBLIC KEY BLOCK-----';
var privkey = '-----BEGIN PGP PRIVATE KEY BLOCK ... END PGP PRIVATE KEY BLOCK-----'; //encrypted private key
var passphrase = 'secret passphrase'; //what the privKey is encrypted with

var privKeyObj = openpgp.key.readArmored(privkey).keys[0];
privKeyObj.decrypt(passphrase);

options = {
    data: 'Hello, World!',                             // input as String (or Uint8Array)
    publicKeys: openpgp.key.readArmored(pubkey).keys,  // for encryption
    privateKeys: privKeyObj // for signing (optional)
};

openpgp.encrypt(options).then(function(ciphertext) {
    encrypted = ciphertext.data; // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
});
```

```js
options = {
    message: openpgp.message.readArmored(encrypted),     // parse armored message
    publicKeys: openpgp.key.readArmored(pubkey).keys,    // for verification (optional)
    privateKey: privKeyObj // for decryption
};

openpgp.decrypt(options).then(function(plaintext) {
    return plaintext.data; // 'Hello, World!'
});
```

#### Generate new key pair

```js
var options = {
    userIds: [{ name:'Jon Smith', email:'jon@example.com' }], // multiple user IDs
    numBits: 4096,                                            // RSA key size
    passphrase: 'super long and hard to guess secret'         // protects the private key
};

openpgp.generateKey(options).then(function(key) {
    var privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
    var pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
});
```

#### Lookup public key on HKP server

```js
var hkp = new openpgp.HKP('https://pgp.mit.edu');

var options = {
    query: 'alice@example.com'
};

hkp.lookup(options).then(function(key) {
    var pubkey = openpgp.key.readArmored(key);
});
```

#### Upload public key to HKP server

```js
var hkp = new openpgp.HKP('https://pgp.mit.edu');

var pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK ... END PGP PUBLIC KEY BLOCK-----';

hkp.upload(pubkey).then(function() { ... });
```

#### Sign and verify cleartext messages

```js
var options, cleartext, validity;

var pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK ... END PGP PUBLIC KEY BLOCK-----';
var privkey = '-----BEGIN PGP PRIVATE KEY BLOCK ... END PGP PRIVATE KEY BLOCK-----'; //encrypted private key
var passphrase = 'secret passphrase'; //what the privKey is encrypted with

var privKeyObj = openpgp.key.readArmored(privkey).keys[0];
privKeyObj.decrypt(passphrase);
```

```js
options = {
    data: 'Hello, World!',                             // input as String (or Uint8Array)
    privateKeys: privKeyObj // for signing
};

openpgp.sign(options).then(function(signed) {
    cleartext = signed.data; // '-----BEGIN PGP SIGNED MESSAGE ... END PGP SIGNATURE-----'
});
```

```js
options = {
    message: openpgp.cleartext.readArmored(cleartext), // parse armored message
    publicKeys: openpgp.key.readArmored(pubkey).keys   // for verification
};

openpgp.verify(options).then(function(verified) {
	validity = verified.signatures[0].valid; // true
	if (validity) {
		console.log('signed by key id ' + verified.signatures[0].keyid.toHex());
	}
});
```

#### Create and verify *detached* signatures

```js
var options, cleartext, detachedSig, validity;

var pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK ... END PGP PUBLIC KEY BLOCK-----';
var privkey = '-----BEGIN PGP PRIVATE KEY BLOCK ... END PGP PRIVATE KEY BLOCK-----'; //encrypted private key
var passphrase = 'secret passphrase'; //what the privKey is encrypted with

var privKeyObj = openpgp.key.readArmored(privkey).keys[0];
privKeyObj.decrypt(passphrase);
```

```js
options = {
    data: 'Hello, World!',                             // input as String (or Uint8Array)
    privateKeys: privKeyObj, // for signing
    detached: true
};

openpgp.sign(options).then(function(signed) {
    cleartext = signed.data;
    detachedSig = signed.signature;
});
```


```js
options = {
    message: openpgp.cleartext.readArmored(cleartext), // parse armored message
    signature: openpgp.signature.readArmored(detachedSig), // parse detached signature
    publicKeys: openpgp.key.readArmored(pubkey).keys   // for verification
};

openpgp.verify(options).then(function(verified) {
    validity = verified.signatures[0].valid; // true
    if (validity) {
        console.log('signed by key id ' + verified.signatures[0].keyid.toHex());
    }
});
```

### Documentation

A jsdoc build of our code comments is available at [doc/index.html](http://openpgpjs.org/openpgpjs/doc/index.html). Public calls should generally be made through the OpenPGP object [doc/openpgp.html](http://openpgpjs.org/openpgpjs/doc/module-openpgp.html).

### Security Audit

To date the OpenPGP.js code base has undergone two complete security audits from [Cure53](https://cure53.de). The first audit's report has been published [here](https://github.com/openpgpjs/openpgpjs/wiki/Cure53-security-audit).

### Security recommendations

It should be noted that js crypto apps deployed via regular web hosting (a.k.a. [**host-based security**](https://www.schneier.com/blog/archives/2012/08/cryptocat.html)) provide users with less security than installable apps with auditable static versions. Installable apps can be deployed as a [Firefox](https://developer.mozilla.org/en-US/Marketplace/Options/Packaged_apps) or [Chrome](https://developer.chrome.com/apps/about_apps.html) packaged app. These apps are basically signed zip files and their runtimes typically enforce a strict [Content Security Policy (CSP)](http://www.html5rocks.com/en/tutorials/security/content-security-policy/) to protect users against [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting). This [blogpost](https://tankredhase.com/2014/04/13/heartbleed-and-javascript-crypto/) explains the trust model of the web quite well.

It is also recommended to set a strong passphrase that protects the user's private key on disk.

### Development

To create your own build of the library, just run the following command after cloning the git repo. This will download all dependencies, run the tests and create a minified bundle under `dist/openpgp.min.js` to use in your project:

    npm install && npm test

### How do I get involved?

You want to help, great! Go ahead and fork our repo, make your changes and send us a pull request.

### License

GNU Lesser General Public License (3.0 or any later version). Please take a look at the [LICENSE](LICENSE) file for more information.

### Resources

Below is a collection of resources, many of these were projects that were in someway a precursor to the current OpenPGP.js project. If you'd like to add your link here, please do so in a pull request or email to the list.

* [http://www.hanewin.net/encrypt/](http://www.hanewin.net/encrypt/)
* [https://github.com/seancolyer/gmail-crypt](https://github.com/seancolyer/gmail-crypt)
* [https://github.com/mete0r/jspg](https://github.com/mete0r/jspg)
* [http://fitblip.pub/JSPGP-Stuffs/](http://fitblip.pub/JSPGP-Stuffs/)
* [http://qooxdoo.org/contrib/project/crypto](http://qooxdoo.org/contrib/project/crypto)
* [https://github.com/GPGTools/Mobile/wiki/Introduction](https://github.com/GPGTools/Mobile/wiki/Introduction)
* [http://gpg4browsers.recurity.com/](http://gpg4browsers.recurity.com/)
* [https://github.com/gmontalvoriv/mailock](https://github.com/gmontalvoriv/mailock)
