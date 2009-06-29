/*
 * blapit.h - public data structures for the crypto library
 *
 * ***** BEGIN LICENSE BLOCK *****
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
 *   Dr Vipul Gupta <vipul.gupta@sun.com> and
 *   Douglas Stebila <douglas@stebila.ca>, Sun Microsystems Laboratories
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
/* $Id: blapit.h,v 1.21 2008/06/14 14:20:07 wtc%google.com Exp $ */

#ifndef _BLAPIT_H_
#define _BLAPIT_H_

#include "seccomon.h"
#include "prlink.h"
#include "plarena.h"
#include "ecl-exp.h"


/* RC2 operation modes */
#define NSS_RC2			0
#define NSS_RC2_CBC		1

/* RC5 operation modes */
#define NSS_RC5                 0
#define NSS_RC5_CBC             1

/* DES operation modes */
#define NSS_DES			0
#define NSS_DES_CBC		1
#define NSS_DES_EDE3		2
#define NSS_DES_EDE3_CBC	3

#define DES_KEY_LENGTH		8	/* Bytes */

/* AES operation modes */
#define NSS_AES                 0
#define NSS_AES_CBC             1

/* Camellia operation modes */
#define NSS_CAMELLIA                 0
#define NSS_CAMELLIA_CBC             1

#define DSA_SIGNATURE_LEN 	40	/* Bytes */
#define DSA_SUBPRIME_LEN	20	/* Bytes */

/* XXX We shouldn't have to hard code this limit. For
 * now, this is the quickest way to support ECDSA signature
 * processing (ECDSA signature lengths depend on curve
 * size). This limit is sufficient for curves upto
 * 576 bits.
 */
#define MAX_ECKEY_LEN 	        72	/* Bytes */

/*
 * Number of bytes each hash algorithm produces
 */
#define MD2_LENGTH		16	/* Bytes */
#define MD5_LENGTH		16	/* Bytes */
#define SHA1_LENGTH		20	/* Bytes */
#define SHA256_LENGTH 		32 	/* bytes */
#define SHA384_LENGTH 		48 	/* bytes */
#define SHA512_LENGTH 		64 	/* bytes */
#define HASH_LENGTH_MAX         SHA512_LENGTH

/*
 * Input block size for each hash algorithm.
 */

#define MD2_BLOCK_LENGTH 	 64 	/* bytes */
#define MD5_BLOCK_LENGTH 	 64 	/* bytes */
#define SHA1_BLOCK_LENGTH 	 64 	/* bytes */
#define SHA256_BLOCK_LENGTH 	 64 	/* bytes */
#define SHA384_BLOCK_LENGTH 	128 	/* bytes */
#define SHA512_BLOCK_LENGTH 	128 	/* bytes */
#define HASH_BLOCK_LENGTH_MAX 	SHA512_BLOCK_LENGTH

#define AES_KEY_WRAP_IV_BYTES    8
#define AES_KEY_WRAP_BLOCK_SIZE  8  /* bytes */
#define AES_BLOCK_SIZE          16  /* bytes */

#define CAMELLIA_BLOCK_SIZE          16  /* bytes */

#define NSS_FREEBL_DEFAULT_CHUNKSIZE 2048

/*
 * These values come from the initial key size limits from the PKCS #11
 * module. They may be arbitrarily adjusted to any value freebl supports.
 */
#define RSA_MIN_MODULUS_BITS   128
#define RSA_MAX_MODULUS_BITS  8192
#define RSA_MAX_EXPONENT_BITS   64
#define DH_MIN_P_BITS	       128
#define DH_MAX_P_BITS         2236

/*
 * The FIPS 186 algorithm for generating primes P and Q allows only 9
 * distinct values for the length of P, and only one value for the
 * length of Q.
 * The algorithm uses a variable j to indicate which of the 9 lengths
 * of P is to be used.
 * The following table relates j to the lengths of P and Q in bits.
 *
 *	j	bits in P	bits in Q
 *	_	_________	_________
 *	0	 512		160
 *	1	 576		160
 *	2	 640		160
 *	3	 704		160
 *	4	 768		160
 *	5	 832		160
 *	6	 896		160
 *	7	 960		160
 *	8	1024		160
 *
 * The FIPS-186 compliant PQG generator takes j as an input parameter.
 */

#define DSA_Q_BITS       160
#define DSA_MAX_P_BITS	1024
#define DSA_MIN_P_BITS	 512

/*
 * function takes desired number of bits in P,
 * returns index (0..8) or -1 if number of bits is invalid.
 */
#define PQG_PBITS_TO_INDEX(bits) \
    (((bits) < 512 || (bits) > 1024 || (bits) % 64) ? \
    -1 : (int)((bits)-512)/64)

/*
 * function takes index (0-8)
 * returns number of bits in P for that index, or -1 if index is invalid.
 */
#define PQG_INDEX_TO_PBITS(j) (((unsigned)(j) > 8) ? -1 : (512 + 64 * (j)))


/***************************************************************************
** Opaque objects 
*/

struct DESContextStr        ;
struct RC2ContextStr        ;
struct RC4ContextStr        ;
struct RC5ContextStr        ;
struct AESContextStr        ;
struct CamelliaContextStr   ;
struct MD2ContextStr        ;
struct MD5ContextStr        ;
struct SHA1ContextStr       ;
struct SHA256ContextStr     ;
struct SHA512ContextStr     ;
struct AESKeyWrapContextStr ;

