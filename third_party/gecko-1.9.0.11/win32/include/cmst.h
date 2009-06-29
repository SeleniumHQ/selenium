/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Netscape security libraries.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1994-2000
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * Header for CMS types.
 *
 * $Id: cmst.h,v 1.10 2005/06/27 22:21:19 julien.pierre.bugs%sun.com Exp $
 */

#ifndef _CMST_H_
#define _CMST_H_

#include "seccomon.h"
#include "secoidt.h"
#include "certt.h"
#include "secmodt.h"
#include "secmodt.h"

#include "plarena.h"

/* Non-opaque objects.  NOTE, though: I want them to be treated as
 * opaque as much as possible.  If I could hide them completely,
 * I would.  (I tried, but ran into trouble that was taking me too
 * much time to get out of.)  I still intend to try to do so.
 * In fact, the only type that "outsiders" should even *name* is
 * NSSCMSMessage, and they should not reference its fields.
 */
/* rjr: PKCS #11 cert handling (pk11cert.c) does use NSSCMSRecipientInfo's.
 * This is because when we search the recipient list for the cert and key we
 * want, we need to invert the order of the loops we used to have. The old
 * loops were:
 *
 *  For each recipient {
 *       find_cert = PK11_Find_AllCert(recipient->issuerSN);
 *       [which unrolls to... ]
 *       For each slot {
 *            Log into slot;
 *            search slot for cert;
 *      }
 *  }
 *
 *  the new loop searchs all the recipients at once on a slot. this allows
 *  PKCS #11 to order slots in such a way that logout slots don't get checked
 *  if we can find the cert on a logged in slot. This eliminates lots of
 *  spurious password prompts when smart cards are installed... so why this
 *  comment? If you make NSSCMSRecipientInfo completely opaque, you need
 *  to provide a non-opaque list of issuerSN's (the only field PKCS#11 needs
 *  and fix up pk11cert.c first. NOTE: Only S/MIME calls this special PKCS #11
 *  function.
 */

typedef struct NSSCMSMessageStr NSSCMSMessage;

typedef union NSSCMSContentUnion NSSCMSContent;
typedef struct NSSCMSContentInfoStr NSSCMSContentInfo;

typedef struct NSSCMSSignedDataStr NSSCMSSignedData;
typedef struct NSSCMSSignerInfoStr NSSCMSSignerInfo;
typedef struct NSSCMSSignerIdentifierStr NSSCMSSignerIdentifier;

typedef struct NSSCMSEnvelopedDataStr NSSCMSEnvelopedData;
typedef struct NSSCMSOriginatorInfoStr NSSCMSOriginatorInfo;
typedef struct NSSCMSRecipientInfoStr NSSCMSRecipientInfo;

typedef struct NSSCMSDigestedDataStr NSSCMSDigestedData;
typedef struct NSSCMSEncryptedDataStr NSSCMSEncryptedData;

typedef struct NSSCMSSMIMEKEAParametersStr NSSCMSSMIMEKEAParameters;

typedef struct NSSCMSAttributeStr NSSCMSAttribute;

typedef struct NSSCMSDecoderContextStr NSSCMSDecoderContext;
typedef struct NSSCMSEncoderContextStr NSSCMSEncoderContext;

typedef struct NSSCMSCipherContextStr NSSCMSCipherContext;
typedef struct NSSCMSDigestContextStr NSSCMSDigestContext;

/*
 * Type of function passed to NSSCMSDecode or NSSCMSDecoderStart.
 * If specified, this is where the content bytes (only) will be "sent"
 * as they are recovered during the decoding.
 * And:
 * Type of function passed to NSSCMSEncode or NSSCMSEncoderStart.
 * This is where the DER-encoded bytes will be "sent".
 *
 * XXX Should just combine this with NSSCMSEncoderContentCallback type
 * and use a simpler, common name.
 */
typedef void (*NSSCMSContentCallback)(void *arg, const char *buf, unsigned long len);

/*
 * Type of function passed to NSSCMSDecode or NSSCMSDecoderStart
 * to retrieve the decryption key.  This function is intended to be
 * used for EncryptedData content info's which do not have a key available
 * in a certificate, etc.
 */
typedef PK11SymKey *(*NSSCMSGetDecryptKeyCallback)(void *arg, SECAlgorithmID *algid);


