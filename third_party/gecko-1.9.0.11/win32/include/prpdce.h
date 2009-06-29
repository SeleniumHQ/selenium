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

/*
 * File:		prpdce.h
 * Description:	This file is the API defined to allow for DCE (aka POSIX)
 *				thread emulation in an NSPR environment. It is not the
 *				intent that this be a fully supported API.
 */

#if !defined(PRPDCE_H)
#define PRPDCE_H

#include "prlock.h"
#include "prcvar.h"
#include "prtypes.h"
#include "prinrval.h"

PR_BEGIN_EXTERN_C

#define _PR_NAKED_CV_LOCK (PRLock*)0xdce1dce1

/*
** Test and acquire a lock.
**
** If the lock is acquired by the calling thread, the
** return value will be PR_SUCCESS. If the lock is
** already held, by another thread or this thread, the
** result will be PR_FAILURE.
*/
NSPR_API(PRStatus) PRP_TryLock(PRLock *lock);

/*
** Create a naked condition variable
**
** A "naked" condition variable is one that is not created bound
** to a lock. The CV created with this function is the only type
** that may be used in the subsequent "naked" condition variable
** operations (see PRP_NakedWait, PRP_NakedNotify, PRP_NakedBroadcast);
*/
NSPR_API(PRCondVar*) PRP_NewNakedCondVar(void);

/*
** Destroy a naked condition variable
**
** Destroy the condition variable created by PR_NewNakedCondVar.
*/
NSPR_API(void) PRP_DestroyNakedCondVar(PRCondVar *cvar);

/*
** Wait on a condition
**
** Wait on the condition variable 'cvar'. It is asserted that
** the lock protecting the condition 'lock' is held by the
** calling thread. If more time expires than that declared in
** 'timeout' the condition will be notified. Waits can be
** interrupted by another thread.
**
** NB: The CV ('cvar') must be one created using PR_NewNakedCondVar.
*/
NSPR_API(PRStatus) PRP_NakedWait(
	PRCondVar *cvar, PRLock *lock, PRIntervalTime timeout);

/*
** Notify a thread waiting on a condition
**
** Notify the condition specified 'cvar'.
**
** NB: The CV ('cvar') must be one created using PR_NewNakedCondVar.
*/
NSPR_API(PRStatus) PRP_NakedNotify(PRCondVar *cvar);

/*
** Notify all threads waiting on a condition
**
** Notify the condition specified 'cvar'.
**
** NB: The CV ('cvar') must be one created using PR_NewNakedCondVar.
*/
NSPR_API(PRStatus) PRP_NakedBroadcast(PRCondVar *cvar);

PR_END_EXTERN_C

#endif /* PRPDCE_H */