typedef struct DESContextStr        DESContext;
typedef struct RC2ContextStr        RC2Context;
typedef struct RC4ContextStr        RC4Context;
typedef struct RC5ContextStr        RC5Context;
typedef struct AESContextStr        AESContext;
typedef struct CamelliaContextStr   CamelliaContext;
typedef struct MD2ContextStr        MD2Context;
typedef struct MD5ContextStr        MD5Context;
typedef struct SHA1ContextStr       SHA1Context;
typedef struct SHA256ContextStr     SHA256Context;
typedef struct SHA512ContextStr     SHA512Context;
/* SHA384Context is really a SHA512ContextStr.  This is not a mistake. */
typedef struct SHA512ContextStr     SHA384Context;
typedef struct AESKeyWrapContextStr AESKeyWrapContext;

/***************************************************************************
** RSA Public and Private Key structures
*/

/* member names from PKCS#1, section 7.1 */
struct RSAPublicKeyStr {
    PLArenaPool * arena;
    SECItem modulus;
    SECItem publicExponent;
};
typedef struct RSAPublicKeyStr RSAPublicKey;

/* member names from PKCS#1, section 7.2 */
struct RSAPrivateKeyStr {
    PLArenaPool * arena;
    SECItem version;
    SECItem modulus;
    SECItem publicExponent;
    SECItem privateExponent;
    SECItem prime1;
    SECItem prime2;
    SECItem exponent1;
    SECItem exponent2;
    SECItem coefficient;
};
typedef struct RSAPrivateKeyStr RSAPrivateKey;


/***************************************************************************
** DSA Public and Private Key and related structures
*/

struct PQGParamsStr {
    PLArenaPool *arena;
    SECItem prime;    /* p */
    SECItem subPrime; /* q */
    SECItem base;     /* g */
    /* XXX chrisk: this needs to be expanded to hold j and validationParms (RFC2459 7.3.2) */
};
typedef struct PQGParamsStr PQGParams;

struct PQGVerifyStr {
    PLArenaPool * arena;	/* includes this struct, seed, & h. */
    unsigned int  counter;
    SECItem       seed;
    SECItem       h;
};
typedef struct PQGVerifyStr PQGVerify;

struct DSAPublicKeyStr {
    PQGParams params;
    SECItem publicValue;
};
typedef struct DSAPublicKeyStr DSAPublicKey;

struct DSAPrivateKeyStr {
    PQGParams params;
    SECItem publicValue;
    SECItem privateValue;
};
typedef struct DSAPrivateKeyStr DSAPrivateKey;

/***************************************************************************
** Diffie-Hellman Public and Private Key and related structures
** Structure member names suggested by PKCS#3.
*/

struct DHParamsStr {
    PLArenaPool * arena;
    SECItem prime; /* p */
    SECItem base; /* g */
};
typedef struct DHParamsStr DHParams;

struct DHPublicKeyStr {
    PLArenaPool * arena;
    SECItem prime;
    SECItem base;
    SECItem publicValue;
};
typedef struct DHPublicKeyStr DHPublicKey;

struct DHPrivateKeyStr {
    PLArenaPool * arena;
    SECItem prime;
    SECItem base;
    SECItem publicValue;
    SECItem privateValue;
};
typedef struct DHPrivateKeyStr DHPrivateKey;

/***************************************************************************
** Data structures used for elliptic curve parameters and
** public and private keys.
*/

/*
** The ECParams data structures can encode elliptic curve 
** parameters for both GFp and GF2m curves.
*/

typedef enum { ec_params_explicit,
	       ec_params_named
} ECParamsType;

typedef enum { ec_field_GFp = 1,
               ec_field_GF2m
} ECFieldType;

struct ECFieldIDStr {
    int         size;   /* field size in bits */
    ECFieldType type;
    union {
        SECItem  prime; /* prime p for (GFp) */
        SECItem  poly;  /* irreducible binary polynomial for (GF2m) */
    } u;
    int         k1;     /* first coefficient of pentanomial or
                         * the only coefficient of trinomial 
                         */
    int         k2;     /* two remaining coefficients of pentanomial */
    int         k3;
};
typedef struct ECFieldIDStr ECFieldID;

struct ECCurveStr {
    SECItem a;          /* contains octet stream encoding of
                         * field element (X9.62 section 4.3.3) 
			 */
    SECItem b;
    SECItem seed;
};
typedef struct ECCurveStr ECCurve;

struct ECParamsStr {
    PLArenaPool * arena;
    ECParamsType  type;
    ECFieldID     fieldID;
    ECCurve       curve; 
    SECItem       base;
    SECItem       order; 
    int           cofactor;
    SECItem       DEREncoding;
    ECCurveName   name;
    SECItem       curveOID;
};
typedef struct ECParamsStr ECParams;

struct ECPublicKeyStr {
    ECParams ecParams;   
    SECItem publicValue;   /* elliptic curve point encoded as 
			    * octet stream.
			    */
};
typedef struct ECPublicKeyStr ECPublicKey;

struct ECPrivateKeyStr {
    ECParams ecParams;   
    SECItem publicValue;   /* encoded ec point */
    SECItem privateValue;  /* private big integer */
    SECItem version;       /* As per SEC 1, Appendix C, Section C.4 */
};
typedef struct ECPrivateKeyStr ECPrivateKey;

typedef void * (*BLapiAllocateFunc)(void);
typedef void (*BLapiDestroyContextFunc)(void *cx, PRBool freeit);
typedef SECStatus (*BLapiInitContextFunc)(void *cx, 
				   const unsigned char *key, 
				   unsigned int keylen,
				   const unsigned char *, 
				   int, 
				   unsigned int ,
				   unsigned int );
typedef SECStatus (*BLapiEncrypt)(void *cx, unsigned char *output,
				unsigned int *outputLen, 
				unsigned int maxOutputLen,
				const unsigned char *input, 
				unsigned int inputLen);

#endif /* _BLAPIT_H_ */