/* =============================================================================
 * ENCAPSULATED CONTENTINFO & CONTENTINFO
 */

union NSSCMSContentUnion {
    /* either unstructured */
    SECItem *			data;
    /* or structured data */
    NSSCMSDigestedData *	digestedData;
    NSSCMSEncryptedData	*	encryptedData;
    NSSCMSEnvelopedData	*	envelopedData;
    NSSCMSSignedData *		signedData;
    /* or anonymous pointer to something */
    void *			pointer;
};

struct NSSCMSContentInfoStr {
    SECItem			contentType;
    NSSCMSContent		content;
    /* --------- local; not part of encoding --------- */
    SECOidData *		contentTypeTag;	

    /* additional info for encryptedData and envelopedData */
    /* we waste this space for signedData and digestedData. sue me. */

    SECAlgorithmID		contentEncAlg;
    SECItem *			rawContent;		/* encrypted DER, optional */
							/* XXXX bytes not encrypted, but encoded? */
    /* --------- local; not part of encoding --------- */
    PK11SymKey *		bulkkey;		/* bulk encryption key */
    int				keysize;		/* size of bulk encryption key
							 * (only used by creation code) */
    SECOidTag			contentEncAlgTag;	/* oid tag of encryption algorithm
							 * (only used by creation code) */
    NSSCMSCipherContext		*ciphcx;		/* context for en/decryption going on */
    NSSCMSDigestContext		*digcx;			/* context for digesting going on */
};

/* =============================================================================
 * MESSAGE
 */

struct NSSCMSMessageStr {
    NSSCMSContentInfo	contentInfo;		/* "outer" cinfo */
    /* --------- local; not part of encoding --------- */
    PLArenaPool *	poolp;
    PRBool		poolp_is_ours;
    int			refCount;
    /* properties of the "inner" data */
    SECAlgorithmID **	detached_digestalgs;
    SECItem **		detached_digests;
    void *		pwfn_arg;
    NSSCMSGetDecryptKeyCallback decrypt_key_cb;
    void *		decrypt_key_cb_arg;
};

/* =============================================================================
 * SIGNEDDATA
 */

struct NSSCMSSignedDataStr {
    SECItem			version;
    SECAlgorithmID **		digestAlgorithms;
    NSSCMSContentInfo		contentInfo;
    SECItem **			rawCerts;
    CERTSignedCrl **		crls;
    NSSCMSSignerInfo **		signerInfos;
    /* --------- local; not part of encoding --------- */
    NSSCMSMessage *		cmsg;			/* back pointer to message */
    SECItem **			digests;
    CERTCertificate **		certs;
    CERTCertificateList **	certLists;
    CERTCertificate **          tempCerts;              /* temporary certs, needed
                                                         * for example for signature
                                                         * verification */
};
#define NSS_CMS_SIGNED_DATA_VERSION_BASIC	1	/* what we *create* */
#define NSS_CMS_SIGNED_DATA_VERSION_EXT		3	/* what we *create* */

typedef enum {
    NSSCMSVS_Unverified = 0,
    NSSCMSVS_GoodSignature = 1,
    NSSCMSVS_BadSignature = 2,
    NSSCMSVS_DigestMismatch = 3,
    NSSCMSVS_SigningCertNotFound = 4,
    NSSCMSVS_SigningCertNotTrusted = 5,
    NSSCMSVS_SignatureAlgorithmUnknown = 6,
    NSSCMSVS_SignatureAlgorithmUnsupported = 7,
    NSSCMSVS_MalformedSignature = 8,
    NSSCMSVS_ProcessingError = 9
} NSSCMSVerificationStatus;

typedef enum {
    NSSCMSSignerID_IssuerSN = 0,
    NSSCMSSignerID_SubjectKeyID = 1
} NSSCMSSignerIDSelector;

struct NSSCMSSignerIdentifierStr {
    NSSCMSSignerIDSelector identifierType;
    union {
	CERTIssuerAndSN *issuerAndSN;
	SECItem *subjectKeyID;
    } id;
};

