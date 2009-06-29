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
** File:		nsrwlock.h
** Description:	API to basic reader-writer lock functions of NSS.
**	These are re-entrant reader writer locks; that is,
**	If I hold the write lock, I can ask for it and get it again.
**	If I hold the write lock, I can also ask for and get a read lock.
**      I can then release the locks in any order (read or write).
**	I must release each lock type as many times as I acquired it.
**	Otherwise, these are normal reader/writer locks.
**
** For deadlock detection, locks should be ranked, and no lock may be aquired
** while I hold a lock of higher rank number.
** If you don't want that feature, always use NSS_RWLOCK_RANK_NONE.
** Lock name is for debugging, and is optional (may be NULL)
**/

#ifndef nssrwlk_h___
#define nssrwlk_h___

#include "utilrename.h"
#include "prtypes.h"
#include "nssrwlkt.h"

#define	NSS_RWLOCK_RANK_NONE	0

/* SEC_BEGIN_PROTOS */
PR_BEGIN_EXTERN_C

/***********************************************************************
** FUNCTION:    NSSRWLock_New
** DESCRIPTION:
**  Returns a pointer to a newly created reader-writer lock object.
** INPUTS:      Lock rank
**		Lock name
** OUTPUTS:     void
** RETURN:      NSSRWLock*
**   If the lock cannot be created because of resource constraints, NULL
**   is returned.
**  
***********************************************************************/
extern NSSRWLock* NSSRWLock_New(PRUint32 lock_rank, const char *lock_name);

/***********************************************************************
** FUNCTION:    NSSRWLock_AtomicCreate
** DESCRIPTION:
**  Given the address of a NULL pointer to a NSSRWLock, 
**  atomically initializes that pointer to a newly created NSSRWLock.
**  Returns the value placed into that pointer, or NULL.
**
** INPUTS:      address of NSRWLock pointer
**              Lock rank
**		Lock name
** OUTPUTS:     NSSRWLock*
** RETURN:      NSSRWLock*
**   If the lock cannot be created because of resource constraints, 
**   the pointer will be left NULL.
**  
***********************************************************************/
extern NSSRWLock *
nssRWLock_AtomicCreate( NSSRWLock  ** prwlock, 
			PRUint32      lock_rank, 
			const char *  lock_name);

/***********************************************************************
** FUNCTION:    NSSRWLock_Destroy
** DESCRIPTION:
**  Destroys a given RW lock object.
** INPUTS:      NSSRWLock *lock - Lock to be freed.
** OUTPUTS:     void
** RETURN:      None
***********************************************************************/
extern void NSSRWLock_Destroy(NSSRWLock *lock);

/***********************************************************************
** FUNCTION:    NSSRWLock_LockRead
** DESCRIPTION:
**  Apply a read lock (non-exclusive) on a RWLock
** INPUTS:      NSSRWLock *lock - Lock to be read-locked.
** OUTPUTS:     void
** RETURN:      None
***********************************************************************/
extern void NSSRWLock_LockRead(NSSRWLock *lock);

/***********************************************************************
** FUNCTION:    NSSRWLock_LockWrite
** DESCRIPTION:
**  Apply a write lock (exclusive) on a RWLock
** INPUTS:      NSSRWLock *lock - Lock to write-locked.
** OUTPUTS:     void
** RETURN:      None
***********************************************************************/
extern void NSSRWLock_LockWrite(NSSRWLock *lock);

/***********************************************************************
** FUNCTION:    NSSRWLock_UnlockRead
** DESCRIPTION:
**  Release a Read lock. Unlocking an unlocked lock has undefined results.
** INPUTS:      NSSRWLock *lock - Lock to unlocked.
** OUTPUTS:     void
** RETURN:      void
***********************************************************************/
extern void NSSRWLock_UnlockRead(NSSRWLock *lock);

/***********************************************************************
** FUNCTION:    NSSRWLock_UnlockWrite
** DESCRIPTION:
**  Release a Write lock. Unlocking an unlocked lock has undefined results.
** INPUTS:      NSSRWLock *lock - Lock to unlocked.
** OUTPUTS:     void
** RETURN:      void
***********************************************************************/
extern void NSSRWLock_UnlockWrite(NSSRWLock *lock);

/***********************************************************************
** FUNCTION:    NSSRWLock_HaveWriteLock
** DESCRIPTION:
**  Tells caller whether the current thread holds the write lock, or not.
** INPUTS:      NSSRWLock *lock - Lock to test.
** OUTPUTS:     void
** RETURN:      PRBool	PR_TRUE IFF the current thread holds the write lock.
***********************************************************************/

extern PRBool NSSRWLock_HaveWriteLock(NSSRWLock *rwlock);

/* SEC_END_PROTOS */
PR_END_EXTERN_C

#endif /* nsrwlock_h___ */
