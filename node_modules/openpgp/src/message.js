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

/**
 * @requires config
 * @requires crypto
 * @requires encoding/armor
 * @requires enums
 * @requires packet
 * @module message
 */

'use strict';

import util from './util.js';
import packet from './packet';
import enums from './enums.js';
import armor from './encoding/armor.js';
import config from './config';
import crypto from './crypto';
import * as sigModule from './signature.js';
import * as keyModule from './key.js';

/**
 * @class
 * @classdesc Class that represents an OpenPGP message.
 * Can be an encrypted message, signed message, compressed message or literal message
 * @param  {module:packet/packetlist} packetlist The packets that form this message
 * See {@link http://tools.ietf.org/html/rfc4880#section-11.3}
 */

export function Message(packetlist) {
  if (!(this instanceof Message)) {
    return new Message(packetlist);
  }
  this.packets = packetlist || new packet.List();
}

/**
 * Returns the key IDs of the keys to which the session key is encrypted
 * @return {Array<module:type/keyid>} array of keyid objects
 */
Message.prototype.getEncryptionKeyIds = function() {
  var keyIds = [];
  var pkESKeyPacketlist = this.packets.filterByTag(enums.packet.publicKeyEncryptedSessionKey);
  pkESKeyPacketlist.forEach(function(packet) {
    keyIds.push(packet.publicKeyId);
  });
  return keyIds;
};

/**
 * Returns the key IDs of the keys that signed the message
 * @return {Array<module:type/keyid>} array of keyid objects
 */
Message.prototype.getSigningKeyIds = function() {
  var keyIds = [];
  var msg = this.unwrapCompressed();
  // search for one pass signatures
  var onePassSigList = msg.packets.filterByTag(enums.packet.onePassSignature);
  onePassSigList.forEach(function(packet) {
    keyIds.push(packet.signingKeyId);
  });
  // if nothing found look for signature packets
  if (!keyIds.length) {
    var signatureList = msg.packets.filterByTag(enums.packet.signature);
    signatureList.forEach(function(packet) {
      keyIds.push(packet.issuerKeyId);
    });
  }
  return keyIds;
};

/**
 * Decrypt the message. Either a private key, a session key, or a password must be specified.
 * @param  {Key} privateKey      (optional) private key with decrypted secret data
 * @param  {Object} sessionKey   (optional) session key in the form: { data:Uint8Array, algorithm:String }
 * @param  {String} password     (optional) password used to decrypt
 * @return {Message}             new message with decrypted content
 */
Message.prototype.decrypt = function(privateKey, sessionKey, password) {
  return Promise.resolve().then(() => {
    const keyObj = sessionKey || this.decryptSessionKey(privateKey, password);
    if (!keyObj || !util.isUint8Array(keyObj.data) || !util.isString(keyObj.algorithm)) {
      throw new Error('Invalid session key for decryption.');
    }

    const symEncryptedPacketlist = this.packets.filterByTag(
      enums.packet.symmetricallyEncrypted,
      enums.packet.symEncryptedIntegrityProtected,
      enums.packet.symEncryptedAEADProtected
    );

    if (symEncryptedPacketlist.length === 0) {
      return;
    }

    const symEncryptedPacket = symEncryptedPacketlist[0];
    return symEncryptedPacket.decrypt(keyObj.algorithm, keyObj.data).then(() => {
      const resultMsg = new Message(symEncryptedPacket.packets);
      symEncryptedPacket.packets = new packet.List(); // remove packets after decryption
      return resultMsg;
    });
  });
};

/**
 * Decrypt an encrypted session key either with a private key or a password.
 * @param  {Key} privateKey    (optional) private key with decrypted secret data
 * @param  {String} password   (optional) password used to decrypt
 * @return {Object}            object with sessionKey, algorithm in the form:
 *                               { data:Uint8Array, algorithm:String }
 */