struct NSSCMSSignerInfoStr {
    SECItem			version;
    NSSCMSSignerIdentifier	signerIdentifier;
    SECAlgorithmID		digestAlg;
    NSSCMSAttribute **		authAttr;
    SECAlgorithmID		digestEncAlg;
    SECItem			encDigest;
    NSSCMSAttribute **		unAuthAttr;
    /* --------- local; not part of encoding --------- */
    NSSCMSMessage *		cmsg;			/* back pointer to message */
    CERTCertificate *		cert;
    CERTCertificateList *	certList;
    PRTime			signingTime;
    NSSCMSVerificationStatus	verificationStatus;
    SECKEYPrivateKey *          signingKey; /* Used if we're using subjKeyID*/
    SECKEYPublicKey *           pubKey;
};
#define NSS_CMS_SIGNER_INFO_VERSION_ISSUERSN	1	/* what we *create* */
#define NSS_CMS_SIGNER_INFO_VERSION_SUBJKEY	3	/* what we *create* */

typedef enum {
    NSSCMSCM_None = 0,
    NSSCMSCM_CertOnly = 1,
    NSSCMSCM_CertChain = 2,
    NSSCMSCM_CertChainWithRoot = 3
} NSSCMSCertChainMode;

/* =============================================================================
 * ENVELOPED DATA
 */
struct NSSCMSEnvelopedDataStr {
    SECItem			version;
    NSSCMSOriginatorInfo *	originatorInfo;		/* optional */
    NSSCMSRecipientInfo **	recipientInfos;
    NSSCMSContentInfo		contentInfo;
    NSSCMSAttribute **		unprotectedAttr;
    /* --------- local; not part of encoding --------- */
    NSSCMSMessage *		cmsg;			/* back pointer to message */
};
#define NSS_CMS_ENVELOPED_DATA_VERSION_REG	0	/* what we *create* */
#define NSS_CMS_ENVELOPED_DATA_VERSION_ADV	2	/* what we *create* */

struct NSSCMSOriginatorInfoStr {
    SECItem **			rawCerts;
    CERTSignedCrl **		crls;
    /* --------- local; not part of encoding --------- */
    CERTCertificate **		certs;
};

/* -----------------------------------------------------------------------------
 * key transport recipient info
 */
typedef enum {
    NSSCMSRecipientID_IssuerSN = 0,
    NSSCMSRecipientID_SubjectKeyID = 1,
    NSSCMSRecipientID_BrandNew = 2
} NSSCMSRecipientIDSelector;

struct NSSCMSRecipientIdentifierStr {
    NSSCMSRecipientIDSelector	identifierType;
    union {
	CERTIssuerAndSN		*issuerAndSN;
	SECItem 		*subjectKeyID;
    } id;
};
typedef struct NSSCMSRecipientIdentifierStr NSSCMSRecipientIdentifier;

struct NSSCMSKeyTransRecipientInfoStr {
    SECItem			version;
    NSSCMSRecipientIdentifier	recipientIdentifier;
    SECAlgorithmID		keyEncAlg;
    SECItem			encKey;
};
typedef struct NSSCMSKeyTransRecipientInfoStr NSSCMSKeyTransRecipientInfo;

/*
 * View comments before NSSCMSRecipientInfoStr for purpose of this
 * structure.
 */
struct NSSCMSKeyTransRecipientInfoExStr {
    NSSCMSKeyTransRecipientInfo recipientInfo;
    int version;  /* version of this structure (0) */
    SECKEYPublicKey *pubKey;
};

typedef struct NSSCMSKeyTransRecipientInfoExStr NSSCMSKeyTransRecipientInfoEx;

#define NSS_CMS_KEYTRANS_RECIPIENT_INFO_VERSION_ISSUERSN	0	/* what we *create* */
#define NSS_CMS_KEYTRANS_RECIPIENT_INFO_VERSION_SUBJKEY		2	/* what we *create* */

/* -----------------------------------------------------------------------------
 * key agreement recipient info
 */
struct NSSCMSOriginatorPublicKeyStr {
    SECAlgorithmID			algorithmIdentifier;
    SECItem				publicKey;			/* bit string! */
};
typedef struct NSSCMSOriginatorPublicKeyStr NSSCMSOriginatorPublicKey;

