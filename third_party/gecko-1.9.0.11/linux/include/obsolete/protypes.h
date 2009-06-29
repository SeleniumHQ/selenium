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
 * This header typedefs the old 'native' types to the new PR<type>s.
 * These definitions are scheduled to be eliminated at the earliest
 * possible time. The NSPR API is implemented and documented using
 * the new definitions.
 */

#if !defined(PROTYPES_H)
#define PROTYPES_H

typedef PRUintn uintn;
#ifndef _XP_Core_
typedef PRIntn intn;
#endif

/*
 * It is trickier to define uint, int8, uint8, int16, uint16,
 * int32, uint32, int64, and uint64 because some of these int
 * types are defined by standard header files on some platforms.
 * Our strategy here is to include all such standard headers
 * first, and then define these int types only if they are not
 * defined by those standard headers.
 */

/*
 * BeOS defines all the int types below in its standard header
 * file SupportDefs.h.
 */
#ifdef XP_BEOS
#include <support/SupportDefs.h>
#endif

/*
 * OpenVMS defines all the int types below in its standard
 * header files ints.h and types.h.
 */
#ifdef VMS
#include <ints.h>
#include <types.h>
#endif

/*
 * SVR4 typedef of uint is commonly found on UNIX machines.
 *
 * On AIX 4.3, sys/inttypes.h (which is included by sys/types.h)
 * defines the types int8, int16, int32, and int64.
 */
#ifdef XP_UNIX
#include <sys/types.h>
#endif

/* model.h on HP-UX defines int8, int16, and int32. */
#ifdef HPUX
#include <model.h>
#endif

/*
 * uint
 */

#if !defined(XP_BEOS) && !defined(VMS) \
    && !defined(XP_UNIX) || defined(NTO)
typedef PRUintn uint;
#endif

/*
 * uint64
 */

#if !defined(XP_BEOS) && !defined(VMS)
typedef PRUint64 uint64;
#endif

/*
 * uint32
 */

#if !defined(XP_BEOS) && !defined(VMS)
#if !defined(XP_MAC) && !defined(_WIN32) && !defined(XP_OS2) && !defined(NTO)
typedef PRUint32 uint32;
#else
typedef unsigned long uint32;
#endif
#endif

/*
 * uint16
 */

#if !defined(XP_BEOS) && !defined(VMS)
typedef PRUint16 uint16;
#endif

/*
 * uint8
 */

#if !defined(XP_BEOS) && !defined(VMS)
typedef PRUint8 uint8;
#endif

/*
 * int64
 */

#if !defined(XP_BEOS) && !defined(VMS) \
    && !defined(_PR_AIX_HAVE_BSD_INT_TYPES)
typedef PRInt64 int64;
#endif

/*
 * int32
 */

#if !defined(XP_BEOS) && !defined(VMS) \
    && !defined(_PR_AIX_HAVE_BSD_INT_TYPES) \
    && !defined(HPUX)
#if !defined(XP_MAC) && !defined(_WIN32) && !defined(XP_OS2) && !defined(NTO)
typedef PRInt32 int32;
#else
typedef long int32;
#endif
#endif

/*
 * int16
 */

#if !defined(XP_BEOS) && !defined(VMS) \
    && !defined(_PR_AIX_HAVE_BSD_INT_TYPES) \
    && !defined(HPUX)
typedef PRInt16 int16;
#endif

/*
 * int8
 */

#if !defined(XP_BEOS) && !defined(VMS) \
    && !defined(_PR_AIX_HAVE_BSD_INT_TYPES) \
    && !defined(HPUX)
typedef PRInt8 int8;
#endif

typedef PRFloat64 float64;
typedef PRUptrdiff uptrdiff_t;
typedef PRUword uprword_t;
typedef PRWord prword_t;


/* Re: prbit.h */
#define TEST_BIT	PR_TEST_BIT
#define SET_BIT		PR_SET_BIT
#define CLEAR_BIT	PR_CLEAR_BIT

/* Re: prarena.h->plarena.h */
#define PRArena PLArena
#define PRArenaPool PLArenaPool
#define PRArenaStats PLArenaStats
#define PR_ARENA_ALIGN PL_ARENA_ALIGN
#define PR_INIT_ARENA_POOL PL_INIT_ARENA_POOL
#define PR_ARENA_ALLOCATE PL_ARENA_ALLOCATE
#define PR_ARENA_GROW PL_ARENA_GROW
#define PR_ARENA_MARK PL_ARENA_MARK
#define PR_CLEAR_UNUSED PL_CLEAR_UNUSED
#define PR_CLEAR_ARENA PL_CLEAR_ARENA
#define PR_ARENA_RELEASE PL_ARENA_RELEASE
#define PR_COUNT_ARENA PL_COUNT_ARENA
#define PR_ARENA_DESTROY PL_ARENA_DESTROY
#define PR_InitArenaPool PL_InitArenaPool
#define PR_FreeArenaPool PL_FreeArenaPool
#define PR_FinishArenaPool PL_FinishArenaPool
#define PR_CompactArenaPool PL_CompactArenaPool
#define PR_ArenaFinish PL_ArenaFinish
#define PR_ArenaAllocate PL_ArenaAllocate
#define PR_ArenaGrow PL_ArenaGrow
#define PR_ArenaRelease PL_ArenaRelease
#define PR_ArenaCountAllocation PL_ArenaCountAllocation
#define PR_ArenaCountInplaceGrowth PL_ArenaCountInplaceGrowth
#define PR_ArenaCountGrowth PL_ArenaCountGrowth
#define PR_ArenaCountRelease PL_ArenaCountRelease
#define PR_ArenaCountRetract PL_ArenaCountRetract

/* Re: prhash.h->plhash.h */
#define PRHashEntry PLHashEntry
#define PRHashTable PLHashTable
#define PRHashNumber PLHashNumber
#define PRHashFunction PLHashFunction
#define PRHashComparator PLHashComparator
#define PRHashEnumerator PLHashEnumerator
#define PRHashAllocOps PLHashAllocOps
#define PR_NewHashTable PL_NewHashTable
#define PR_HashTableDestroy PL_HashTableDestroy
#define PR_HashTableRawLookup PL_HashTableRawLookup
#define PR_HashTableRawAdd PL_HashTableRawAdd
#define PR_HashTableRawRemove PL_HashTableRawRemove
#define PR_HashTableAdd PL_HashTableAdd
#define PR_HashTableRemove PL_HashTableRemove
#define PR_HashTableEnumerateEntries PL_HashTableEnumerateEntries
#define PR_HashTableLookup PL_HashTableLookup
#define PR_HashTableDump PL_HashTableDump
#define PR_HashString PL_HashString
#define PR_CompareStrings PL_CompareStrings
#define PR_CompareValues PL_CompareValues

#if defined(XP_MAC)
#ifndef TRUE				/* Mac standard is lower case true */
	#define TRUE 1
#endif
#ifndef FALSE				/* Mac standard is lower case false */
	#define FALSE 0
#endif
#endif

#endif /* !defined(PROTYPES_H) */
