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
 * Portions created by the Initial Developer are Copyright (C) 1994-2001
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
/* Thse functions are stub functions which will get replaced with calls through
 * PKCS #11.
 */

#ifndef _PK11PQG_H_
#define  _PK11PQG_H_ 1

#include "blapit.h"

SEC_BEGIN_PROTOS

/* Generate PQGParams and PQGVerify structs.
 * Length of seed and length of h both equal length of P. 
 * All lengths are specified by "j", according to the table above.
 */
extern SECStatus PK11_PQG_ParamGen(unsigned int j, PQGParams **pParams, 
							PQGVerify **pVfy);

/* Generate PQGParams and PQGVerify structs.
 * Length of P specified by j.  Length of h will match length of P.
 * Length of SEED in bytes specified in seedBytes.
 * seedBbytes must be in the range [20..255] or an error will result.
 */
extern SECStatus PK11_PQG_ParamGenSeedLen( unsigned int j, 
	unsigned int seedBytes, PQGParams **pParams, PQGVerify **pVfy);

/*  Test PQGParams for validity as DSS PQG values.
 *  If vfy is non-NULL, test PQGParams to make sure they were generated
 *       using the specified seed, counter, and h values.
 *
 *  Return value indicates whether Verification operation ran succesfully
 *  to completion, but does not indicate if PQGParams are valid or not.
 *  If return value is SECSuccess, then *pResult has these meanings:
 *       SECSuccess: PQGParams are valid.
 *       SECFailure: PQGParams are invalid.
 *
 * Verify the following 12 facts about PQG counter SEED g and h
 * 1.  Q is 160 bits long.
 * 2.  P is one of the 9 valid lengths.
 * 3.  G < P
 * 4.  P % Q == 1
 * 5.  Q is prime
 * 6.  P is prime
 * Steps 7-12 are done only if the optional PQGVerify is supplied.
 * 7.  counter < 4096
 * 8.  g >= 160 and g < 2048   (g is length of seed in bits)
 * 9.  Q generated from SEED matches Q in PQGParams.
 * 10. P generated from (L, counter, g, SEED, Q) matches P in PQGParams.
 * 11. 1 < h < P-1
 * 12. G generated from h matches G in PQGParams.
 */

extern SECStatus PK11_PQG_VerifyParams(const PQGParams *params, 
                                    const PQGVerify *vfy, SECStatus *result);
extern void PK11_PQG_DestroyParams(PQGParams *params);
extern void PK11_PQG_DestroyVerify(PQGVerify *vfy);

/**************************************************************************
 *  Return a pointer to a new PQGParams struct that is constructed from   *
 *  copies of the arguments passed in.                                    *
 *  Return NULL on failure.                                               *
 **************************************************************************/
extern PQGParams * PK11_PQG_NewParams(const SECItem * prime, const 
				SECItem * subPrime, const SECItem * base);


/**************************************************************************
 * Fills in caller's "prime" SECItem with the prime value in params.
 * Contents can be freed by calling SECITEM_FreeItem(prime, PR_FALSE);	
 **************************************************************************/
extern SECStatus PK11_PQG_GetPrimeFromParams(const PQGParams *params, 
							SECItem * prime);


/**************************************************************************
 * Fills in caller's "subPrime" SECItem with the prime value in params.
 * Contents can be freed by calling SECITEM_FreeItem(subPrime, PR_FALSE);	
 **************************************************************************/
extern SECStatus PK11_PQG_GetSubPrimeFromParams(const PQGParams *params, 
							SECItem * subPrime);


/**************************************************************************
 * Fills in caller's "base" SECItem with the base value in params.
 * Contents can be freed by calling SECITEM_FreeItem(base, PR_FALSE);	
 **************************************************************************/
extern SECStatus PK11_PQG_GetBaseFromParams(const PQGParams *params, 
							SECItem *base);


/**************************************************************************
 *  Return a pointer to a new PQGVerify struct that is constructed from   *
 *  copies of the arguments passed in.                                    *
 *  Return NULL on failure.                                               *
 **************************************************************************/
extern PQGVerify * PK11_PQG_NewVerify(unsigned int counter, 
				const SECItem * seed, const SECItem * h);


/**************************************************************************
 * Returns "counter" value from the PQGVerify.
 **************************************************************************/
extern unsigned int PK11_PQG_GetCounterFromVerify(const PQGVerify *verify);

/**************************************************************************
 * Fills in caller's "seed" SECItem with the seed value in verify.
 * Contents can be freed by calling SECITEM_FreeItem(seed, PR_FALSE);	
 **************************************************************************/
extern SECStatus PK11_PQG_GetSeedFromVerify(const PQGVerify *verify, 
							SECItem *seed);

/**************************************************************************
 * Fills in caller's "h" SECItem with the h value in verify.
 * Contents can be freed by calling SECITEM_FreeItem(h, PR_FALSE);	
 **************************************************************************/
extern SECStatus PK11_PQG_GetHFromVerify(const PQGVerify *verify, SECItem * h);

SEC_END_PROTOS

#endif
