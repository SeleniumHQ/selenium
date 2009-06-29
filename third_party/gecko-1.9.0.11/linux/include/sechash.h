#ifndef _HASH_H_
#define _HASH_H_
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
/* $Id: sechash.h,v 1.8 2008/02/22 21:14:20 nelson%bolyard.com Exp $ */

#include "seccomon.h"
#include "hasht.h"
#include "secoidt.h"

SEC_BEGIN_PROTOS

/*
** Generic hash api.  
*/

extern unsigned int  HASH_ResultLen(HASH_HashType type);

extern unsigned int  HASH_ResultLenContext(HASHContext *context);

extern unsigned int  HASH_ResultLenByOidTag(SECOidTag hashOid);

extern SECStatus     HASH_HashBuf(HASH_HashType type,
				 unsigned char *dest,
				 unsigned char *src,
				 PRUint32 src_len);

extern HASHContext * HASH_Create(HASH_HashType type);

extern HASHContext * HASH_Clone(HASHContext *context);

extern void          HASH_Destroy(HASHContext *context);

extern void          HASH_Begin(HASHContext *context);

extern void          HASH_Update(HASHContext *context,
				const unsigned char *src,
				unsigned int len);

extern void          HASH_End(HASHContext *context,
			     unsigned char *result,
			     unsigned int *result_len,
			     unsigned int max_result_len);
			     
extern HASH_HashType HASH_GetType(HASHContext *context);

extern const SECHashObject * HASH_GetHashObject(HASH_HashType type);

extern const SECHashObject * HASH_GetHashObjectByOidTag(SECOidTag hashOid);

extern HASH_HashType HASH_GetHashTypeByOidTag(SECOidTag hashOid);
extern SECOidTag HASH_GetHashOidTagByHMACOidTag(SECOidTag hmacOid);
extern SECOidTag HASH_GetHMACOidTagByHashOidTag(SECOidTag hashOid);

SEC_END_PROTOS

#endif /* _HASH_H_ */
