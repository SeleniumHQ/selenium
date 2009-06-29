/*
 * crypto.h - public data structures and prototypes for the crypto library
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
/* $Id: secdig.h,v 1.8 2008/06/14 14:20:38 wtc%google.com Exp $ */

#ifndef _SECDIG_H_
#define _SECDIG_H_

#include "utilrename.h"
#include "secdigt.h"

#include "seccomon.h"
#include "secasn1t.h" 
#include "secdert.h"

SEC_BEGIN_PROTOS


extern const SEC_ASN1Template sgn_DigestInfoTemplate[];

SEC_ASN1_CHOOSER_DECLARE(sgn_DigestInfoTemplate)

/****************************************/
/*
** Digest-info functions
*/

/*
** Create a new digest-info object
** 	"algorithm" one of SEC_OID_MD2, SEC_OID_MD5, or SEC_OID_SHA1
** 	"sig" the raw signature data (from MD2 or MD5)
** 	"sigLen" the length of the signature data
**
** NOTE: this is a low level routine used to prepare some data for PKCS#1
** digital signature formatting.
**
** XXX It might be nice to combine the create and encode functions.
** I think that is all anybody ever wants to do anyway.
*/
extern SGNDigestInfo *SGN_CreateDigestInfo(SECOidTag algorithm,
					   unsigned char *sig,
					   unsigned int sigLen);

/*
** Destroy a digest-info object
*/
extern void SGN_DestroyDigestInfo(SGNDigestInfo *info);

/*
** Encode a digest-info object
**	"poolp" is where to allocate the result from; it can be NULL in
**		which case generic heap allocation (XP_ALLOC) will be used
**	"dest" is where to store the result; it can be NULL, in which case
**		it will be allocated (from poolp or heap, as explained above)
**	"diginfo" is the object to be encoded
** The return value is NULL if any error occurred, otherwise it is the
** resulting SECItem (either allocated or the same as the "dest" parameter).
**
** XXX It might be nice to combine the create and encode functions.
** I think that is all anybody ever wants to do anyway.
*/
extern SECItem *SGN_EncodeDigestInfo(PLArenaPool *poolp, SECItem *dest,
				     SGNDigestInfo *diginfo);

/*
** Decode a DER encoded digest info objct.
**  didata is thr source of the encoded digest.  
** The return value is NULL if an error occurs.  Otherwise, a
** digest info object which is allocated within it's own
** pool is returned.  The digest info should be deleted
** by later calling SGN_DestroyDigestInfo.
*/
extern SGNDigestInfo *SGN_DecodeDigestInfo(SECItem *didata);


/*
** Copy digest info.
**  poolp is the arena to which the digest will be copied.
**  a is the destination digest, it must be non-NULL.
**  b is the source digest
** This function is for copying digests.  It allows digests
** to be copied into a specified pool.  If the digest is in
** the same pool as other data, you do not want to delete
** the digest by calling SGN_DestroyDigestInfo.  
** A return value of SECFailure indicates an error.  A return
** of SECSuccess indicates no error occured.
*/
extern SECStatus  SGN_CopyDigestInfo(PLArenaPool *poolp,
					SGNDigestInfo *a, 
					SGNDigestInfo *b);

/*
** Compare two digest-info objects, returning the difference between
** them.
*/
extern SECComparison SGN_CompareDigestInfo(SGNDigestInfo *a, SGNDigestInfo *b);


SEC_END_PROTOS

#endif /* _SECDIG_H_ */
