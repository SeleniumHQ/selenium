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
** File:          plgetopt.h
** Description:   utilities to parse argc/argv
*/

#if defined(PLGETOPT_H_)
#else
#define PLGETOPT_H_

#include "prtypes.h"

PR_BEGIN_EXTERN_C

typedef struct PLOptionInternal PLOptionInternal; 

typedef enum
{
        PL_OPT_OK,              /* all's well with the option */
        PL_OPT_EOL,             /* end of options list */
        PL_OPT_BAD              /* invalid option (and value) */
} PLOptStatus;

typedef struct PLLongOpt
{
    const char * longOptName;   /* long option name string                  */
    PRIntn       longOption;    /* value put in PLOptState for this option. */
    PRBool       valueRequired; /* If option name not followed by '=',      */
                                /* value is the next argument from argv.    */
} PLLongOpt;

typedef struct PLOptState
{
    char option;                /* the name of the option */
    const char *value;          /* the value of that option | NULL */

    PLOptionInternal *internal; /* private processing state */

    PRIntn   longOption;        /* value from PLLongOpt put here */
    PRIntn   longOptIndex;      /* index into caller's array of PLLongOpts */
} PLOptState;

/*
 * PL_CreateOptState
 *
 * The argument "options" points to a string of single-character option 
 * names.  Option names that may have an option argument value must be 
 * followed immediately by a ':' character.  
 */
PR_EXTERN(PLOptState*) PL_CreateOptState(
        PRIntn argc, char **argv, const char *options);

/* 
 * PL_CreateLongOptState
 *
 * Alternative to PL_CreateOptState.  
 * Allows caller to specify BOTH a string of single-character option names, 
 * AND an array of structures describing "long" (keyword) option names.  
 * The array is terminated by a structure in which longOptName is NULL.  
 * Long option values (arguments) may always be given as "--name=value".
 * If PLLongOpt.valueRequired is not PR_FALSE, and the option name was not 
 * followed by '=' then the next argument from argv is taken as the value.  
 */
PR_EXTERN(PLOptState*) PL_CreateLongOptState(
        PRIntn argc, char **argv, const char *options, 
        const PLLongOpt *longOpts);
/*
 * PL_DestroyOptState
 *
 * Call this to destroy the PLOptState returned from PL_CreateOptState or
 * PL_CreateLongOptState.
 */
PR_EXTERN(void) PL_DestroyOptState(PLOptState *opt);

/*
 * PL_GetNextOpt
 *
 * When this function returns PL_OPT_OK, 
 * - opt->option will hold the single-character option name that was parsed, 
 *   or zero.  
 * When opt->option is zero, the token parsed was either a "long" (keyword) 
 *   option or a positional parameter.  
 * For a positional parameter, 
 * - opt->longOptIndex will contain -1, and
 * - opt->value will point to the positional parameter string.
 * For a long option name, 
 * - opt->longOptIndex will contain the non-negative index of the 
 *   PLLongOpt structure in the caller's array of PLLongOpt structures 
 8   corresponding to the long option name, and 
 * For a single-character or long option, 
 * - opt->longOption will contain the value of the single-character option
 *   name, or the value of the longOption from the PLLongOpt structure
 *   for that long option.  See notes below.
 * - opt->value will point to the argument option string, or will
 *   be NULL if no argument option string was given.
 * When opt->option is non-zero, 
 * - opt->longOptIndex will be -1
 * When this function returns PL_OPT_EOL, or PL_OPT_BAD, the contents of
 *   opt are undefined.
 *
 * Notes: It is possible to ignore opt->option, and always look at 
 *   opt->longOption instead.  opt->longOption will contain the same value
 *   as opt->option for single-character option names, and will contain the
 *   value of longOption from the PLLongOpt structure for long option names.
 * This means that it is possible to equivalence long option names to 
 *   single character names by giving the longOption in the PLLongOpt struct
 *   the same value as the single-character option name.  
 * For long options that are NOT intended to be equivalent to any single-
 *   character option, the longOption value should be chosen to not match 
 *   any possible single character name.  It might be advisable to choose
 *   longOption values greater than 0xff for such long options.
 */
PR_EXTERN(PLOptStatus) PL_GetNextOpt(PLOptState *opt);

PR_END_EXTERN_C

#endif /* defined(PLGETOPT_H_) */

/* plgetopt.h */

