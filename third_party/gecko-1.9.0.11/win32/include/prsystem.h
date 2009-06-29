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

#ifndef prsystem_h___
#define prsystem_h___

/*
** API to NSPR functions returning system info.
*/
#include "prtypes.h"

PR_BEGIN_EXTERN_C

/*
** Get the host' directory separator.
**  Pathnames are then assumed to be of the form:
**      [<sep><root_component><sep>]*(<component><sep>)<leaf_name>
*/

NSPR_API(char) PR_GetDirectorySeparator(void);

/*
** OBSOLETE -- the function name is misspelled.
** Use PR_GetDirectorySeparator instead.
*/

NSPR_API(char) PR_GetDirectorySepartor(void);

/*
** Get the host' path separator.
**  Paths are assumed to be of the form:
**      <directory>[<sep><directory>]*
*/

NSPR_API(char) PR_GetPathSeparator(void);

/* Types of information available via PR_GetSystemInfo(...) */
typedef enum {
    PR_SI_HOSTNAME,  /* the hostname with the domain name (if any)
                      * removed */
    PR_SI_SYSNAME,
    PR_SI_RELEASE,
    PR_SI_ARCHITECTURE,
    PR_SI_HOSTNAME_UNTRUNCATED  /* the hostname exactly as configured
                                 * on the system */
} PRSysInfo;


/*
** If successful returns a null termintated string in 'buf' for
** the information indicated in 'cmd'. If unseccussful the reason for
** the failure can be retrieved from PR_GetError().
**
** The buffer is allocated by the caller and should be at least
** SYS_INFO_BUFFER_LENGTH bytes in length.
*/

#define SYS_INFO_BUFFER_LENGTH 256

NSPR_API(PRStatus) PR_GetSystemInfo(PRSysInfo cmd, char *buf, PRUint32 buflen);

/*
** Return the number of bytes in a page
*/
NSPR_API(PRInt32) PR_GetPageSize(void);

/*
** Return log2 of the size of a page
*/
NSPR_API(PRInt32) PR_GetPageShift(void);

/*
** PR_GetNumberOfProcessors() -- returns the number of CPUs
**
** Description:
** PR_GetNumberOfProcessors() extracts the number of processors
** (CPUs available in an SMP system) and returns the number.
** 
** Parameters:
**   none
**
** Returns:
**   The number of available processors or -1 on error
** 
*/
NSPR_API(PRInt32) PR_GetNumberOfProcessors( void );

/*
** PR_GetPhysicalMemorySize() -- returns the amount of system RAM
**
** Description:
** PR_GetPhysicalMemorySize() determines the amount of physical RAM
** in the system and returns the size in bytes.
**
** Parameters:
**   none
**
** Returns:
**   The amount of system RAM, or 0 on failure.
**
*/
NSPR_API(PRUint64) PR_GetPhysicalMemorySize(void);

PR_END_EXTERN_C

#endif /* prsystem_h___ */
