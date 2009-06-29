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
 * Public prototypes for base64 encoding/decoding.
 *
 * $Id: nssb64.h,v 1.5 2008/06/14 14:20:38 wtc%google.com Exp $
 */
#ifndef _NSSB64_H_
#define _NSSB64_H_

#include "utilrename.h"
#include "seccomon.h"
#include "nssb64t.h"

SEC_BEGIN_PROTOS

/*
 * Functions to start a base64 decoding/encoding context.
 */

extern NSSBase64Decoder *
NSSBase64Decoder_Create (PRInt32 (*output_fn) (void *, const unsigned char *,
					       PRInt32),
			 void *output_arg);

extern NSSBase64Encoder *
NSSBase64Encoder_Create (PRInt32 (*output_fn) (void *, const char *, PRInt32),
			 void *output_arg);

/*
 * Push data through the decoder/encoder, causing the output_fn (provided
 * to Create) to be called with the decoded/encoded data.
 */

extern SECStatus
NSSBase64Decoder_Update (NSSBase64Decoder *data, const char *buffer,
			 PRUint32 size);

extern SECStatus
NSSBase64Encoder_Update (NSSBase64Encoder *data, const unsigned char *buffer,
			 PRUint32 size);

/*
 * When you're done processing, call this to close the context.
 * If "abort_p" is false, then calling this may cause the output_fn
 * to be called one last time (as the last buffered data is flushed out).
 */

extern SECStatus
NSSBase64Decoder_Destroy (NSSBase64Decoder *data, PRBool abort_p);

extern SECStatus
NSSBase64Encoder_Destroy (NSSBase64Encoder *data, PRBool abort_p);

/*
 * Perform base64 decoding from an ascii string "inStr" to an Item.
 * The length of the input must be provided as "inLen".  The Item
 * may be provided (as "outItemOpt"); you can also pass in a NULL
 * and the Item will be allocated for you.
 *
 * In any case, the data within the Item will be allocated for you.
 * All allocation will happen out of the passed-in "arenaOpt", if non-NULL.
 * If "arenaOpt" is NULL, standard allocation (heap) will be used and
 * you will want to free the result via SECITEM_FreeItem.
 *
 * Return value is NULL on error, the Item (allocated or provided) otherwise.
 */
extern SECItem *
NSSBase64_DecodeBuffer (PLArenaPool *arenaOpt, SECItem *outItemOpt,
			const char *inStr, unsigned int inLen);

/*
 * Perform base64 encoding of binary data "inItem" to an ascii string.
 * The output buffer may be provided (as "outStrOpt"); you can also pass
 * in a NULL and the buffer will be allocated for you.  The result will
 * be null-terminated, and if the buffer is provided, "maxOutLen" must
 * specify the maximum length of the buffer and will be checked to
 * supply sufficient space space for the encoded result.  (If "outStrOpt"
 * is NULL, "maxOutLen" is ignored.)
 *
 * If "outStrOpt" is NULL, allocation will happen out of the passed-in
 * "arenaOpt", if *it* is non-NULL, otherwise standard allocation (heap)
 * will be used.
 *
 * Return value is NULL on error, the output buffer (allocated or provided)
 * otherwise.
 */
extern char *
NSSBase64_EncodeItem (PLArenaPool *arenaOpt, char *outStrOpt,
		      unsigned int maxOutLen, SECItem *inItem);

SEC_END_PROTOS

#endif /* _NSSB64_H_ */