typedef enum {
    NSSCMSOriginatorIDOrKey_IssuerSN = 0,
    NSSCMSOriginatorIDOrKey_SubjectKeyID = 1,
    NSSCMSOriginatorIDOrKey_OriginatorPublicKey = 2
} NSSCMSOriginatorIDOrKeySelector;

struct NSSCMSOriginatorIdentifierOrKeyStr {
    NSSCMSOriginatorIDOrKeySelector identifierType;
    union {
	CERTIssuerAndSN			*issuerAndSN;		/* static-static */
	SECItem				*subjectKeyID;		/* static-static */
	NSSCMSOriginatorPublicKey	originatorPublicKey;	/* ephemeral-static */
    } id;
};
typedef struct NSSCMSOriginatorIdentifierOrKeyStr NSSCMSOriginatorIdentifierOrKey;

struct NSSCMSRecipientKeyIdentifierStr {
    SECItem *				subjectKeyIdentifier;
    SECItem *				date;			/* optional */
    SECItem *				other;			/* optional */
};
typedef struct NSSCMSRecipientKeyIdentifierStr NSSCMSRecipientKeyIdentifier;

typedef enum {
    NSSCMSKeyAgreeRecipientID_IssuerSN = 0,
    NSSCMSKeyAgreeRecipientID_RKeyID = 1
} NSSCMSKeyAgreeRecipientIDSelector;

struct NSSCMSKeyAgreeRecipientIdentifierStr {
    NSSCMSKeyAgreeRecipientIDSelector	identifierType;
    union {
	CERTIssuerAndSN			*issuerAndSN;
	NSSCMSRecipientKeyIdentifier	recipientKeyIdentifier;
    } id;
};
typedef struct NSSCMSKeyAgreeRecipientIdentifierStr NSSCMSKeyAgreeRecipientIdentifier;

struct NSSCMSRecipientEncryptedKeyStr {
    NSSCMSKeyAgreeRecipientIdentifier	recipientIdentifier;
    SECItem				encKey;
};
typedef struct NSSCMSRecipientEncryptedKeyStr NSSCMSRecipientEncryptedKey;

struct NSSCMSKeyAgreeRecipientInfoStr {
    SECItem				version;
    NSSCMSOriginatorIdentifierOrKey	originatorIdentifierOrKey;
    SECItem *				ukm;				/* optional */
    SECAlgorithmID			keyEncAlg;
    NSSCMSRecipientEncryptedKey **	recipientEncryptedKeys;
};
typedef struct NSSCMSKeyAgreeRecipientInfoStr NSSCMSKeyAgreeRecipientInfo;

#define NSS_CMS_KEYAGREE_RECIPIENT_INFO_VERSION	3	/* what we *create* */

/* -----------------------------------------------------------------------------
 * KEK recipient info
 */
struct NSSCMSKEKIdentifierStr {
    SECItem			keyIdentifier;
    SECItem *			date;			/* optional */
    SECItem *			other;			/* optional */
};
typedef struct NSSCMSKEKIdentifierStr NSSCMSKEKIdentifier;

struct NSSCMSKEKRecipientInfoStr {
    SECItem			version;
    NSSCMSKEKIdentifier		kekIdentifier;
    SECAlgorithmID		keyEncAlg;
    SECItem			encKey;
};
typedef struct NSSCMSKEKRecipientInfoStr NSSCMSKEKRecipientInfo;

#define NSS_CMS_KEK_RECIPIENT_INFO_VERSION	4	/* what we *create* */

/* -----------------------------------------------------------------------------
 * recipient info
 */

typedef enum {
    NSSCMSRecipientInfoID_KeyTrans = 0,
    NSSCMSRecipientInfoID_KeyAgree = 1,
    NSSCMSRecipientInfoID_KEK = 2
} NSSCMSRecipientInfoIDSelector;

