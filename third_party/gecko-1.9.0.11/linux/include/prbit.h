/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * The Original Code is the Netscape Portable Runtime (NSPR).
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998-2000
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

#ifndef prbit_h___
#define prbit_h___

#include "prtypes.h"
PR_BEGIN_EXTERN_C

/*
** A prbitmap_t is a long integer that can be used for bitmaps
*/
typedef unsigned long prbitmap_t;

#define PR_TEST_BIT(_map,_bit) \
    ((_map)[(_bit)>>PR_BITS_PER_LONG_LOG2] & (1L << ((_bit) & (PR_BITS_PER_LONG-1))))
#define PR_SET_BIT(_map,_bit) \
    ((_map)[(_bit)>>PR_BITS_PER_LONG_LOG2] |= (1L << ((_bit) & (PR_BITS_PER_LONG-1))))
#define PR_CLEAR_BIT(_map,_bit) \
    ((_map)[(_bit)>>PR_BITS_PER_LONG_LOG2] &= ~(1L << ((_bit) & (PR_BITS_PER_LONG-1))))

/*
** Compute the log of the least power of 2 greater than or equal to n
*/
NSPR_API(PRIntn) PR_CeilingLog2(PRUint32 i); 

/*
** Compute the log of the greatest power of 2 less than or equal to n
*/
NSPR_API(PRIntn) PR_FloorLog2(PRUint32 i); 

/*
** Macro version of PR_CeilingLog2: Compute the log of the least power of
** 2 greater than or equal to _n. The result is returned in _log2.
*/
#define PR_CEILING_LOG2(_log2,_n)   \
  PR_BEGIN_MACRO                    \
    PRUint32 j_ = (PRUint32)(_n); 	\
    (_log2) = 0;                    \
    if ((j_) & ((j_)-1))            \
	(_log2) += 1;               \
    if ((j_) >> 16)                 \
	(_log2) += 16, (j_) >>= 16; \
    if ((j_) >> 8)                  \
	(_log2) += 8, (j_) >>= 8;   \
    if ((j_) >> 4)                  \
	(_log2) += 4, (j_) >>= 4;   \
    if ((j_) >> 2)                  \
	(_log2) += 2, (j_) >>= 2;   \
    if ((j_) >> 1)                  \
	(_log2) += 1;               \
  PR_END_MACRO

/*
** Macro version of PR_FloorLog2: Compute the log of the greatest power of
** 2 less than or equal to _n. The result is returned in _log2.
**
** This is equivalent to finding the highest set bit in the word.
*/
#define PR_FLOOR_LOG2(_log2,_n)   \
  PR_BEGIN_MACRO                    \
    PRUint32 j_ = (PRUint32)(_n); 	\
    (_log2) = 0;                    \
    if ((j_) >> 16)                 \
	(_log2) += 16, (j_) >>= 16; \
    if ((j_) >> 8)                  \
	(_log2) += 8, (j_) >>= 8;   \
    if ((j_) >> 4)                  \
	(_log2) += 4, (j_) >>= 4;   \
    if ((j_) >> 2)                  \
	(_log2) += 2, (j_) >>= 2;   \
    if ((j_) >> 1)                  \
	(_log2) += 1;               \
  PR_END_MACRO

/*
** Macros for rotate left and right. The argument 'a' must be an unsigned
** 32-bit integer type such as PRUint32.
**
** There is no rotate operation in the C Language, so the construct
** (a << 4) | (a >> 28) is frequently used instead. Most compilers convert
** this to a rotate instruction, but MSVC doesn't without a little help.
** To get MSVC to generate a rotate instruction, we have to use the _rotl
** or _rotr intrinsic and use a pragma to make it inline.
**
** Note: MSVC in VS2005 will do an inline rotate instruction on the above
** construct.
*/

#if defined(_MSC_VER) && (defined(_M_IX86) || defined(_M_AMD64) || \
    defined(_M_X64))
#include <stdlib.h>
#pragma intrinsic(_rotl, _rotr)
#define PR_ROTATE_LEFT32(a, bits) _rotl(a, bits)
#define PR_ROTATE_RIGHT32(a, bits) _rotr(a, bits)
#else
#define PR_ROTATE_LEFT32(a, bits) (((a) << (bits)) | ((a) >> (32 - (bits))))
#define PR_ROTATE_RIGHT32(a, bits) (((a) >> (bits)) | ((a) << (32 - (bits))))
#endif

PR_END_EXTERN_C
#endif /* prbit_h___ */
