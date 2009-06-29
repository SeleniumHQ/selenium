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
 * Portions created by the Initial Developer are Copyright (C) 1999-2000
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
 * File: pripcsem.h
 *
 * Description: named semaphores for interprocess
 * synchronization
 *
 * Unrelated processes obtain access to a shared semaphore
 * by specifying its name.
 *
 * Our goal is to support named semaphores on at least
 * Unix and Win32 platforms.  The implementation will use
 * one of the three native semaphore APIs: POSIX, System V,
 * and Win32.
 *
 * Because POSIX named semaphores have kernel persistence,
 * we are forced to have a delete function in this API.
 */

#ifndef pripcsem_h___
#define pripcsem_h___

#include "prtypes.h"
#include "prio.h"

PR_BEGIN_EXTERN_C

/*
 * PRSem is an opaque structure that represents a named
 * semaphore.
 */
typedef struct PRSem PRSem;

/*
 * PR_OpenSemaphore --
 *
 * Create or open a named semaphore with the specified name.
 * A handle to the semaphore is returned.
 *
 * If the named semaphore doesn't exist and the PR_SEM_CREATE
 * flag is specified, the named semaphore is created.  The
 * created semaphore needs to be removed from the system with
 * a PR_DeleteSemaphore call.
 *
 * If PR_SEM_CREATE is specified, the third argument is the
 * access permission bits of the new semaphore (same
 * interpretation as the mode argument to PR_Open) and the
 * fourth argument is the initial value of the new semaphore.
 * If PR_SEM_CREATE is not specified, the third and fourth
 * arguments are ignored.
 */

#define PR_SEM_CREATE 0x1  /* create if not exist */
#define PR_SEM_EXCL   0x2  /* fail if already exists */

NSPR_API(PRSem *) PR_OpenSemaphore(
    const char *name, PRIntn flags, PRIntn mode, PRUintn value);

/*
 * PR_WaitSemaphore --
 *
 * If the value of the semaphore is > 0, decrement the value and return.
 * If the value is 0, sleep until the value becomes > 0, then decrement
 * the value and return.
 *
 * The "test and decrement" operation is performed atomically.
 */

NSPR_API(PRStatus) PR_WaitSemaphore(PRSem *sem);

/*
 * PR_PostSemaphore --
 *
 * Increment the value of the named semaphore by 1.
 */

NSPR_API(PRStatus) PR_PostSemaphore(PRSem *sem);

/*
 * PR_CloseSemaphore --
 *
 * Close a named semaphore handle.
 */

NSPR_API(PRStatus) PR_CloseSemaphore(PRSem *sem);

/*
 * PR_DeleteSemaphore --
 *
 * Remove a named semaphore from the system.
 */

NSPR_API(PRStatus) PR_DeleteSemaphore(const char *name);

PR_END_EXTERN_C

#endif /* pripcsem_h___ */
