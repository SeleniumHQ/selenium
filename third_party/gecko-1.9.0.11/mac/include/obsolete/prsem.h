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

#ifndef prsem_h___
#define prsem_h___

/*
** API for counting semaphores. Semaphores are counting synchronizing 
** variables based on a lock and a condition variable.  They are lightweight 
** contention control for a given count of resources.
*/
#include "prtypes.h"

PR_BEGIN_EXTERN_C

typedef struct PRSemaphore PRSemaphore;

/*
** Create a new semaphore object.
*/
NSPR_API(PRSemaphore*) PR_NewSem(PRUintn value);

/*
** Destroy the given semaphore object.
**
*/
NSPR_API(void) PR_DestroySem(PRSemaphore *sem);

/*
** Wait on a Semaphore.
** 
** This routine allows a calling thread to wait or proceed depending upon the 
** state of the semahore sem. The thread can proceed only if the counter value 
** of the semaphore sem is currently greater than 0. If the value of semaphore 
** sem is positive, it is decremented by one and the routine returns immediately 
** allowing the calling thread to continue. If the value of semaphore sem is 0, 
** the calling thread blocks awaiting the semaphore to be released by another 
** thread.
** 
** This routine can return PR_PENDING_INTERRUPT if the waiting thread 
** has been interrupted.
*/
NSPR_API(PRStatus) PR_WaitSem(PRSemaphore *sem);

/*
** This routine increments the counter value of the semaphore. If other threads 
** are blocked for the semaphore, then the scheduler will determine which ONE 
** thread will be unblocked.
*/
NSPR_API(void) PR_PostSem(PRSemaphore *sem);

/*
** Returns the value of the semaphore referenced by sem without affecting
** the state of the semaphore.  The value represents the semaphore vaule
F** at the time of the call, but may not be the actual value when the
** caller inspects it.
*/
NSPR_API(PRUintn) PR_GetValueSem(PRSemaphore *sem);

PR_END_EXTERN_C

#endif /* prsem_h___ */
