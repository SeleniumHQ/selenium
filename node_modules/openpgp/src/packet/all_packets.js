/**
 * @requires enums
 * @module packet
 */

'use strict';

import enums from '../enums.js';
import * as packets from './all_packets.js'; // re-import module to parse packets from tag

/** @see module:packet/compressed */
export { default as Compressed } from './compressed.js';
/** @see module:packet/sym_encrypted_integrity_protected */
export { default as SymEncryptedIntegrityProtected } from './sym_encrypted_integrity_protected.js';
/** @see module:packet/sym_encrypted_aead_protected */
export { default as SymEncryptedAEADProtected } from './sym_encrypted_aead_protected.js';
/** @see module:packet/public_key_encrypted_session_key */
export { default as PublicKeyEncryptedSessionKey } from './public_key_encrypted_session_key.js';
/** @see module:packet/sym_encrypted_session_key */
export { default as SymEncryptedSessionKey } from './sym_encrypted_session_key.js';
/** @see module:packet/literal */
export { default as Literal } from './literal.js';
/** @see module:packet/public_key */
export { default as PublicKey } from './public_key.js';
/** @see module:packet/symmetrically_encrypted */
export { default as SymmetricallyEncrypted } from './symmetrically_encrypted.js';
/** @see module:packet/marker */
export { default as Marker } from './marker.js';
/** @see module:packet/public_subkey */
export { default as PublicSubkey } from './public_subkey.js';
/** @see module:packet/user_attribute */
export { default as UserAttribute } from './user_attribute.js';
/** @see module:packet/one_pass_signature */
export { default as OnePassSignature } from './one_pass_signature.js';
/** @see module:packet/secret_key */
export { default as SecretKey } from './secret_key.js';
/** @see module:packet/userid */
export { default as Userid } from './userid.js';
/** @see module:packet/secret_subkey */
export { default as SecretSubkey } from './secret_subkey.js';
/** @see module:packet/signature */
export { default as Signature } from './signature.js';
/** @see module:packet/trust */
export { default as Trust } from './trust.js';

/**
 * Allocate a new packet
 * @param {String} tag property name from {@link module:enums.packet}
 * @returns {Object} new packet object with type based on tag
 */
export function newPacketFromTag(tag) {
  return new packets[packetClassFromTagName(tag)]();
}

/**
 * Allocate a new packet from structured packet clone
 * See {@link http://www.w3.org/html/wg/drafts/html/master/infrastructure.html#safe-passing-of-structured-data}
 * @param {Object} packetClone packet clone
 * @returns {Object} new packet object with data from packet clone
 */
export function fromStructuredClone(packetClone) {
  var tagName = enums.read(enums.packet, packetClone.tag);
  var packet = newPacketFromTag(tagName);
  for (var attr in packetClone) {
    if (packetClone.hasOwnProperty(attr)) {
      packet[attr] = packetClone[attr];
    }
  }
  if (packet.postCloneTypeFix) {
    packet.postCloneTypeFix();
  }
  return packet;
}

/**
 * Convert tag name to class name
 * @param {String} tag property name from {@link module:enums.packet}
 * @returns {String}
 */
function packetClassFromTagName(tag) {
  return tag.substr(0, 1).toUpperCase() + tag.substr(1);
}
