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

/* GLOBAL FUNCTIONS:
** DESCRIPTION:
**     PR Atomic operations
*/

#ifndef pratom_h___
#define pratom_h___

#include "prtypes.h"
#include "prlock.h"

PR_BEGIN_EXTERN_C

/*
** FUNCTION: PR_AtomicIncrement
** DESCRIPTION:
**    Atomically increment a 32 bit value.
** INPUTS:
**    val:  a pointer to the value to increment
** RETURN:
**    the returned value is the result of the increment
*/
NSPR_API(PRInt32)	PR_AtomicIncrement(PRInt32 *val);

/*
** FUNCTION: PR_AtomicDecrement
** DESCRIPTION:
**    Atomically decrement a 32 bit value.
** INPUTS:
**    val:  a pointer to the value to decrement
** RETURN:
**    the returned value is the result of the decrement
*/
NSPR_API(PRInt32)	PR_AtomicDecrement(PRInt32 *val);

/*
** FUNCTION: PR_AtomicSet
** DESCRIPTION:
**    Atomically set a 32 bit value.
** INPUTS:
**    val: A pointer to a 32 bit value to be set
**    newval: The newvalue to assign to val
** RETURN:
**    Returns the prior value
*/
NSPR_API(PRInt32) PR_AtomicSet(PRInt32 *val, PRInt32 newval);

/*
** FUNCTION: PR_AtomicAdd
** DESCRIPTION:
**    Atomically add a 32 bit value.
** INPUTS:
**    ptr:  a pointer to the value to increment
**	  val:  value to be added
** RETURN:
**    the returned value is the result of the addition
*/
NSPR_API(PRInt32)	PR_AtomicAdd(PRInt32 *ptr, PRInt32 val);

/*
** MACRO: PR_ATOMIC_INCREMENT
** MACRO: PR_ATOMIC_DECREMENT
** MACRO: PR_ATOMIC_SET
** MACRO: PR_ATOMIC_ADD
** DESCRIPTION:
**    Macro versions of the atomic operations.  They may be implemented
**    as compiler intrinsics.
**
** IMPORTANT NOTE TO NSPR MAINTAINERS:
**    Implement these macros with compiler intrinsics only on platforms
**    where the PR_AtomicXXX functions are truly atomic (i.e., where the
**    configuration macro _PR_HAVE_ATOMIC_OPS is defined).  Otherwise,
**    the macros and functions won't be compatible and can't be used
**    interchangeably.
*/
#if defined(_WIN32) && (_MSC_VER >= 1310)

long __cdecl _InterlockedIncrement(long volatile *Addend);
#pragma intrinsic(_InterlockedIncrement)

long __cdecl _InterlockedDecrement(long volatile *Addend);
#pragma intrinsic(_InterlockedDecrement)

long __cdecl _InterlockedExchange(long volatile *Target, long Value);
#pragma intrinsic(_InterlockedExchange)

long __cdecl _InterlockedExchangeAdd(long volatile *Addend, long Value);
#pragma intrinsic(_InterlockedExchangeAdd)

#define PR_ATOMIC_INCREMENT(val) _InterlockedIncrement(val)
#define PR_ATOMIC_DECREMENT(val) _InterlockedDecrement(val)
#define PR_ATOMIC_SET(val, newval) _InterlockedExchange(val, newval)
#define PR_ATOMIC_ADD(ptr, val) (_InterlockedExchangeAdd(ptr, val) + (val))

#elif ((__GNUC__ > 4) || (__GNUC__ == 4 && __GNUC_MINOR__ >= 1)) && \
      ((defined(DARWIN) && \
           (defined(__ppc__) || defined(__i386__))) || \
       (defined(LINUX) && \
           (defined(__i386__) || defined(__ia64__) || defined(__x86_64__) || \
           (defined(__powerpc__) && !defined(__powerpc64__)) || \
           defined(__alpha))))

/*
 * Because the GCC manual warns that some processors may support
 * reduced functionality of __sync_lock_test_and_set, we test for the
 * processors that we believe support a full atomic exchange operation.
 */

#define PR_ATOMIC_INCREMENT(val) __sync_add_and_fetch(val, 1)
#define PR_ATOMIC_DECREMENT(val) __sync_sub_and_fetch(val, 1)
#define PR_ATOMIC_SET(val, newval) __sync_lock_test_and_set(val, newval)
#define PR_ATOMIC_ADD(ptr, val) __sync_add_and_fetch(ptr, val)

#else

#define PR_ATOMIC_INCREMENT(val) PR_AtomicIncrement(val)
#define PR_ATOMIC_DECREMENT(val) PR_AtomicDecrement(val)
#define PR_ATOMIC_SET(val, newval) PR_AtomicSet(val, newval)
#define PR_ATOMIC_ADD(ptr, val) PR_AtomicAdd(ptr, val)

#endif

/*
** LIFO linked-list (stack)
*/
typedef struct PRStackElemStr PRStackElem;

struct PRStackElemStr {
    PRStackElem	*prstk_elem_next;	/* next pointer MUST be at offset 0;
									  assembly language code relies on this */
};

typedef struct PRStackStr PRStack;

/*
** FUNCTION: PR_CreateStack
** DESCRIPTION:
**    Create a stack, a LIFO linked list
** INPUTS:
**    stack_name:  a pointer to string containing the name of the stack
** RETURN:
**    A pointer to the created stack, if successful, else NULL.
*/
NSPR_API(PRStack *)	PR_CreateStack(const char *stack_name);

/*
** FUNCTION: PR_StackPush
** DESCRIPTION:
**    Push an element on the top of the stack
** INPUTS:
**    stack:		pointer to the stack
**    stack_elem:	pointer to the stack element
** RETURN:
**    None
*/
NSPR_API(void)			PR_StackPush(PRStack *stack, PRStackElem *stack_elem);

/*
** FUNCTION: PR_StackPop
** DESCRIPTION:
**    Remove the element on the top of the stack
** INPUTS:
**    stack:		pointer to the stack
** RETURN:
**    A pointer to the stack element removed from the top of the stack,
**	  if non-empty,
**    else NULL
*/
NSPR_API(PRStackElem *)	PR_StackPop(PRStack *stack);

/*
** FUNCTION: PR_DestroyStack
** DESCRIPTION:
**    Destroy the stack
** INPUTS:
**    stack:		pointer to the stack
** RETURN:
**    PR_SUCCESS - if successfully deleted
**	  PR_FAILURE - if the stack is not empty
**					PR_GetError will return
**						PR_INVALID_STATE_ERROR - stack is not empty
*/
NSPR_API(PRStatus)		PR_DestroyStack(PRStack *stack);

PR_END_EXTERN_C

#endif /* pratom_h___ */