Message.prototype.decryptSessionKey = function(privateKey, password) {
  var keyPacket;

  if (password) {
    var symEncryptedSessionKeyPacketlist = this.packets.filterByTag(enums.packet.symEncryptedSessionKey);
    var symLength = symEncryptedSessionKeyPacketlist.length;
    for (var i = 0; i < symLength; i++) {
      keyPacket = symEncryptedSessionKeyPacketlist[i];
      try {
        keyPacket.decrypt(password);
        break;
      }
      catch(err) {
        if (i === (symLength - 1)) {
          throw err;
        }
      }
    }
    if (!keyPacket) {
      throw new Error('No symmetrically encrypted session key packet found.');
    }

  } else if (privateKey) {
    var encryptionKeyIds = this.getEncryptionKeyIds();
    if (!encryptionKeyIds.length) {
      // nothing to decrypt
      return;
    }
    var privateKeyPacket = privateKey.getKeyPacket(encryptionKeyIds);
    if (!privateKeyPacket.isDecrypted) {
      throw new Error('Private key is not decrypted.');
    }
    var pkESKeyPacketlist = this.packets.filterByTag(enums.packet.publicKeyEncryptedSessionKey);
    for (var j = 0; j < pkESKeyPacketlist.length; j++) {
      if (pkESKeyPacketlist[j].publicKeyId.equals(privateKeyPacket.getKeyId())) {
        keyPacket = pkESKeyPacketlist[j];
        keyPacket.decrypt(privateKeyPacket);
        break;
      }
    }

  } else {
    throw new Error('No key or password specified.');
  }

  if (keyPacket) {
    return {
      data: keyPacket.sessionKey,
      algorithm: keyPacket.sessionKeyAlgorithm
    };
  }
};

/**
 * Get literal data that is the body of the message
 * @return {(Uint8Array|null)} literal body of the message as Uint8Array
 */
Message.prototype.getLiteralData = function() {
  var literal = this.packets.findPacket(enums.packet.literal);
  return literal && literal.data || null;
};

/**
 * Get filename from literal data packet
 * @return {(String|null)} filename of literal data packet as string
 */
Message.prototype.getFilename = function() {
  var literal = this.packets.findPacket(enums.packet.literal);
  return literal && literal.getFilename() || null;
};

/**
 * Get literal data as text
 * @return {(String|null)} literal body of the message interpreted as text
 */
Message.prototype.getText = function() {
  var literal = this.packets.findPacket(enums.packet.literal);
  if (literal) {
    return literal.getText();
  } else {
    return null;
  }
};

/**
 * Encrypt the message either with public keys, passwords, or both at once.
 * @param  {Array<Key>} keys           (optional) public key(s) for message encryption
 * @param  {Array<String>} passwords   (optional) password(s) for message encryption
 * @param  {Object} sessionKey         (optional) session key in the form: { data:Uint8Array, algorithm:String }
 * @return {Message}                   new message with encrypted content
 */
Message.prototype.encrypt = function(keys, passwords, sessionKey) {
  let symAlgo, msg, symEncryptedPacket;
  return Promise.resolve().then(() => {
    if (sessionKey) {
      if (!util.isUint8Array(sessionKey.data) || !util.isString(sessionKey.algorithm)) {
        throw new Error('Invalid session key for encryption.');
      }
      symAlgo = sessionKey.algorithm;
      sessionKey = sessionKey.data;
    } else if (keys && keys.length) {
      symAlgo = enums.read(enums.symmetric, keyModule.getPreferredSymAlgo(keys));
    } else if (passwords && passwords.length) {
      symAlgo = enums.read(enums.symmetric, config.encryption_cipher);
    } else {
      throw new Error('No keys, passwords, or session key provided.');
    }

    if (!sessionKey) {
      sessionKey = crypto.generateSessionKey(symAlgo);
    }

    msg = encryptSessionKey(sessionKey, symAlgo, keys, passwords);

    if (config.aead_protect) {
      symEncryptedPacket = new packet.SymEncryptedAEADProtected();
    } else if (config.integrity_protect) {
      symEncryptedPacket = new packet.SymEncryptedIntegrityProtected();
    } else {
      symEncryptedPacket = new packet.SymmetricallyEncrypted();
    }
    symEncryptedPacket.packets = this.packets;

    return symEncryptedPacket.encrypt(symAlgo, sessionKey);

  }).then(() => {
    msg.packets.push(symEncryptedPacket);
    symEncryptedPacket.packets = new packet.List(); // remove packets after encryption
    return {
      message: msg,
      sessionKey: {
        data: sessionKey,
        algorithm: symAlgo
      }
    };
  });
};

