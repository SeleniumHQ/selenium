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

#if defined(PLARENAS_H)
#else  /* defined(PLARENAS_H) */
#define PLARENAS_H

PR_BEGIN_EXTERN_C

typedef struct PLArenaPool      PLArenaPool;

/*
** Allocate an arena pool as specified by the parameters.
**
** This is equivelant to allocating the space yourself and then
** calling PL_InitArenaPool().
**
** This function may fail (and return a NULL) for a variety of
** reasons. The reason for a particular failure can be discovered
** by calling PR_GetError().
*/
#if 0  /* Not implemented */
PR_EXTERN(PLArenaPool*) PL_AllocArenaPool(
    const char *name, PRUint32 size, PRUint32 align);
#endif

/*
** Destroy an arena pool previously allocated by PL_AllocArenaPool().
**
** This function may fail if the arena is not empty and the caller
** wishes to check for empty upon descruction.
*/
#if 0  /* Not implemented */
PR_EXTERN(PRStatus) PL_DestroyArenaPool(PLArenaPool *pool, PRBool checkEmpty);
#endif


/*
** Initialize an arena pool with the given name for debugging and metering,
** with a minimum size per arena of size bytes.
**/
PR_EXTERN(void) PL_InitArenaPool(
    PLArenaPool *pool, const char *name, PRUint32 size, PRUint32 align);

/*
** Finish using arenas, freeing all memory associated with them.
**/
PR_EXTERN(void) PL_ArenaFinish(void);

/*
** Free the arenas in pool.  The user may continue to allocate from pool
** after calling this function.  There is no need to call PL_InitArenaPool()
** again unless PL_FinishArenaPool(pool) has been called.
**/
PR_EXTERN(void) PL_FreeArenaPool(PLArenaPool *pool);

/*
** Free the arenas in pool and finish using it altogether.
**/
PR_EXTERN(void) PL_FinishArenaPool(PLArenaPool *pool);

/*
** Compact all of the arenas in a pool so that no space is wasted.
**/
PR_EXTERN(void) PL_CompactArenaPool(PLArenaPool *pool);

/*
** Friend functions used by the PL_ARENA_*() macros.
**/
PR_EXTERN(void *) PL_ArenaAllocate(PLArenaPool *pool, PRUint32 nb);

PR_EXTERN(void *) PL_ArenaGrow(
    PLArenaPool *pool, void *p, PRUint32 size, PRUint32 incr);

PR_EXTERN(void) PL_ArenaRelease(PLArenaPool *pool, char *mark);

PR_END_EXTERN_C

#endif /* defined(PLARENAS_H) */

/* plarenas */
