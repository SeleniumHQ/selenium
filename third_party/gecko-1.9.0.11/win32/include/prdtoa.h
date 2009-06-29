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

#ifndef prdtoa_h___
#define prdtoa_h___

#include "prtypes.h"

PR_BEGIN_EXTERN_C

/*
** PR_strtod() returns as a double-precision floating-point number
** the  value represented by the character string pointed to by
** s00. The string is scanned up to the first unrecognized
** character.
**a
** If the value of se is not (char **)NULL, a  pointer  to
** the  character terminating the scan is returned in the location pointed
** to by se. If no number can be formed, se is set to s00, and
** zero is returned.
*/
#if defined(HAVE_WATCOM_BUG_1)
/* this is a hack to circumvent a bug in the Watcom C/C++ 11.0 compiler
** When Watcom fixes the bug, remove the special case for Win16
*/
PRFloat64 __pascal __loadds __export
#else
NSPR_API(PRFloat64)
#endif
PR_strtod(const char *s00, char **se);

/*
** PR_cnvtf()
** conversion routines for floating point
** prcsn - number of digits of precision to generate floating
** point value.
*/
NSPR_API(void) PR_cnvtf(char *buf, PRIntn bufsz, PRIntn prcsn, PRFloat64 fval);

/*
** PR_dtoa() converts double to a string.
**
** ARGUMENTS:
** If rve is not null, *rve is set to point to the end of the return value.
** If d is +-Infinity or NaN, then *decpt is set to 9999.
**
** mode:
**     0 ==> shortest string that yields d when read in
**           and rounded to nearest.
*/
NSPR_API(PRStatus) PR_dtoa(PRFloat64 d, PRIntn mode, PRIntn ndigits,
	PRIntn *decpt, PRIntn *sign, char **rve, char *buf, PRSize bufsize);

PR_END_EXTERN_C

#endif /* prdtoa_h___ */
