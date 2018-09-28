'use strict';

/**
 * @module enums
 */

export default {

  /** A string to key specifier type
   * @enum {Integer}
   * @readonly
   */
  s2k: {
    simple: 0,
    salted: 1,
    iterated: 3,
    gnu: 101
  },

  /** {@link http://tools.ietf.org/html/rfc4880#section-9.1|RFC4880, section 9.1}
   * @enum {Integer}
   * @readonly
   */
  publicKey: {
    rsa_encrypt_sign: 1,
    rsa_encrypt: 2,
    rsa_sign: 3,
    elgamal: 16,
    dsa: 17
  },

  /** {@link http://tools.ietf.org/html/rfc4880#section-9.2|RFC4880, section 9.2}
   * @enum {Integer}
   * @readonly
   */
  symmetric: {
    plaintext: 0,
    /** Not implemented! */
    idea: 1,
    tripledes: 2,
    cast5: 3,
    blowfish: 4,
    aes128: 7,
    aes192: 8,
    aes256: 9,
    twofish: 10
  },

  /** {@link http://tools.ietf.org/html/rfc4880#section-9.3|RFC4880, section 9.3}
   * @enum {Integer}
   * @readonly
   */
  compression: {
    uncompressed: 0,
    /** RFC1951 */
    zip: 1,
    /** RFC1950 */
    zlib: 2,
    bzip2: 3
  },

  /** {@link http://tools.ietf.org/html/rfc4880#section-9.4|RFC4880, section 9.4}
   * @enum {Integer}
   * @readonly
   */
  hash: {
    md5: 1,
    sha1: 2,
    ripemd: 3,
    sha256: 8,
    sha384: 9,
    sha512: 10,
    sha224: 11
  },

  /** A list of packet types and numeric tags associated with them.
   * @enum {Integer}
   * @readonly
   */
  packet: {
    publicKeyEncryptedSessionKey: 1,
    signature: 2,
    symEncryptedSessionKey: 3,
    onePassSignature: 4,
    secretKey: 5,
    publicKey: 6,
    secretSubkey: 7,
    compressed: 8,
    symmetricallyEncrypted: 9,
    marker: 10,
    literal: 11,
    trust: 12,
    userid: 13,
    publicSubkey: 14,
    userAttribute: 17,
    symEncryptedIntegrityProtected: 18,
    modificationDetectionCode: 19,
    symEncryptedAEADProtected: 20 // see IETF draft: https://tools.ietf.org/html/draft-ford-openpgp-format-00#section-2.1
  },

  /** Data types in the literal packet
   * @enum {Integer}
   * @readonly
   */
  literal: {
    /** Binary data 'b' */
    binary: 'b'.charCodeAt(),
    /** Text data 't' */
    text: 't'.charCodeAt(),
    /** Utf8 data 'u' */
    utf8: 'u'.charCodeAt()
  },


  /** One pass signature packet type
   * @enum {Integer}
   * @readonly
   */
  signature: {
    /** 0x00: Signature of a binary document. */
    binary: 0,
    /** 0x01: Signature of a canonical text document.<br/>
     * Canonicalyzing the document by converting line endings. */
    text: 1,
    /** 0x02: Standalone signature.<br/>
     * This signature is a signature of only its own subpacket contents.
     * It is calculated identically to a signature over a zero-lengh
     * binary document.  Note that it doesn't make sense to have a V3
     * standalone signature. */
    standalone: 2,
    /** 0x10: Generic certification of a User ID and Public-Key packet.<br/>
     * The issuer of this certification does not make any particular
     * assertion as to how well the certifier has checked that the owner
     * of the key is in fact the person described by the User ID. */
    cert_generic: 16,
    /** 0x11: Persona certification of a User ID and Public-Key packet.<br/>
     * The issuer of this certification has not done any verification of
     * the claim that the owner of this key is the User ID specified. */
    cert_persona: 17,
    /** 0x12: Casual certification of a User ID and Public-Key packet.<br/>
     * The issuer of this certification has done some casual
     * verification of the claim of identity. */
    cert_casual: 18,
    /** 0x13: Positive certification of a User ID and Public-Key packet.<br/>
     * The issuer of this certification has done substantial
     * verification of the claim of identity.<br/>
     * <br/>
     * Most OpenPGP implementations make their "key signatures" as 0x10
     * certifications.  Some implementations can issue 0x11-0x13
     * certifications, but few differentiate between the types. */
    cert_positive: 19,
    /** 0x30: Certification revocation signature<br/>
     * This signature revokes an earlier User ID certification signature
     * (signature class 0x10 through 0x13) or direct-key signature
     * (0x1F).  It should be issued by the same key that issued the
     * revoked signature or an authorized revocation key.  The signature
     * is computed over the same data as the certificate that it
     * revokes, and should have a later creation date than that
     * certificate. */
    cert_revocation: 48,
    /** 0x18: Subkey Binding Signature<br/>
     * This signature is a statement by the top-level signing key that
     * indicates that it owns the subkey.  This signature is calculated
     * directly on the primary key and subkey, and not on any User ID or
     * other packets.  A signature that binds a signing subkey MUST have
     * an Embedded Signature subpacket in this binding signature that
     * contains a 0x19 signature made by the signing subkey on the
     * primary key and subkey. */
    subkey_binding: 24,
    /** 0x19: Primary Key Binding Signature<br/>
     * This signature is a statement by a signing subkey, indicating
     * that it is owned by the primary key and subkey.  This signature
     * is calculated the same way as a 0x18 signature: directly on the
     * primary key and subkey, and not on any User ID or other packets.<br/>
     * <br/>
     * When a signature is made over a key, the hash data starts with the
     * octet 0x99, followed by a two-octet length of the key, and then body
     * of the key packet.  (Note that this is an old-style packet header for
     * a key packet with two-octet length.)  A subkey binding signature
     * (type 0x18) or primary key binding signature (type 0x19) then hashes
     * the subkey using the same format as the main key (also using 0x99 as
     * the first octet). */
    key_binding: 25,
    /** 0x1F: Signature directly on a key<br/>
     * This signature is calculated directly on a key.  It binds the
     * information in the Signature subpackets to the key, and is
     * appropriate to be used for subpackets that provide information
     * about the key, such as the Revocation Key subpacket.  It is also
     * appropriate for statements that non-self certifiers want to make
     * about the key itself, rather than the binding between a key and a
     * name. */
    key: 31,
    /** 0x20: Key revocation signature<br/>
     * The signature is calculated directly on the key being revoked.  A
     * revoked key is not to be used.  Only revocation signatures by the
     * key being revoked, or by an authorized revocation key, should be
     * considered valid revocation signatures.a */
    key_revocation: 32,
    /** 0x28: Subkey revocation signature<br/>
     * The signature is calculated directly on the subkey being revoked.
     * A revoked subkey is not to be used.  Only revocation signatures
     * by the top-level signature key that is bound to this subkey, or
     * by an authorized revocation key, should be considered valid
     * revocation signatures.<br/>
     * <br/>
     * Key revocation signatures (types 0x20 and 0x28)
     * hash only the key being revoked. */
    subkey_revocation: 40,
    /** 0x40: Timestamp signature.<br/>
     * This signature is only meaningful for the timestamp contained in
     * it. */
    timestamp: 64,
    /** 0x50: Third-Party Confirmation signature.<br/>
     * This signature is a signature over some other OpenPGP Signature
     * packet(s).  It is analogous to a notary seal on the signed data.
     * A third-party signature SHOULD include Signature Target
     * subpacket(s) to give easy identification.  Note that we really do
     * mean SHOULD.  There are plausible uses for this (such as a blind
     * party that only sees the signature, not the key or source
     * document) that cannot include a target subpacket. */
    third_party: 80
  },

  /** Signature subpacket type
   * @enum {Integer}
   * @readonly
   */
  signatureSubpacket: {
    signature_creation_time: 2,
    signature_expiration_time: 3,
    exportable_certification: 4,
    trust_signature: 5,
    regular_expression: 6,
    revocable: 7,
    key_expiration_time: 9,
    placeholder_backwards_compatibility: 10,
    preferred_symmetric_algorithms: 11,
    revocation_key: 12,
    issuer: 16,
    notation_data: 20,
    preferred_hash_algorithms: 21,
    preferred_compression_algorithms: 22,
    key_server_preferences: 23,
    preferred_key_server: 24,
    primary_user_id: 25,
    policy_uri: 26,
    key_flags: 27,
    signers_user_id: 28,
    reason_for_revocation: 29,
    features: 30,
    signature_target: 31,
    embedded_signature: 32
  },

  /** Key flags
   * @enum {Integer}
   * @readonly
   */
  keyFlags: {
    /** 0x01 - This key may be used to certify other keys. */
    certify_keys: 1,
    /** 0x02 - This key may be used to sign data. */
    sign_data: 2,
    /** 0x04 - This key may be used to encrypt communications. */
    encrypt_communication: 4,
    /** 0x08 - This key may be used to encrypt storage. */
    encrypt_storage: 8,
    /** 0x10 - The private component of this key may have been split
     *        by a secret-sharing mechanism. */
    split_private_key: 16,
    /** 0x20 - This key may be used for authentication. */
    authentication: 32,
    /** 0x80 - The private component of this key may be in the
     *        possession of more than one person. */
    shared_private_key: 128
  },

  /** Key status
   * @enum {Integer}
   * @readonly
   */
  keyStatus: {
    invalid:      0,
    expired:      1,
    revoked:      2,
    valid:        3,
    no_self_cert: 4
  },

  /** Armor type
   * @enum {Integer}
   * @readonly
   */
  armor: {
    multipart_section: 0,
    multipart_last: 1,
    signed: 2,
    message: 3,
    public_key: 4,
    private_key: 5,
    signature: 6
  },

  /** Asserts validity and converts from string/integer to integer. */
  write: function(type, e) {
    if (typeof e === 'number') {
      e = this.read(type, e);
    }

    if (type[e] !== undefined) {
      return type[e];
    } else {
      throw new Error('Invalid enum value.');
    }
  },

  /** Converts from an integer to string. */
  read: function(type, e) {
    for (var i in type) {
      if (type[i] === parseInt(e)) {
        return i;
      }
    }

    throw new Error('Invalid enum value.');
  }

};