/*
 * In order to preserve backwards binary compatibility when implementing
 * creation of Recipient Info's that uses subjectKeyID in the 
 * keyTransRecipientInfo we need to stash a public key pointer in this
 * structure somewhere.  We figured out that NSSCMSKeyTransRecipientInfo
 * is the smallest member of the ri union.  We're in luck since that's
 * the very structure that would need to use the public key. So we created
 * a new structure NSSCMSKeyTransRecipientInfoEx which has a member 
 * NSSCMSKeyTransRecipientInfo as the first member followed by a version
 * and a public key pointer.  This way we can keep backwards compatibility
 * without changing the size of this structure.
 *
 * BTW, size of structure:
 * NSSCMSKeyTransRecipientInfo:  9 ints, 4 pointers
 * NSSCMSKeyAgreeRecipientInfo: 12 ints, 8 pointers
 * NSSCMSKEKRecipientInfo:      10 ints, 7 pointers
 *
 * The new structure:
 * NSSCMSKeyTransRecipientInfoEx: sizeof(NSSCMSKeyTransRecipientInfo) +
 *                                1 int, 1 pointer
 */

struct NSSCMSRecipientInfoStr {
    NSSCMSRecipientInfoIDSelector recipientInfoType;
    union {
	NSSCMSKeyTransRecipientInfo keyTransRecipientInfo;
	NSSCMSKeyAgreeRecipientInfo keyAgreeRecipientInfo;
	NSSCMSKEKRecipientInfo kekRecipientInfo;
	NSSCMSKeyTransRecipientInfoEx keyTransRecipientInfoEx;
    } ri;
    /* --------- local; not part of encoding --------- */
    NSSCMSMessage *		cmsg;			/* back pointer to message */
    CERTCertificate *		cert;			/* recipient's certificate */
};

/* =============================================================================
 * DIGESTED DATA
 */
struct NSSCMSDigestedDataStr {
    SECItem			version;
    SECAlgorithmID		digestAlg;
    NSSCMSContentInfo		contentInfo;
    SECItem			digest;
    /* --------- local; not part of encoding --------- */
    NSSCMSMessage *		cmsg;		/* back pointer */
    SECItem			cdigest;	/* calculated digest */
};
#define NSS_CMS_DIGESTED_DATA_VERSION_DATA	0	/* what we *create* */
#define NSS_CMS_DIGESTED_DATA_VERSION_ENCAP	2	/* what we *create* */

/* =============================================================================
 * ENCRYPTED DATA
 */
struct NSSCMSEncryptedDataStr {
    SECItem			version;
    NSSCMSContentInfo		contentInfo;
    NSSCMSAttribute **		unprotectedAttr;	/* optional */
    /* --------- local; not part of encoding --------- */
    NSSCMSMessage *		cmsg;		/* back pointer */
};
#define NSS_CMS_ENCRYPTED_DATA_VERSION		0	/* what we *create* */
#define NSS_CMS_ENCRYPTED_DATA_VERSION_UPATTR	2	/* what we *create* */

/* =============================================================================
 * FORTEZZA KEA
 */

/* An enumerated type used to select templates based on the encryption
   scenario and data specifics. */
typedef enum {
    NSSCMSKEAInvalid = -1,
    NSSCMSKEAUsesSkipjack = 0,
    NSSCMSKEAUsesNonSkipjack = 1,
    NSSCMSKEAUsesNonSkipjackWithPaddedEncKey = 2
} NSSCMSKEATemplateSelector;

/* ### mwelch - S/MIME KEA parameters. These don't really fit here,
                but I cannot think of a more appropriate place at this time. */
struct NSSCMSSMIMEKEAParametersStr {
    SECItem originatorKEAKey;	/* sender KEA key (encrypted?) */
    SECItem originatorRA;	/* random number generated by sender */
    SECItem nonSkipjackIV;	/* init'n vector for SkipjackCBC64
			           decryption of KEA key if Skipjack
				   is not the bulk algorithm used on
				   the message */
    SECItem bulkKeySize;	/* if Skipjack is not the bulk
			           algorithm used on the message,
				   and the size of the bulk encryption
				   key is not the same as that of
				   originatorKEAKey (due to padding
				   perhaps), this field will contain
				   the real size of the bulk encryption
				   key. */
};

/*
 * *****************************************************************************
 * *****************************************************************************
 * *****************************************************************************
 */

/*
 * See comment above about this type not really belonging to CMS.
 */
struct NSSCMSAttributeStr {
    /* The following fields make up an encoded Attribute: */
    SECItem			type;
    SECItem **			values;	/* data may or may not be encoded */
    /* The following fields are not part of an encoded Attribute: */
    SECOidData *		typeTag;
    PRBool			encoded;	/* when true, values are encoded */
};

#endif /* _CMST_H_ */
