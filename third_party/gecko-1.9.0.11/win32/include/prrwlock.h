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
** File:		prrwlock.h
** Description:	API to basic reader-writer lock functions of NSPR.
**
**/

#ifndef prrwlock_h___
#define prrwlock_h___

#include "prtypes.h"

PR_BEGIN_EXTERN_C

/*
 * PRRWLock --
 *
 *	The reader writer lock, PRRWLock, is an opaque object to the clients
 *	of NSPR.  All routines operate on a pointer to this opaque entity.
 */


typedef struct PRRWLock PRRWLock;

#define	PR_RWLOCK_RANK_NONE	0


/***********************************************************************
** FUNCTION:    PR_NewRWLock
** DESCRIPTION:
**  Returns a pointer to a newly created reader-writer lock object.
** INPUTS:      Lock rank
**				Lock name
** OUTPUTS:     void
** RETURN:      PRRWLock*
**   If the lock cannot be created because of resource constraints, NULL
**   is returned.
**  
***********************************************************************/
NSPR_API(PRRWLock*) PR_NewRWLock(PRUint32 lock_rank, const char *lock_name);

/***********************************************************************
** FUNCTION:    PR_DestroyRWLock
** DESCRIPTION:
**  Destroys a given RW lock object.
** INPUTS:      PRRWLock *lock - Lock to be freed.
** OUTPUTS:     void
** RETURN:      None
***********************************************************************/
NSPR_API(void) PR_DestroyRWLock(PRRWLock *lock);

/***********************************************************************
** FUNCTION:    PR_RWLock_Rlock
** DESCRIPTION:
**  Apply a read lock (non-exclusive) on a RWLock
** INPUTS:      PRRWLock *lock - Lock to be read-locked.
** OUTPUTS:     void
** RETURN:      None
***********************************************************************/
NSPR_API(void) PR_RWLock_Rlock(PRRWLock *lock);

/***********************************************************************
** FUNCTION:    PR_RWLock_Wlock
** DESCRIPTION:
**  Apply a write lock (exclusive) on a RWLock
** INPUTS:      PRRWLock *lock - Lock to write-locked.
** OUTPUTS:     void
** RETURN:      None
***********************************************************************/
NSPR_API(void) PR_RWLock_Wlock(PRRWLock *lock);

/***********************************************************************
** FUNCTION:    PR_RWLock_Unlock
** DESCRIPTION:
**  Release a RW lock. Unlocking an unlocked lock has undefined results.
** INPUTS:      PRRWLock *lock - Lock to unlocked.
** OUTPUTS:     void
** RETURN:      void
***********************************************************************/
NSPR_API(void) PR_RWLock_Unlock(PRRWLock *lock);

PR_END_EXTERN_C

#endif /* prrwlock_h___ */
