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
 * The Original Code is mozilla.org Code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Prasad <prasad@medhas.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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
 * This code was copied from xpcom/ds/nsTextFormatter r1.3
 *           Memory model and Frozen linkage changes only.
 *                           -- Prasad <prasad@medhas.org>
 */

#ifndef nsTextFormatter_h___
#define nsTextFormatter_h___

/*
 ** API for PR printf like routines. Supports the following formats
 **	%d - decimal
 **	%u - unsigned decimal
 **	%x - unsigned hex
 **	%X - unsigned uppercase hex
 **	%o - unsigned octal
 **	%hd, %hu, %hx, %hX, %ho - 16-bit versions of above
 **	%ld, %lu, %lx, %lX, %lo - 32-bit versions of above
 **	%lld, %llu, %llx, %llX, %llo - 64 bit versions of above
 **	%s - utf8 string
 **	%S - PRUnichar string
 **	%c - character
 **	%p - pointer (deals with machine dependent pointer size)
 **	%f - float
 **	%g - float
 */
#include "prtypes.h"
#include "prio.h"
#include <stdio.h>
#include <stdarg.h>
#include "nscore.h"
#include "nsStringGlue.h"

#ifdef XPCOM_GLUE
#error "nsTextFormatter is not available in the standalone glue due to NSPR dependencies."
#endif

class NS_COM_GLUE nsTextFormatter {

  public:

    /*
     * sprintf into a fixed size buffer. Guarantees that a NULL is at the end
     * of the buffer. Returns the length of the written output, NOT including
     * the NUL, or (PRUint32)-1 if an error occurs.
     */
    static PRUint32 snprintf(PRUnichar *out, PRUint32 outlen, const PRUnichar *fmt, ...);

    /*
     * sprintf into a nsMemory::Alloc'd buffer. Return a pointer to 
     * buffer on success, NULL on failure. 
     */
    static PRUnichar* smprintf(const PRUnichar *fmt, ...);

    static PRUint32 ssprintf(nsAString& out, const PRUnichar* fmt, ...);

    /*
     * va_list forms of the above.
     */
    static PRUint32 vsnprintf(PRUnichar *out, PRUint32 outlen, const PRUnichar *fmt, va_list ap);
    static PRUnichar* vsmprintf(const PRUnichar *fmt, va_list ap);
    static PRUint32 vssprintf(nsAString& out, const PRUnichar *fmt, va_list ap);

    /*
     * Free the memory allocated, for the caller, by smprintf.
     * -- Deprecated --
     * Callers can substitute calling smprintf_free with nsMemory::Free
     */
    static void smprintf_free(PRUnichar *mem);

};

#endif /* nsTextFormatter_h___ */
