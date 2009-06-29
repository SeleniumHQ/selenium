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

#ifndef plhash_h___
#define plhash_h___
/*
 * API to portable hash table code.
 */
#include <stdio.h>
#include "prtypes.h"

PR_BEGIN_EXTERN_C

typedef struct PLHashEntry  PLHashEntry;
typedef struct PLHashTable  PLHashTable;
typedef PRUint32 PLHashNumber;
#define PL_HASH_BITS 32  /* Number of bits in PLHashNumber */
typedef PLHashNumber (PR_CALLBACK *PLHashFunction)(const void *key);
typedef PRIntn (PR_CALLBACK *PLHashComparator)(const void *v1, const void *v2);

typedef PRIntn (PR_CALLBACK *PLHashEnumerator)(PLHashEntry *he, PRIntn i, void *arg);

/* Flag bits in PLHashEnumerator's return value */
#define HT_ENUMERATE_NEXT       0       /* continue enumerating entries */
#define HT_ENUMERATE_STOP       1       /* stop enumerating entries */
#define HT_ENUMERATE_REMOVE     2       /* remove and free the current entry */
#define HT_ENUMERATE_UNHASH     4       /* just unhash the current entry */

typedef struct PLHashAllocOps {
    void *              (PR_CALLBACK *allocTable)(void *pool, PRSize size);
    void                (PR_CALLBACK *freeTable)(void *pool, void *item);
    PLHashEntry *       (PR_CALLBACK *allocEntry)(void *pool, const void *key);
    void                (PR_CALLBACK *freeEntry)(void *pool, PLHashEntry *he, PRUintn flag);
} PLHashAllocOps;

#define HT_FREE_VALUE   0               /* just free the entry's value */
#define HT_FREE_ENTRY   1               /* free value and entire entry */

struct PLHashEntry {
    PLHashEntry         *next;          /* hash chain linkage */
    PLHashNumber        keyHash;        /* key hash function result */
    const void          *key;           /* ptr to opaque key */
    void                *value;         /* ptr to opaque value */
};

struct PLHashTable {
    PLHashEntry         **buckets;      /* vector of hash buckets */
    PRUint32              nentries;       /* number of entries in table */
    PRUint32              shift;          /* multiplicative hash shift */
    PLHashFunction      keyHash;        /* key hash function */
    PLHashComparator    keyCompare;     /* key comparison function */
    PLHashComparator    valueCompare;   /* value comparison function */
    const PLHashAllocOps *allocOps;     /* allocation operations */
    void                *allocPriv;     /* allocation private data */
#ifdef HASHMETER
    PRUint32              nlookups;       /* total number of lookups */
    PRUint32              nsteps;         /* number of hash chains traversed */
    PRUint32              ngrows;         /* number of table expansions */
    PRUint32              nshrinks;       /* number of table contractions */
#endif
};

/*
 * Create a new hash table.
 * If allocOps is null, use default allocator ops built on top of malloc().
 */
PR_EXTERN(PLHashTable *)
PL_NewHashTable(PRUint32 numBuckets, PLHashFunction keyHash,
                PLHashComparator keyCompare, PLHashComparator valueCompare,
                const PLHashAllocOps *allocOps, void *allocPriv);

PR_EXTERN(void)
PL_HashTableDestroy(PLHashTable *ht);

/* Higher level access methods */
PR_EXTERN(PLHashEntry *)
PL_HashTableAdd(PLHashTable *ht, const void *key, void *value);

PR_EXTERN(PRBool)
PL_HashTableRemove(PLHashTable *ht, const void *key);

PR_EXTERN(void *)
PL_HashTableLookup(PLHashTable *ht, const void *key);

PR_EXTERN(void *)
PL_HashTableLookupConst(PLHashTable *ht, const void *key);

PR_EXTERN(PRIntn)
PL_HashTableEnumerateEntries(PLHashTable *ht, PLHashEnumerator f, void *arg);

/* General-purpose C string hash function. */
PR_EXTERN(PLHashNumber)
PL_HashString(const void *key);

/* Compare strings using strcmp(), return true if equal. */
PR_EXTERN(PRIntn)
PL_CompareStrings(const void *v1, const void *v2);

/* Stub function just returns v1 == v2 */
PR_EXTERN(PRIntn)
PL_CompareValues(const void *v1, const void *v2);

/* Low level access methods */
PR_EXTERN(PLHashEntry **)
PL_HashTableRawLookup(PLHashTable *ht, PLHashNumber keyHash, const void *key);

PR_EXTERN(PLHashEntry **)
PL_HashTableRawLookupConst(PLHashTable *ht, PLHashNumber keyHash,
                           const void *key);

PR_EXTERN(PLHashEntry *)
PL_HashTableRawAdd(PLHashTable *ht, PLHashEntry **hep, PLHashNumber keyHash,
                   const void *key, void *value);

PR_EXTERN(void)
PL_HashTableRawRemove(PLHashTable *ht, PLHashEntry **hep, PLHashEntry *he);

/* This can be trivially implemented using PL_HashTableEnumerateEntries. */
PR_EXTERN(PRIntn)
PL_HashTableDump(PLHashTable *ht, PLHashEnumerator dump, FILE *fp);

PR_END_EXTERN_C

#endif /* plhash_h___ */
