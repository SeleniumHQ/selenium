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

#ifndef NSSBASET_H
#define NSSBASET_H

#ifdef DEBUG
static const char NSSBASET_CVS_ID[] = "@(#) $RCSfile: nssbaset.h,v $ $Revision: 1.7 $ $Date: 2008/10/05 20:59:16 $";
#endif /* DEBUG */

/*
 * nssbaset.h
 *
 * This file contains the most low-level, fundamental public types.
 */

#include "nspr.h"
#include "nssilock.h"

/*
 * NSS_EXTERN, NSS_IMPLEMENT, NSS_EXTERN_DATA, NSS_IMPLEMENT_DATA
 *
 * NSS has its own versions of these NSPR macros, in a form which
 * does not confuse ctags and other related utilities.  NSPR 
 * defines these macros to take the type as an argument, because
 * of a requirement to support win16 dlls.  We do not have that
 * requirement, so we can drop that restriction.
 */

#define DUMMY	/* dummy */
#define NSS_EXTERN         extern
#define NSS_EXTERN_DATA    extern
#define NSS_IMPLEMENT      
#define NSS_IMPLEMENT_DATA 

PR_BEGIN_EXTERN_C

/*
 * NSSError
 *
 * Calls to NSS routines may result in one or more errors being placed
 * on the calling thread's "error stack."  Every possible error that
 * may be returned from a function is declared where the function is 
 * prototyped.  All errors are of the following type.
 */

typedef PRInt32 NSSError;

/*
 * NSSArena
 *
 * Arenas are logical sets of heap memory, from which memory may be
 * allocated.  When an arena is destroyed, all memory allocated within
 * that arena is implicitly freed.  These arenas are thread-safe: 
 * an arena pointer may be used by multiple threads simultaneously.
 * However, as they are not backed by shared memory, they may only be
 * used within one process.
 */

struct NSSArenaStr;
typedef struct NSSArenaStr NSSArena;

/*
 * NSSItem
 *
 * This is the basic type used to refer to an unconstrained datum of
 * arbitrary size.
 */

struct NSSItemStr {
  void *data;
  PRUint32 size;
};
typedef struct NSSItemStr NSSItem;


/*
 * NSSBER
 *
 * Data packed according to the Basic Encoding Rules of ASN.1.
 */

typedef NSSItem NSSBER;

/*
 * NSSDER
 *
 * Data packed according to the Distinguished Encoding Rules of ASN.1;
 * this form is also known as the Canonical Encoding Rules form (CER).
 */

typedef NSSBER NSSDER;

/*
 * NSSBitString
 *
 * Some ASN.1 types use "bit strings," which are passed around as
 * octet strings but whose length is counted in bits.  We use this
 * typedef of NSSItem to point out the occasions when the length
 * is counted in bits, not octets.
 */

typedef NSSItem NSSBitString;

/*
 * NSSUTF8
 *
 * Character strings encoded in UTF-8, as defined by RFC 2279.
 */

typedef char NSSUTF8;

/*
 * NSSASCII7
 *
 * Character strings guaranteed to be 7-bit ASCII.
 */

typedef char NSSASCII7;

PR_END_EXTERN_C

#endif /* NSSBASET_H */
