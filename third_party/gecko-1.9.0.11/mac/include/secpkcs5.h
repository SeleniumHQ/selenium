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
#ifndef _SECPKCS5_H_
#define _SECPKCS5_H_
#include "seccomon.h"
#include "secmodt.h"

/* used for V2 PKCS 12 Draft Spec */
typedef enum {
    pbeBitGenIDNull = 0,
    pbeBitGenCipherKey = 0x01,
    pbeBitGenCipherIV = 0x02,
    pbeBitGenIntegrityKey = 0x03
} PBEBitGenID;

typedef struct PBEBitGenContextStr PBEBitGenContext;

SEC_BEGIN_PROTOS

/* private */
SECAlgorithmID *
sec_pkcs5CreateAlgorithmID(SECOidTag algorithm, SECOidTag cipherAlgorithm,
			SECOidTag prfAlg, SECOidTag *pPbeAlgorithm,
			int keyLengh, SECItem *salt, int iteration);

/* Get the initialization vector.  The password is passed in, hashing
 * is performed, and the initialization vector is returned.
 *  algid is a pointer to a PBE algorithm ID
 *  pwitem is the password
 * If an error occurs or the algorithm id is not a PBE algrithm,
 * NULL is returned.  Otherwise, the iv is returned in a secitem.
 */
SECItem *
SEC_PKCS5GetIV(SECAlgorithmID *algid, SECItem *pwitem, PRBool faulty3DES);

SECOidTag SEC_PKCS5GetCryptoAlgorithm(SECAlgorithmID *algid);
PRBool SEC_PKCS5IsAlgorithmPBEAlg(SECAlgorithmID *algid);
PRBool SEC_PKCS5IsAlgorithmPBEAlgTag(SECOidTag algTag);
SECOidTag SEC_PKCS5GetPBEAlgorithm(SECOidTag algTag, int keyLen);
int SEC_PKCS5GetKeyLength(SECAlgorithmID *algid);

/**********************************************************************
 * Deprecated PBE functions.  Use the PBE functions in pk11func.h
 * instead.
 **********************************************************************/

PBEBitGenContext *
PBE_CreateContext(SECOidTag hashAlgorithm, PBEBitGenID bitGenPurpose,
        SECItem *pwitem, SECItem *salt, unsigned int bitsNeeded,
        unsigned int iterations);

void
PBE_DestroyContext(PBEBitGenContext *context);


SECItem *
PBE_GenerateBits(PBEBitGenContext *context);

SEC_END_PROTOS

#endif /* _SECPKS5_H_ */