/**
 * Encrypt a session key either with public keys, passwords, or both at once.
 * @param  {Uint8Array} sessionKey     session key for encryption
 * @param  {String} symAlgo            session key algorithm
 * @param  {Array<Key>} publicKeys     (optional) public key(s) for message encryption
 * @param  {Array<String>} passwords   (optional) for message encryption
 * @return {Message}                   new message with encrypted content
 */
export function encryptSessionKey(sessionKey, symAlgo, publicKeys, passwords) {
  var packetlist = new packet.List();

  if (publicKeys) {
    publicKeys.forEach(function(key) {
      var encryptionKeyPacket = key.getEncryptionKeyPacket();
      if (encryptionKeyPacket) {
        var pkESKeyPacket = new packet.PublicKeyEncryptedSessionKey();
        pkESKeyPacket.publicKeyId = encryptionKeyPacket.getKeyId();
        pkESKeyPacket.publicKeyAlgorithm = encryptionKeyPacket.algorithm;
        pkESKeyPacket.sessionKey = sessionKey;
        pkESKeyPacket.sessionKeyAlgorithm = symAlgo;
        pkESKeyPacket.encrypt(encryptionKeyPacket);
        delete pkESKeyPacket.sessionKey; // delete plaintext session key after encryption
        packetlist.push(pkESKeyPacket);
      } else {
        throw new Error('Could not find valid key packet for encryption in key ' + key.primaryKey.getKeyId().toHex());
      }
    });
  }

  if (passwords) {
    passwords.forEach(function(password) {
      var symEncryptedSessionKeyPacket = new packet.SymEncryptedSessionKey();
      symEncryptedSessionKeyPacket.sessionKey = sessionKey;
      symEncryptedSessionKeyPacket.sessionKeyAlgorithm = symAlgo;
      symEncryptedSessionKeyPacket.encrypt(password);
      delete symEncryptedSessionKeyPacket.sessionKey; // delete plaintext session key after encryption
      packetlist.push(symEncryptedSessionKeyPacket);
    });
  }

  return new Message(packetlist);
}

/**
 * Sign the message (the literal data packet of the message)
 * @param  {Array<module:key~Key>}        privateKey private keys with decrypted secret key data for signing
 * @param  {Signature} signature          (optional) any existing detached signature to add to the message
 * @return {module:message~Message}       new message with signed content
 */
Message.prototype.sign = function(privateKeys=[], signature=null) {

  var packetlist = new packet.List();

  var literalDataPacket = this.packets.findPacket(enums.packet.literal);
  if (!literalDataPacket) {
    throw new Error('No literal data packet to sign.');
  }

  var literalFormat = enums.write(enums.literal, literalDataPacket.format);
  var signatureType = literalFormat === enums.literal.binary ?
                      enums.signature.binary : enums.signature.text;
  var i, signingKeyPacket, existingSigPacketlist, onePassSig;

  if (signature) {
    existingSigPacketlist = signature.packets.filterByTag(enums.packet.signature);
    if (existingSigPacketlist.length) {
      for (i = existingSigPacketlist.length - 1; i >= 0; i--) {
        var sigPacket = existingSigPacketlist[i];
        onePassSig = new packet.OnePassSignature();
        onePassSig.type = signatureType;
        onePassSig.hashAlgorithm = config.prefer_hash_algorithm;
        onePassSig.publicKeyAlgorithm = sigPacket.publicKeyAlgorithm;
        onePassSig.signingKeyId = sigPacket.issuerKeyId;
        if (!privateKeys.length && i === 0) {
          onePassSig.flags = 1;
        }
        packetlist.push(onePassSig);
      }
    }
  }
  for (i = 0; i < privateKeys.length; i++) {
    if (privateKeys[i].isPublic()) {
      throw new Error('Need private key for signing');
    }
    onePassSig = new packet.OnePassSignature();
    onePassSig.type = signatureType;
    //TODO get preferred hashg algo from key signature
    onePassSig.hashAlgorithm = config.prefer_hash_algorithm;
    signingKeyPacket = privateKeys[i].getSigningKeyPacket();
    if (!signingKeyPacket) {
      throw new Error('Could not find valid key packet for signing in key ' + privateKeys[i].primaryKey.getKeyId().toHex());
    }
    onePassSig.publicKeyAlgorithm = signingKeyPacket.algorithm;
    onePassSig.signingKeyId = signingKeyPacket.getKeyId();
    if (i === privateKeys.length - 1) {
      onePassSig.flags = 1;
    }
    packetlist.push(onePassSig);
  }

  packetlist.push(literalDataPacket);

  for (i = privateKeys.length - 1; i >= 0; i--) {
    var signaturePacket = new packet.Signature();
    signaturePacket.signatureType = signatureType;
    signaturePacket.hashAlgorithm = config.prefer_hash_algorithm;
    signaturePacket.publicKeyAlgorithm = signingKeyPacket.algorithm;
    if (!signingKeyPacket.isDecrypted) {
      throw new Error('Private key is not decrypted.');
    }
    signaturePacket.sign(signingKeyPacket, literalDataPacket);
    packetlist.push(signaturePacket);
  }

  if (signature) {
    packetlist.concat(existingSigPacketlist);
  }

  return new Message(packetlist);
};

