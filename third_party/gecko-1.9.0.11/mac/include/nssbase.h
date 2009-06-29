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

#ifndef NSSBASE_H
#define NSSBASE_H

#ifdef DEBUG
static const char NSSBASE_CVS_ID[] = "@(#) $RCSfile: nssbase.h,v $ $Revision: 1.3 $ $Date: 2005/01/20 02:25:45 $";
#endif /* DEBUG */

/*
 * nssbase.h
 *
 * This header file contains the prototypes of the basic public
 * NSS routines.
 */

#ifndef NSSBASET_H
#include "nssbaset.h"
#endif /* NSSBASET_H */

PR_BEGIN_EXTERN_C

/*
 * NSSArena
 *
 * The public methods relating to this type are:
 *
 *  NSSArena_Create  -- constructor
 *  NSSArena_Destroy
 */

/*
 * NSSArena_Create
 *
 * This routine creates a new memory arena.  This routine may return
 * NULL upon error, in which case it will have created an error stack.
 *
 * The top-level error may be one of the following values:
 *  NSS_ERROR_NO_MEMORY
 *
 * Return value:
 *  NULL upon error
 *  A pointer to an NSSArena upon success
 */

NSS_EXTERN NSSArena *
NSSArena_Create
(
  void
);

extern const NSSError NSS_ERROR_NO_MEMORY;

/*
 * NSSArena_Destroy
 *
 * This routine will destroy the specified arena, freeing all memory
 * allocated from it.  This routine returns a PRStatus value; if 
 * successful, it will return PR_SUCCESS.  If unsuccessful, it will
 * create an error stack and return PR_FAILURE.
 *
 * The top-level error may be one of the following values:
 *  NSS_ERROR_INVALID_ARENA
 *
 * Return value:
 *  PR_SUCCESS upon success
 *  PR_FAILURE upon failure
 */

NSS_EXTERN PRStatus
NSSArena_Destroy
(
  NSSArena *arena
);

extern const NSSError NSS_ERROR_INVALID_ARENA;

/*
 * The error stack
 *
 * The public methods relating to the error stack are:
 *
 *  NSS_GetError
 *  NSS_GetErrorStack
 */

/*
 * NSS_GetError
 *
 * This routine returns the highest-level (most general) error set
 * by the most recent NSS library routine called by the same thread
 * calling this routine.
 *
 * This routine cannot fail.  It may return NSS_ERROR_NO_ERROR, which
 * indicates that the previous NSS library call did not set an error.
 *
 * Return value:
 *  0 if no error has been set
 *  A nonzero error number
 */

NSS_EXTERN NSSError
NSS_GetError
(
  void
);

extern const NSSError NSS_ERROR_NO_ERROR;

/*
 * NSS_GetErrorStack
 *
 * This routine returns a pointer to an array of NSSError values, 
 * containingthe entire sequence or "stack" of errors set by the most 
 * recent NSS library routine called by the same thread calling this 
 * routine.  NOTE: the caller DOES NOT OWN the memory pointed to by 
 * the return value.  The pointer will remain valid until the calling 
 * thread calls another NSS routine.  The lowest-level (most specific) 
 * error is first in the array, and the highest-level is last.  The 
 * array is zero-terminated.  This routine may return NULL upon error; 
 * this indicates a low-memory situation.
 *
 * Return value:
 *  NULL upon error, which is an implied NSS_ERROR_NO_MEMORY
 *  A NON-caller-owned pointer to an array of NSSError values
 */

NSS_EXTERN NSSError *
NSS_GetErrorStack
(
  void
);

PR_END_EXTERN_C

#endif /* NSSBASE_H */
