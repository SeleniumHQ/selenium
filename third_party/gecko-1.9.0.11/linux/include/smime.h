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
 * Header file for routines specific to S/MIME.  Keep things that are pure
 * pkcs7 out of here; this is for S/MIME policy, S/MIME interoperability, etc.
 *
 * $Id: smime.h,v 1.8 2004/04/25 15:03:16 gerv%gerv.net Exp $
 */

#ifndef _SECMIME_H_
#define _SECMIME_H_ 1

#include "cms.h"


/************************************************************************/
SEC_BEGIN_PROTOS

/*
 * Initialize the local recording of the user S/MIME cipher preferences.
 * This function is called once for each cipher, the order being
 * important (first call records greatest preference, and so on).
 * When finished, it is called with a "which" of CIPHER_FAMILID_MASK.
 * If the function is called again after that, it is assumed that
 * the preferences are being reset, and the old preferences are
 * discarded.
 *
 * XXX This is for a particular user, and right now the storage is
 * XXX local, static.  The preference should be stored elsewhere to allow
 * XXX for multiple uses of one library?  How does SSL handle this;
 * XXX it has something similar?
 *
 *  - The "which" values are defined in ciferfam.h (the SMIME_* values,
 *    for example SMIME_DES_CBC_56).
 *  - If "on" is non-zero then the named cipher is enabled, otherwise
 *    it is disabled.  (It is not necessary to call the function for
 *    ciphers that are disabled, however, as that is the default.)
 *
 * If the cipher preference is successfully recorded, SECSuccess
 * is returned.  Otherwise SECFailure is returned.  The only errors
 * are due to failure allocating memory or bad parameters/calls:
 *	SEC_ERROR_XXX ("which" is not in the S/MIME cipher family)
 *	SEC_ERROR_XXX (function is being called more times than there
 *		are known/expected ciphers)
 */
extern SECStatus NSS_SMIMEUtil_EnableCipher(long which, int on);

/*
 * Initialize the local recording of the S/MIME policy.
 * This function is called to allow/disallow a particular cipher.
 *
 * XXX This is for a the current module, I think, so local, static storage
 * XXX is okay.  Is that correct, or could multiple uses of the same
 * XXX library expect to operate under different policies?
 *
 *  - The "which" values are defined in ciferfam.h (the SMIME_* values,
 *    for example SMIME_DES_CBC_56).
 *  - If "on" is non-zero then the named cipher is enabled, otherwise
 *    it is disabled.
 */
extern SECStatus NSS_SMIMEUtils_AllowCipher(long which, int on);

/*
 * Does the current policy allow S/MIME decryption of this particular
 * algorithm and keysize?
 */
extern PRBool NSS_SMIMEUtil_DecryptionAllowed(SECAlgorithmID *algid, PK11SymKey *key);

/*
 * Does the current policy allow *any* S/MIME encryption (or decryption)?
 *
 * This tells whether or not *any* S/MIME encryption can be done,
 * according to policy.  Callers may use this to do nicer user interface
 * (say, greying out a checkbox so a user does not even try to encrypt
 * a message when they are not allowed to) or for any reason they want
 * to check whether S/MIME encryption (or decryption, for that matter)
 * may be done.
 *
 * It takes no arguments.  The return value is a simple boolean:
 *   PR_TRUE means encryption (or decryption) is *possible*
 *	(but may still fail due to other reasons, like because we cannot
 *	find all the necessary certs, etc.; PR_TRUE is *not* a guarantee)
 *   PR_FALSE means encryption (or decryption) is not permitted
 *
 * There are no errors from this routine.
 */
extern PRBool NSS_SMIMEUtil_EncryptionPossible(void);

/*
 * NSS_SMIMEUtil_CreateSMIMECapabilities - get S/MIME capabilities attr value
 *
 * scans the list of allowed and enabled ciphers and construct a PKCS9-compliant
 * S/MIME capabilities attribute value.
 */
extern SECStatus NSS_SMIMEUtil_CreateSMIMECapabilities(PLArenaPool *poolp, SECItem *dest, PRBool includeFortezzaCiphers);

/*
 * NSS_SMIMEUtil_CreateSMIMEEncKeyPrefs - create S/MIME encryption key preferences attr value
 */
extern SECStatus NSS_SMIMEUtil_CreateSMIMEEncKeyPrefs(PLArenaPool *poolp, SECItem *dest, CERTCertificate *cert);

/*
 * NSS_SMIMEUtil_CreateMSSMIMEEncKeyPrefs - create S/MIME encryption key preferences attr value using MS oid
 */
extern SECStatus NSS_SMIMEUtil_CreateMSSMIMEEncKeyPrefs(PLArenaPool *poolp, SECItem *dest, CERTCertificate *cert);

/*
 * NSS_SMIMEUtil_GetCertFromEncryptionKeyPreference - find cert marked by EncryptionKeyPreference
 *          attribute
 */
extern CERTCertificate *NSS_SMIMEUtil_GetCertFromEncryptionKeyPreference(CERTCertDBHandle *certdb, SECItem *DERekp);

/*
 * NSS_SMIMEUtil_FindBulkAlgForRecipients - find bulk algorithm suitable for all recipients
 */
extern SECStatus
NSS_SMIMEUtil_FindBulkAlgForRecipients(CERTCertificate **rcerts, SECOidTag *bulkalgtag, int *keysize);

/************************************************************************/
SEC_END_PROTOS

#endif /* _SECMIME_H_ */