/**
 * Create a detached signature for the message (the literal data packet of the message)
 * @param  {Array<module:key~Key>}           privateKey private keys with decrypted secret key data for signing
 * @param  {Signature} signature             (optional) any existing detached signature
 * @return {module:signature~Signature}      new detached signature of message content
 */
Message.prototype.signDetached = function(privateKeys=[], signature=null) {

  var packetlist = new packet.List();

  var literalDataPacket = this.packets.findPacket(enums.packet.literal);
  if (!literalDataPacket) {
    throw new Error('No literal data packet to sign.');
  }

  var literalFormat = enums.write(enums.literal, literalDataPacket.format);
  var signatureType = literalFormat === enums.literal.binary ?
                      enums.signature.binary : enums.signature.text;

  for (var i = 0; i < privateKeys.length; i++) {
    var signingKeyPacket = privateKeys[i].getSigningKeyPacket();
    var signaturePacket = new packet.Signature();
    signaturePacket.signatureType = signatureType;
    signaturePacket.hashAlgorithm = config.prefer_hash_algorithm;
    signaturePacket.publicKeyAlgorithm = signingKeyPacket.algorithm;
    if (!signingKeyPacket.isDecrypted) {
      throw new Error('Private key is not decrypted.');
    }
    signaturePacket.sign(signingKeyPacket, literalDataPacket);
    packetlist.push(signaturePacket);
  }
  if (signature) {
    var existingSigPacketlist = signature.packets.filterByTag(enums.packet.signature);
    packetlist.concat(existingSigPacketlist);
  }

  return new sigModule.Signature(packetlist);
};


/**
 * Verify message signatures
 * @param {Array<module:key~Key>} keys array of keys to verify signatures
 * @return {Array<({keyid: module:type/keyid, valid: Boolean})>} list of signer's keyid and validity of signature
 */
Message.prototype.verify = function(keys) {
  var msg = this.unwrapCompressed();
  var literalDataList = msg.packets.filterByTag(enums.packet.literal);
  if (literalDataList.length !== 1) {
    throw new Error('Can only verify message with one literal data packet.');
  }
  var signatureList = msg.packets.filterByTag(enums.packet.signature);
  return createVerificationObjects(signatureList, literalDataList, keys);
};

/**
 * Verify detached message signature
 * @param {Array<module:key~Key>} keys array of keys to verify signatures
 * @param {Signature}
 * @return {Array<({keyid: module:type/keyid, valid: Boolean})>} list of signer's keyid and validity of signature
 */
Message.prototype.verifyDetached = function(signature, keys) {
  var msg = this.unwrapCompressed();
  var literalDataList = msg.packets.filterByTag(enums.packet.literal);
  if (literalDataList.length !== 1) {
    throw new Error('Can only verify message with one literal data packet.');
  }
  var signatureList = signature.packets;
  return createVerificationObjects(signatureList, literalDataList, keys);
};

/**
 * Create list of objects containing signer's keyid and validity of signature
 * @param {Array<module:packet/signature>} signatureList array of signature packets
 * @param {Array<module:packet/literal>} literalDataList array of literal data packets
 * @param {Array<module:key~Key>} keys array of keys to verify signatures
 * @return {Array<({keyid: module:type/keyid, valid: Boolean})>} list of signer's keyid and validity of signature
 */
