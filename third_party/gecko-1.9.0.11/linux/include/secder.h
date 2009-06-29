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

#ifndef _SECDER_H_
#define _SECDER_H_

#include "utilrename.h"

/*
 * secder.h - public data structures and prototypes for the DER encoding and
 *	      decoding utilities library
 *
 * $Id: secder.h,v 1.13 2008/06/18 01:04:23 wtc%google.com Exp $
 */

#if defined(_WIN32_WCE)
#else
#include <time.h>
#endif

#include "plarena.h"
#include "prlong.h"

#include "seccomon.h"
#include "secdert.h"
#include "prtime.h"

SEC_BEGIN_PROTOS

/*
** Encode a data structure into DER.
**	"dest" will be filled in (and memory allocated) to hold the der
**	   encoded structure in "src"
**	"t" is a template structure which defines the shape of the
**	   stored data
**	"src" is a pointer to the structure that will be encoded
*/
extern SECStatus DER_Encode(PLArenaPool *arena, SECItem *dest, DERTemplate *t,
			   void *src);

extern SECStatus DER_Lengths(SECItem *item, int *header_len_p,
                             PRUint32 *contents_len_p);

/*
** Lower level der subroutine that stores the standard header into "to".
** The header is of variable length, based on encodingLen.
** The return value is the new value of "to" after skipping over the header.
**	"to" is where the header will be stored
**	"code" is the der code to write
**	"encodingLen" is the number of bytes of data that will follow
**	   the header
*/
extern unsigned char *DER_StoreHeader(unsigned char *to, unsigned int code,
				      PRUint32 encodingLen);

/*
** Return the number of bytes it will take to hold a der encoded length.
*/
extern int DER_LengthLength(PRUint32 len);

/*
** Store a der encoded *signed* integer (whose value is "src") into "dst".
** XXX This should really be enhanced to take a long.
*/
extern SECStatus DER_SetInteger(PLArenaPool *arena, SECItem *dst, PRInt32 src);

/*
** Store a der encoded *unsigned* integer (whose value is "src") into "dst".
** XXX This should really be enhanced to take an unsigned long.
*/
extern SECStatus DER_SetUInteger(PLArenaPool *arena, SECItem *dst, PRUint32 src);

/*
** Decode a der encoded *signed* integer that is stored in "src".
** If "-1" is returned, then the caller should check the error in
** XP_GetError() to see if an overflow occurred (SEC_ERROR_BAD_DER).
*/
extern long DER_GetInteger(SECItem *src);

/*
** Decode a der encoded *unsigned* integer that is stored in "src".
** If the ULONG_MAX is returned, then the caller should check the error
** in XP_GetError() to see if an overflow occurred (SEC_ERROR_BAD_DER).
*/
extern unsigned long DER_GetUInteger(SECItem *src);

/*
** Convert an NSPR time value to a der encoded time value.
**	"result" is the der encoded time (memory is allocated)
**	"time" is the NSPR time value (Since Jan 1st, 1970).
**      time must be on or after January 1, 1950, and
**      before January 1, 2050
** The caller is responsible for freeing up the buffer which
** result->data points to upon a successful operation.
*/
extern SECStatus DER_TimeToUTCTime(SECItem *result, PRTime time);
extern SECStatus DER_TimeToUTCTimeArena(PLArenaPool* arenaOpt,
                                        SECItem *dst, PRTime gmttime);


/*
** Convert an ascii encoded time value (according to DER rules) into
** an NSPR time value.
**	"result" the resulting NSPR time
**	"string" the der notation ascii value to decode
*/
extern SECStatus DER_AsciiToTime(PRTime *result, const char *string);

/*
** Same as DER_AsciiToTime except takes an SECItem instead of a string
*/
extern SECStatus DER_UTCTimeToTime(PRTime *result, const SECItem *time);

/*
** Convert a DER encoded UTC time to an ascii time representation
** "utctime" is the DER encoded UTC time to be converted. The
** caller is responsible for deallocating the returned buffer.
*/
extern char *DER_UTCTimeToAscii(SECItem *utcTime);

/*
** Convert a DER encoded UTC time to an ascii time representation, but only
** include the day, not the time.
**	"utctime" is the DER encoded UTC time to be converted.
** The caller is responsible for deallocating the returned buffer.
*/
extern char *DER_UTCDayToAscii(SECItem *utctime);
/* same thing for DER encoded GeneralizedTime */
extern char *DER_GeneralizedDayToAscii(SECItem *gentime);
/* same thing for either DER UTCTime or GeneralizedTime */
extern char *DER_TimeChoiceDayToAscii(SECItem *timechoice);

/*
** Convert a PRTime time to a DER encoded Generalized time
** gmttime must be on or after January 1, year 1 and
** before January 1, 10000.
*/
extern SECStatus DER_TimeToGeneralizedTime(SECItem *dst, PRTime gmttime);
extern SECStatus DER_TimeToGeneralizedTimeArena(PLArenaPool* arenaOpt,
                                                SECItem *dst, PRTime gmttime);

/*
** Convert a DER encoded Generalized time value into an NSPR time value.
**	"dst" the resulting NSPR time
**	"string" the der notation ascii value to decode
*/
extern SECStatus DER_GeneralizedTimeToTime(PRTime *dst, const SECItem *time);

/*
** Convert from a PRTime UTC time value to a formatted ascii value. The
** caller is responsible for deallocating the returned buffer.
*/
extern char *CERT_UTCTime2FormattedAscii (PRTime utcTime, char *format);
#define CERT_GeneralizedTime2FormattedAscii CERT_UTCTime2FormattedAscii

/*
** Convert from a PRTime Generalized time value to a formatted ascii value. The
** caller is responsible for deallocating the returned buffer.
*/
extern char *CERT_GenTime2FormattedAscii (PRTime genTime, char *format);

/*
** decode a SECItem containing either a SEC_ASN1_GENERALIZED_TIME 
** or a SEC_ASN1_UTC_TIME
*/

extern SECStatus DER_DecodeTimeChoice(PRTime* output, const SECItem* input);

/* encode a PRTime to an ASN.1 DER SECItem containing either a
   SEC_ASN1_GENERALIZED_TIME or a SEC_ASN1_UTC_TIME */

extern SECStatus DER_EncodeTimeChoice(PLArenaPool* arena, SECItem* output,
                                       PRTime input);

SEC_END_PROTOS

#endif /* _SECDER_H_ */

