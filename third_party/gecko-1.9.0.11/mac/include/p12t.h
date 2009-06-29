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

#ifndef _P12T_H_
#define _P12T_H_

#include "secoid.h"
#include "key.h"
#include "pkcs11.h"
#include "secpkcs7.h"
#include "secdig.h"	/* for SGNDigestInfo */
#include "pkcs12t.h"

#define SEC_PKCS12_VERSION	3

/* structure declarations */
typedef struct sec_PKCS12PFXItemStr sec_PKCS12PFXItem;
typedef struct sec_PKCS12MacDataStr sec_PKCS12MacData;
typedef struct sec_PKCS12AuthenticatedSafeStr sec_PKCS12AuthenticatedSafe;
typedef struct sec_PKCS12SafeContentsStr sec_PKCS12SafeContents;
typedef struct sec_PKCS12SafeBagStr sec_PKCS12SafeBag;
typedef struct sec_PKCS12PKCS8ShroudedKeyBagStr sec_PKCS12PKCS8ShroudedKeyBag;
typedef struct sec_PKCS12CertBagStr sec_PKCS12CertBag;
typedef struct sec_PKCS12CRLBagStr sec_PKCS12CRLBag;
typedef struct sec_PKCS12SecretBag sec_PKCS12SecretBag;
typedef struct sec_PKCS12AttributeStr sec_PKCS12Attribute;

struct sec_PKCS12CertBagStr {
    /* what type of cert is stored? */
    SECItem bagID;

    /* certificate information */
    union {
	SECItem x509Cert;
	SECItem SDSICert;
    } value;
};

struct sec_PKCS12CRLBagStr {
    /* what type of cert is stored? */
    SECItem bagID;

    /* certificate information */
    union {
	SECItem x509CRL;
    } value;
};

struct sec_PKCS12SecretBag {
    /* what type of secret? */
    SECItem secretType;

    /* secret information.  ssshhhh be vewy vewy quiet. */
    SECItem secretContent;
};

struct sec_PKCS12AttributeStr {
    SECItem attrType;
    SECItem **attrValue;
};

struct sec_PKCS12SafeBagStr {

    /* What type of bag are we using? */
    SECItem safeBagType;

    /* Dependent upon the type of bag being used. */
    union {
	SECKEYPrivateKeyInfo *pkcs8KeyBag;
	SECKEYEncryptedPrivateKeyInfo *pkcs8ShroudedKeyBag;
	sec_PKCS12CertBag *certBag;
	sec_PKCS12CRLBag *crlBag;
	sec_PKCS12SecretBag *secretBag;
	sec_PKCS12SafeContents *safeContents;
    } safeBagContent;

    sec_PKCS12Attribute **attribs;

    /* used locally */
    SECOidData *bagTypeTag;
    PLArenaPool *arena;
    unsigned int nAttribs;

    /* used for validation/importing */
    PRBool problem, noInstall, validated, hasKey, unused, installed;
    int error;

    PRBool swapUnicodeBytes;
    PK11SlotInfo *slot;
    SECItem *pwitem;
    PRBool oldBagType;
    SECPKCS12TargetTokenCAs tokenCAs;
};
    
struct sec_PKCS12SafeContentsStr {
    sec_PKCS12SafeBag **safeBags;
    SECItem **encodedSafeBags;
    
    /* used locally */
    PLArenaPool *arena;
    unsigned int bagCount;
};

struct sec_PKCS12MacDataStr {
    SGNDigestInfo safeMac;
    SECItem macSalt;
    SECItem iter;
};

struct sec_PKCS12PFXItemStr {

    SECItem version;

    /* Content type will either be Data (password integrity mode)
     * or signedData (public-key integrity mode)
     */
    SEC_PKCS7ContentInfo *authSafe;
    SECItem encodedAuthSafe;

    /* Only present in password integrity mode */
    sec_PKCS12MacData macData;
    SECItem encodedMacData;
};

struct sec_PKCS12AuthenticatedSafeStr {
    /* Content type will either be encryptedData (password privacy mode)
     * or envelopedData (public-key privacy mode)
     */
    SEC_PKCS7ContentInfo **safes;
    SECItem **encodedSafes;

    /* used locally */
    unsigned int safeCount;
    SECItem dummySafe;
};

extern const SEC_ASN1Template sec_PKCS12PFXItemTemplate[];
extern const SEC_ASN1Template sec_PKCS12MacDataTemplate[];
extern const SEC_ASN1Template sec_PKCS12AuthenticatedSafeTemplate[];
extern const SEC_ASN1Template sec_PKCS12SafeContentsTemplate[];
extern const SEC_ASN1Template sec_PKCS12SafeContentsDecodeTemplate[];
extern const SEC_ASN1Template sec_PKCS12NestedSafeContentsDecodeTemplate[];
extern const SEC_ASN1Template sec_PKCS12CertBagTemplate[];
extern const SEC_ASN1Template sec_PKCS12CRLBagTemplate[];
extern const SEC_ASN1Template sec_PKCS12SecretBagTemplate[];
extern const SEC_ASN1Template sec_PKCS12PointerToCertBagTemplate[];
extern const SEC_ASN1Template sec_PKCS12PointerToCRLBagTemplate[];
extern const SEC_ASN1Template sec_PKCS12PointerToSecretBagTemplate[];
extern const SEC_ASN1Template sec_PKCS12PointerToSafeContentsTemplate[];
extern const SEC_ASN1Template sec_PKCS12AttributeTemplate[];
extern const SEC_ASN1Template sec_PKCS12PointerToContentInfoTemplate[];
extern const SEC_ASN1Template sec_PKCS12SafeBagTemplate[];

#endif
