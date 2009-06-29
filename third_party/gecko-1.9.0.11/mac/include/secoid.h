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

#ifndef _SECOID_H_
#define _SECOID_H_

#include "utilrename.h"

/*
 * secoid.h - public data structures and prototypes for ASN.1 OID functions
 *
 * $Id: secoid.h,v 1.10 2008/06/14 14:20:38 wtc%google.com Exp $
 */

#include "plarena.h"

#include "seccomon.h"
#include "secoidt.h"
#include "secasn1t.h"

SEC_BEGIN_PROTOS

extern const SEC_ASN1Template SECOID_AlgorithmIDTemplate[];

/* This functions simply returns the address of the above-declared template. */
SEC_ASN1_CHOOSER_DECLARE(SECOID_AlgorithmIDTemplate)

/*
 * OID handling routines
 */
extern SECOidData *SECOID_FindOID( const SECItem *oid);
extern SECOidTag SECOID_FindOIDTag(const SECItem *oid);
extern SECOidData *SECOID_FindOIDByTag(SECOidTag tagnum);
extern SECOidData *SECOID_FindOIDByMechanism(unsigned long mechanism);

/****************************************/
/*
** Algorithm id handling operations
*/

/*
** Fill in an algorithm-ID object given a tag and some parameters.
** 	"aid" where the DER encoded algorithm info is stored (memory
**	   is allocated)
**	"tag" the tag number defining the algorithm 
**	"params" if not NULL, the parameters to go with the algorithm
*/
extern SECStatus SECOID_SetAlgorithmID(PLArenaPool *arena, SECAlgorithmID *aid,
				   SECOidTag tag, SECItem *params);

/*
** Copy the "src" object to "dest". Memory is allocated in "dest" for
** each of the appropriate sub-objects. Memory in "dest" is not freed
** before memory is allocated (use SECOID_DestroyAlgorithmID(dest, PR_FALSE)
** to do that).
*/
extern SECStatus SECOID_CopyAlgorithmID(PLArenaPool *arena, SECAlgorithmID *dest,
				    SECAlgorithmID *src);

/*
** Get the tag number for the given algorithm-id object.
*/
extern SECOidTag SECOID_GetAlgorithmTag(SECAlgorithmID *aid);

/*
** Destroy an algorithm-id object.
**	"aid" the certificate-request to destroy
**	"freeit" if PR_TRUE then free the object as well as its sub-objects
*/
extern void SECOID_DestroyAlgorithmID(SECAlgorithmID *aid, PRBool freeit);

/*
** Compare two algorithm-id objects, returning the difference between
** them.
*/
extern SECComparison SECOID_CompareAlgorithmID(SECAlgorithmID *a,
					   SECAlgorithmID *b);

extern PRBool SECOID_KnownCertExtenOID (SECItem *extenOid);

/* Given a tag number, return a string describing it.
 */
extern const char *SECOID_FindOIDTagDescription(SECOidTag tagnum);

/* Add a dynamic SECOidData to the dynamic OID table.
** Routine copies the src entry, and returns the new SECOidTag.
** Returns SEC_OID_INVALID if failed to add for some reason.
*/
extern SECOidTag SECOID_AddEntry(const SECOidData * src);

/*
 * initialize the oid data structures.
 */
extern SECStatus SECOID_Init(void);

/*
 * free up the oid data structures.
 */
extern SECStatus SECOID_Shutdown(void);

/* if to->data is not NULL, and to->len is large enough to hold the result,
 * then the resultant OID will be copyed into to->data, and to->len will be
 * changed to show the actual OID length.
 * Otherwise, memory for the OID will be allocated (from the caller's 
 * PLArenaPool, if pool is non-NULL) and to->data will receive the address
 * of the allocated data, and to->len will receive the OID length.
 * The original value of to->data is not freed when a new buffer is allocated.
 * 
 * The input string may begin with "OID." and this still be ignored.
 * The length of the input string is given in len.  If len == 0, then 
 * len will be computed as strlen(from), meaning it must be NUL terminated.
 * It is an error if from == NULL, or if *from == '\0'.
 */
extern SECStatus SEC_StringToOID(PLArenaPool *pool, SECItem *to, 
                                 const char *from, PRUint32 len);

SEC_END_PROTOS

#endif /* _SECOID_H_ */
