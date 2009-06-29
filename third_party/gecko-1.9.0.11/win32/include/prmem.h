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
** File: prmem.h
** Description: API to NSPR memory management functions
**
*/
#ifndef prmem_h___
#define prmem_h___

#include "prtypes.h"
#include <stdlib.h>

PR_BEGIN_EXTERN_C

/*
** Thread safe memory allocation.
**
** NOTE: pr wraps up malloc, free, calloc, realloc so they are already
** thread safe (and are not declared here - look in stdlib.h).
*/

/*
** PR_Malloc, PR_Calloc, PR_Realloc, and PR_Free have the same signatures
** as their libc equivalent malloc, calloc, realloc, and free, and have
** the same semantics.  (Note that the argument type size_t is replaced
** by PRUint32.)  Memory allocated by PR_Malloc, PR_Calloc, or PR_Realloc
** must be freed by PR_Free.
*/

NSPR_API(void *) PR_Malloc(PRUint32 size);

NSPR_API(void *) PR_Calloc(PRUint32 nelem, PRUint32 elsize);

NSPR_API(void *) PR_Realloc(void *ptr, PRUint32 size);

NSPR_API(void) PR_Free(void *ptr);

/*
** The following are some convenience macros defined in terms of
** PR_Malloc, PR_Calloc, PR_Realloc, and PR_Free.
*/

/***********************************************************************
** FUNCTION:	PR_MALLOC()
** DESCRIPTION:
**   PR_NEW() allocates an untyped item of size _size from the heap.
** INPUTS:  _size: size in bytes of item to be allocated
** OUTPUTS:	untyped pointer to the node allocated
** RETURN:	pointer to node or error returned from malloc().
***********************************************************************/
#define PR_MALLOC(_bytes) (PR_Malloc((_bytes)))

/***********************************************************************
** FUNCTION:	PR_NEW()
** DESCRIPTION:
**   PR_NEW() allocates an item of type _struct from the heap.
** INPUTS:  _struct: a data type
** OUTPUTS:	pointer to _struct
** RETURN:	pointer to _struct or error returns from malloc().
***********************************************************************/
#define PR_NEW(_struct) ((_struct *) PR_MALLOC(sizeof(_struct)))

/***********************************************************************
** FUNCTION:	PR_REALLOC()
** DESCRIPTION:
**   PR_REALLOC() re-allocates _ptr bytes from the heap as a _size
**   untyped item.
** INPUTS:	_ptr: pointer to node to reallocate
**          _size: size of node to allocate
** OUTPUTS:	pointer to node allocated
** RETURN:	pointer to node allocated
***********************************************************************/
#define PR_REALLOC(_ptr, _size) (PR_Realloc((_ptr), (_size)))

/***********************************************************************
** FUNCTION:	PR_CALLOC()
** DESCRIPTION:
**   PR_CALLOC() allocates a _size bytes untyped item from the heap
**   and sets the allocated memory to all 0x00.
** INPUTS:	_size: size of node to allocate
** OUTPUTS:	pointer to node allocated
** RETURN:	pointer to node allocated
***********************************************************************/
#define PR_CALLOC(_size) (PR_Calloc(1, (_size)))

/***********************************************************************
** FUNCTION:	PR_NEWZAP()
** DESCRIPTION:
**   PR_NEWZAP() allocates an item of type _struct from the heap
**   and sets the allocated memory to all 0x00.
** INPUTS:	_struct: a data type
** OUTPUTS:	pointer to _struct
** RETURN:	pointer to _struct
***********************************************************************/
#define PR_NEWZAP(_struct) ((_struct*)PR_Calloc(1, sizeof(_struct)))

/***********************************************************************
** FUNCTION:	PR_DELETE()
** DESCRIPTION:
**   PR_DELETE() unallocates an object previosly allocated via PR_NEW()
**   or PR_NEWZAP() to the heap.
** INPUTS:	pointer to previously allocated object
** OUTPUTS:	the referenced object is returned to the heap
** RETURN:	void
***********************************************************************/
#define PR_DELETE(_ptr) { PR_Free(_ptr); (_ptr) = NULL; }

/***********************************************************************
** FUNCTION:	PR_FREEIF()
** DESCRIPTION:
**   PR_FREEIF() conditionally unallocates an object previously allocated
**   vial PR_NEW() or PR_NEWZAP(). If the pointer to the object is
**   equal to zero (0), the object is not released.
** INPUTS:	pointer to previously allocated object
** OUTPUTS:	the referenced object is conditionally returned to the heap
** RETURN:	void
***********************************************************************/
#define PR_FREEIF(_ptr)	if (_ptr) PR_DELETE(_ptr)

PR_END_EXTERN_C

#endif /* prmem_h___ */
