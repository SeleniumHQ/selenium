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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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

#ifndef nsDebug_h___
#define nsDebug_h___

#ifndef nscore_h___
#include "nscore.h"
#endif

#ifndef nsError_h__
#include "nsError.h"
#endif 

#include "nsXPCOM.h"

#ifdef DEBUG
#define NS_DEBUG
#include "prprf.h"
#endif

#ifdef DEBUG

/**
 * Abort the execution of the program if the expression evaluates to
 * false.
 *
 * There is no status value returned from the macro.
 *
 * Note that the non-debug version of this macro does <b>not</b>
 * evaluate the expression argument. Hence side effect statements
 * as arguments to the macro will yield improper execution in a
 * non-debug build. For example:
 *
 *      NS_ABORT_IF_FALSE(0 == foo++, "yikes foo should be zero");
 *
 * Note also that the non-debug version of this macro does <b>not</b>
 * evaluate the message argument.
 */
#define NS_ABORT_IF_FALSE(_expr, _msg)                        \
  PR_BEGIN_MACRO                                              \
    if (!(_expr)) {                                           \
      NS_DebugBreak(NS_DEBUG_ASSERTION, _msg, #_expr, __FILE__, __LINE__); \
    }                                                         \
  PR_END_MACRO

/**
 * Warn if a given condition is false.
 *
 * Program execution continues past the usage of this macro.
 *
 * Note also that the non-debug version of this macro does <b>not</b>
 * evaluate the message argument.
 */
#define NS_WARN_IF_FALSE(_expr,_msg)                          \
  PR_BEGIN_MACRO                                              \
    if (!(_expr)) {                                           \
      NS_DebugBreak(NS_DEBUG_WARNING, _msg, #_expr, __FILE__, __LINE__); \
    }                                                         \
  PR_END_MACRO

/**
 * Test a precondition for truth. If the expression is not true then
 * trigger a program failure.
 */
#define NS_PRECONDITION(expr, str)                            \
  PR_BEGIN_MACRO                                              \
    if (!(expr)) {                                            \
      NS_DebugBreak(NS_DEBUG_ASSERTION, str, #expr, __FILE__, __LINE__); \
    }                                                         \
  PR_END_MACRO

/**
 * Test an assertion for truth. If the expression is not true then
 * trigger a program failure.
 */
#define NS_ASSERTION(expr, str)                               \
  PR_BEGIN_MACRO                                              \
    if (!(expr)) {                                            \
      NS_DebugBreak(NS_DEBUG_ASSERTION, str, #expr, __FILE__, __LINE__); \
    }                                                         \
  PR_END_MACRO

/**
 * Test a post-condition for truth. If the expression is not true then
 * trigger a program failure.
 */
#define NS_POSTCONDITION(expr, str)                           \
  PR_BEGIN_MACRO                                              \
    if (!(expr)) {                                            \
      NS_DebugBreak(NS_DEBUG_ASSERTION, str, #expr, __FILE__, __LINE__); \
    }                                                         \
  PR_END_MACRO

/**
 * This macros triggers a program failure if executed. It indicates that
 * an attempt was made to execute some unimplemented functionality.
 */
#define NS_NOTYETIMPLEMENTED(str)                             \
  NS_DebugBreak(NS_DEBUG_ASSERTION, str, "NotYetImplemented", __FILE__, __LINE__)

/**
 * This macros triggers a program failure if executed. It indicates that
 * an attempt was made to execute some unimplemented functionality.
 */
#define NS_NOTREACHED(str)                                    \
  NS_DebugBreak(NS_DEBUG_ASSERTION, str, "Not Reached", __FILE__, __LINE__)

/**
 * Log an error message.
 */
#define NS_ERROR(str)                                         \
  NS_DebugBreak(NS_DEBUG_ASSERTION, str, "Error", __FILE__, __LINE__)

/**
 * Log a warning message.
 */
#define NS_WARNING(str)                                       \
  NS_DebugBreak(NS_DEBUG_WARNING, str, nsnull, __FILE__, __LINE__)

/**
 * Trigger an abort
 */
#define NS_ABORT()                                            \
  NS_DebugBreak(NS_DEBUG_ABORT, nsnull, nsnull, __FILE__, __LINE__)

/**
 * Cause a break
 */
#define NS_BREAK()                                            \
  NS_DebugBreak(NS_DEBUG_BREAK, nsnull, nsnull, __FILE__, __LINE__)

#else /* NS_DEBUG */

/**
 * The non-debug version of these macros do not evaluate the
 * expression or the message arguments to the macro.
 */
#define NS_ABORT_IF_FALSE(_expr, _msg) PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_WARN_IF_FALSE(_expr, _msg)  PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_PRECONDITION(expr, str)     PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_ASSERTION(expr, str)        PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_POSTCONDITION(expr, str)    PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_NOTYETIMPLEMENTED(str)      PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_NOTREACHED(str)             PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_ERROR(str)                  PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_WARNING(str)                PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_ABORT()                     PR_BEGIN_MACRO /* nothing */ PR_END_MACRO
#define NS_BREAK()                     PR_BEGIN_MACRO /* nothing */ PR_END_MACRO

#endif /* ! NS_DEBUG */

/* Macros for checking the trueness of an expression passed in within an 
 * interface implementation.  These need to be compiled regardless of the */
/* NS_DEBUG flag
******************************************************************************/

#define NS_ENSURE_TRUE(x, ret)                                \
  PR_BEGIN_MACRO                                              \
    if (NS_UNLIKELY(!(x))) {                                  \
       NS_WARNING("NS_ENSURE_TRUE(" #x ") failed");           \
       return ret;                                            \
    }                                                         \
  PR_END_MACRO

#define NS_ENSURE_FALSE(x, ret)                               \
  NS_ENSURE_TRUE(!(x), ret)

/******************************************************************************
** Macros for checking results
******************************************************************************/

#if defined(DEBUG) && !defined(XPCOM_GLUE_AVOID_NSPR)

#define NS_ENSURE_SUCCESS_BODY(res, ret)                                  \
    char *msg = PR_smprintf("NS_ENSURE_SUCCESS(%s, %s) failed with "      \
                            "result 0x%X", #res, #ret, __rv);             \
    NS_WARNING(msg);                                                      \
    PR_smprintf_free(msg);

#else

#define NS_ENSURE_SUCCESS_BODY(res, ret)                                  \
    NS_WARNING("NS_ENSURE_SUCCESS(" #res ", " #ret ") failed");

#endif

#define NS_ENSURE_SUCCESS(res, ret)                                       \
  PR_BEGIN_MACRO                                                          \
    nsresult __rv = res; /* Don't evaluate |res| more than once */        \
    if (NS_FAILED(__rv)) {                                                \
      NS_ENSURE_SUCCESS_BODY(res, ret)                                    \
      return ret;                                                         \
    }                                                                     \
  PR_END_MACRO

/******************************************************************************
** Macros for checking state and arguments upon entering interface boundaries
******************************************************************************/

#define NS_ENSURE_ARG(arg)                                    \
  NS_ENSURE_TRUE(arg, NS_ERROR_INVALID_ARG)

#define NS_ENSURE_ARG_POINTER(arg)                            \
  NS_ENSURE_TRUE(arg, NS_ERROR_INVALID_POINTER)

#define NS_ENSURE_ARG_MIN(arg, min)                           \
  NS_ENSURE_TRUE((arg) >= min, NS_ERROR_INVALID_ARG)

#define NS_ENSURE_ARG_MAX(arg, max)                           \
  NS_ENSURE_TRUE((arg) <= max, NS_ERROR_INVALID_ARG)

#define NS_ENSURE_ARG_RANGE(arg, min, max)                    \
  NS_ENSURE_TRUE(((arg) >= min) && ((arg) <= max), NS_ERROR_INVALID_ARG)

#define NS_ENSURE_STATE(state)                                \
  NS_ENSURE_TRUE(state, NS_ERROR_UNEXPECTED)

#define NS_ENSURE_NO_AGGREGATION(outer)                       \
  NS_ENSURE_FALSE(outer, NS_ERROR_NO_AGGREGATION)

#define NS_ENSURE_PROPER_AGGREGATION(outer, iid)              \
  NS_ENSURE_FALSE(outer && !iid.Equals(NS_GET_IID(nsISupports)), NS_ERROR_INVALID_ARG)

/*****************************************************************************/

#ifdef XPCOM_GLUE
#define NS_CheckThreadSafe
#else
#define NS_CheckThreadSafe(owningThread, msg)                 \
  NS_ASSERTION(owningThread == PR_GetCurrentThread(), msg)
#endif

/* When compiling the XPCOM Glue on Windows, we pretend that it's going to
 * be linked with a static CRT (-MT) even when it's not. This means that we
 * cannot link to data exports from the CRT, only function exports. So,
 * instead of referencing "stderr" directly, use fdopen.
 */
PR_BEGIN_EXTERN_C

NS_COM_GLUE void
printf_stderr(const char *fmt, ...);

PR_END_EXTERN_C

#endif /* nsDebug_h___ */