function createVerificationObjects(signatureList, literalDataList, keys) {
  var result = [];
  for (var i = 0; i < signatureList.length; i++) {
    var keyPacket = null;
    for (var j = 0; j < keys.length; j++) {
      keyPacket = keys[j].getSigningKeyPacket(signatureList[i].issuerKeyId, config.verify_expired_keys);
      if (keyPacket) {
        break;
      }
    }

    var verifiedSig = {};
    if (keyPacket) {
      //found a key packet that matches keyId of signature
      verifiedSig.keyid = signatureList[i].issuerKeyId;
      verifiedSig.valid = signatureList[i].verify(keyPacket, literalDataList[0]);
    } else {
      verifiedSig.keyid = signatureList[i].issuerKeyId;
      verifiedSig.valid = null;
    }

    var packetlist = new packet.List();
    packetlist.push(signatureList[i]);
    verifiedSig.signature = new sigModule.Signature(packetlist);

    result.push(verifiedSig);
  }
  return result;
}

/**
 * Unwrap compressed message
 * @return {module:message~Message} message Content of compressed message
 */
Message.prototype.unwrapCompressed = function() {
  var compressed = this.packets.filterByTag(enums.packet.compressed);
  if (compressed.length) {
    return new Message(compressed[0].packets);
  } else {
    return this;
  }
};

/**
 * Returns ASCII armored text of message
 * @return {String} ASCII armor
 */
Message.prototype.armor = function() {
  return armor.encode(enums.armor.message, this.packets.write());
};

/**
 * reads an OpenPGP armored message and returns a message object
 * @param {String} armoredText text to be parsed
 * @return {module:message~Message} new message object
 * @static
 */
export function readArmored(armoredText) {
  //TODO how do we want to handle bad text? Exception throwing
  //TODO don't accept non-message armored texts
  var input = armor.decode(armoredText).data;
  return read(input);
}

/**
 * reads an OpenPGP message as byte array and returns a message object
 * @param {Uint8Array} input   binary message
 * @return {Message}           new message object
 * @static
 */
export function read(input) {
  var packetlist = new packet.List();
  packetlist.read(input);
  return new Message(packetlist);
}

/**
 * Create a message object from signed content and a detached armored signature.
 * @param {String} content An 8 bit ascii string containing e.g. a MIME subtree with text nodes or attachments
 * @param {String} detachedSignature The detached ascii armored PGP signature
 */
export function readSignedContent(content, detachedSignature) {
  var literalDataPacket = new packet.Literal();
  literalDataPacket.setBytes(util.str2Uint8Array(content), enums.read(enums.literal, enums.literal.binary));
  var packetlist = new packet.List();
  packetlist.push(literalDataPacket);
  var input = armor.decode(detachedSignature).data;
  packetlist.read(input);
  return new Message(packetlist);
}

/**
 * creates new message object from text
 * @param {String} text
 * @param {String} filename (optional)
 * @return {module:message~Message} new message object
 * @static
 */
export function fromText(text, filename) {
  var literalDataPacket = new packet.Literal();
  // text will be converted to UTF8
  literalDataPacket.setText(text);
  if (filename !== undefined) {
    literalDataPacket.setFilename(filename);
  }
  var literalDataPacketlist = new packet.List();
  literalDataPacketlist.push(literalDataPacket);
  return new Message(literalDataPacketlist);
}

/**
 * creates new message object from binary data
 * @param {Uint8Array} bytes
 * @param {String} filename (optional)
 * @return {module:message~Message} new message object
 * @static
 */
export function fromBinary(bytes, filename) {
  if (!util.isUint8Array(bytes)) {
    throw new Error('Data must be in the form of a Uint8Array');
  }

  var literalDataPacket = new packet.Literal();
  if (filename) {
    literalDataPacket.setFilename(filename);
  }
  literalDataPacket.setBytes(bytes, enums.read(enums.literal, enums.literal.binary));
  if (filename !== undefined) {
    literalDataPacket.setFilename(filename);
  }
  var literalDataPacketlist = new packet.List();
  literalDataPacketlist.push(literalDataPacket);
  return new Message(literalDataPacketlist);
}
