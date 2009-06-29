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


/* author: jstewart */

#if defined(_PRVERSION_H)
#else
#define _PRVERSION_H

#include "prtypes.h"

PR_BEGIN_EXTERN_C

/* All components participating in the PR version protocol must expose
 * a structure and a function. The structure is defined below and named
 * according to the naming conventions outlined further below.  The function
 * is called libVersionPoint and returns a pointer to this structure.
 */

/* on NT, always pack the structure the same. */
#ifdef _WIN32
#pragma pack(push, 8)
#endif

typedef struct {
    /*
     * The first field defines which version of this structure is in use.
     * At this time, only version 2 is specified. If this value is not 
     * 2, you must read no further into the structure.
     */
    PRInt32    version; 
  
    /* for Version 2, this is the body format. */
    PRInt64         buildTime;      /* 64 bits - usecs since midnight, 1/1/1970 */
    char *          buildTimeString;/* a human readable version of the time */
  
    PRUint8   vMajor;               /* Major version of this component */
    PRUint8   vMinor;               /* Minor version of this component */
    PRUint8   vPatch;               /* Patch level of this component */
  
    PRBool          beta;           /* true if this is a beta component */
    PRBool          debug;          /* true if this is a debug component */
    PRBool          special;        /* true if this component is a special build */
  
    char *          filename;       /* The original filename */
    char *          description;    /* description of this component */
    char *          security;       /* level of security in this component */
    char *          copyright;      /* The copyright for this file */
    char *          comment;        /* free form field for misc usage */
    char *          specialString;  /* the special variant for this build */
} PRVersionDescription;

/* on NT, restore the previous packing */
#ifdef _WIN32
#pragma pack(pop)
#endif

/*
 * All components must define an entrypoint named libVersionPoint which
 * is of type versionEntryPointType.
 *
 * For example, for a library named libfoo, we would have:
 *
 *   PRVersionDescription prVersionDescription_libfoo =
 *   {
 *       ...
 *   };
 *
 *   PR_IMPLEMENT(const PRVersionDescription*) libVersionPoint(void)
 *   {
 *       return &prVersionDescription_libfoo;
 *   }
 */
typedef const PRVersionDescription *(*versionEntryPointType)(void);

/* 
 * Where you declare your libVersionPoint, do it like this: 
 * PR_IMPLEMENT(const PRVersionDescription *) libVersionPoint(void) {
 *  fill it in...
 * }
 */

/*
 * NAMING CONVENTION FOR struct
 *
 * all components should also expose a static PRVersionDescription
 * The name of the struct should be calculated as follows:
 * Take the value of filename. (If filename is not specified, calculate
 * a short, unique string.)  Convert all non-alphanumeric characters
 * to '_'.  To this, prepend "PRVersionDescription_".  Thus for libfoo.so,
 * the symbol name is "PRVersionDescription_libfoo_so".
 * so the file should have
 * PRVersionDescription PRVersionDescription_libfoo_so { fill it in };
 * on NT, this file should be declspec export.
 */

PR_END_EXTERN_C

#endif  /* defined(_PRVERSION_H) */

/* prvrsion.h */

