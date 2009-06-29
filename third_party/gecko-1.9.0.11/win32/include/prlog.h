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

#ifndef prlog_h___
#define prlog_h___

#include "prtypes.h"

PR_BEGIN_EXTERN_C

/*
** prlog.h -- Declare interfaces to NSPR's Logging service
**
** NSPR provides a logging service that is used by NSPR itself and is
** available to client programs.
**
** To use the service from a client program, you should create a
** PRLogModuleInfo structure by calling PR_NewLogModule(). After
** creating the LogModule, you can write to the log using the PR_LOG()
** macro.
**
** Initialization of the log service is handled by NSPR initialization.
**
** At execution time, you must enable the log service. To enable the
** log service, set the environment variable: NSPR_LOG_MODULES
** variable.
**
** NSPR_LOG_MODULES variable has the form:
**
**     <moduleName>:<value>[, <moduleName>:<value>]*
**
** Where:
**  <moduleName> is the name passed to PR_NewLogModule().
**  <value> is a numeric constant, e.g. 5. This value is the maximum
** value of a log event, enumerated by PRLogModuleLevel, that you want
** written to the log.
** 
** For example: to record all events of greater value than or equal to
** PR_LOG_ERROR for a LogModule names "gizmo", say:
** 
** set NSPR_LOG_MODULES=gizmo:2
** 
** Note that you must specify the numeric value of PR_LOG_ERROR.
** 
** Special LogModule names are provided for controlling NSPR's log
** service at execution time. These controls should be set in the
** NSPR_LOG_MODULES environment variable at execution time to affect
** NSPR's log service for your application.
** 
** The special LogModule "all" enables all LogModules. To enable all
** LogModule calls to PR_LOG(), say:
** 
** set NSPR_LOG_MODULES=all:5
** 
** The special LogModule name "sync" tells the NSPR log service to do
** unbuffered logging.
** 
** The special LogModule name "bufsize:<size>" tells NSPR to set the
** log buffer to <size>.
**
** The environment variable NSPR_LOG_FILE specifies the log file to use
** unless the default of "stderr" is acceptable. For MS Windows
** systems, NSPR_LOG_FILE can be set to a special value: "WinDebug"
** (case sensitive). This value causes PR_LOG() output to be written
** using the Windows API OutputDebugString(). OutputDebugString()
** writes to the debugger window; some people find this helpful.
** 
**
** To put log messages in your programs, use the PR_LOG macro:
**
**     PR_LOG(<module>, <level>, (<printfString>, <args>*));
**
** Where <module> is the address of a PRLogModuleInfo structure, and
** <level> is one of the levels defined by the enumeration:
** PRLogModuleLevel. <args> is a printf() style of argument list. That
** is: (fmtstring, ...).
**
** Example:
** 
** main() {
**    PRIntn one = 1;
**    PRLogModuleInfo * myLm = PR_NewLogModule("gizmo");
**    PR_LOG( myLm, PR_LOG_ALWAYS, ("Log this! %d\n", one)); 
**    return; 
** }
** 
** Note the use of printf() style arguments as the third agrument(s) to
** PR_LOG().
** 
** After compiling and linking you application, set the environment:
** 
** set NSPR_LOG_MODULES=gizmo:5
** set NSPR_LOG_FILE=logfile.txt
** 
** When you execute your application, the string "Log this! 1" will be
** written to the file "logfile.txt".
** 
** Note to NSPR engineers: a number of PRLogModuleInfo structures are
** defined and initialized in prinit.c. See this module for ideas on
** what to log where.
** 
*/

typedef enum PRLogModuleLevel {
    PR_LOG_NONE = 0,                /* nothing */
    PR_LOG_ALWAYS = 1,              /* always printed */
    PR_LOG_ERROR = 2,               /* error messages */
    PR_LOG_WARNING = 3,             /* warning messages */
    PR_LOG_DEBUG = 4,               /* debug messages */

    PR_LOG_NOTICE = PR_LOG_DEBUG,   /* notice messages */
    PR_LOG_WARN = PR_LOG_WARNING,   /* warning messages */
    PR_LOG_MIN = PR_LOG_DEBUG,      /* minimal debugging messages */
    PR_LOG_MAX = PR_LOG_DEBUG       /* maximal debugging messages */
} PRLogModuleLevel;

/*
** One of these structures is created for each module that uses logging.
**    "name" is the name of the module
**    "level" is the debugging level selected for that module
*/
typedef struct PRLogModuleInfo {
    const char *name;
    PRLogModuleLevel level;
    struct PRLogModuleInfo *next;
} PRLogModuleInfo;

/*
** Create a new log module.
*/
NSPR_API(PRLogModuleInfo*) PR_NewLogModule(const char *name);

/*
** Set the file to use for logging. Returns PR_FALSE if the file cannot
** be created
*/
NSPR_API(PRBool) PR_SetLogFile(const char *name);

/*
** Set the size of the logging buffer. If "buffer_size" is zero then the
** logging becomes "synchronous" (or unbuffered).
*/
NSPR_API(void) PR_SetLogBuffering(PRIntn buffer_size);

/*
** Print a string to the log. "fmt" is a PR_snprintf format type. All
** messages printed to the log are preceeded by the name of the thread
** and a time stamp. Also, the routine provides a missing newline if one
** is not provided.
*/
NSPR_API(void) PR_LogPrint(const char *fmt, ...);

/*
** Flush the log to its file.
*/
NSPR_API(void) PR_LogFlush(void);

/*
** Windoze 16 can't support a large static string space for all of the
** various debugging strings so logging is not enabled for it.
*/
#if (defined(DEBUG) || defined(FORCE_PR_LOG)) && !defined(WIN16)
#define PR_LOGGING 1

#define PR_LOG_TEST(_module,_level) \
    ((_module)->level >= (_level))

/*
** Log something.
**    "module" is the address of a PRLogModuleInfo structure
**    "level" is the desired logging level
**    "args" is a variable length list of arguments to print, in the following
**       format:  ("printf style format string", ...)
*/
#define PR_LOG(_module,_level,_args)     \
    PR_BEGIN_MACRO             \
      if (PR_LOG_TEST(_module,_level)) { \
      PR_LogPrint _args;         \
      }                     \
    PR_END_MACRO

#else /* (defined(DEBUG) || defined(FORCE_PR_LOG)) && !defined(WIN16) */

#undef PR_LOGGING
#define PR_LOG_TEST(module,level) 0
#define PR_LOG(module,level,args)

#endif /* (defined(DEBUG) || defined(FORCE_PR_LOG)) && !defined(WIN16) */

#ifndef NO_NSPR_10_SUPPORT

#ifdef PR_LOGGING
#define PR_LOG_BEGIN    PR_LOG
#define PR_LOG_END      PR_LOG
#define PR_LOG_DEFINE   PR_NewLogModule
#else
#define PR_LOG_BEGIN(module,level,args)
#define PR_LOG_END(module,level,args)
#define PR_LOG_DEFINE(_name)    NULL
#endif /* PR_LOGGING */

#endif /* NO_NSPR_10_SUPPORT */

#if defined(DEBUG) || defined(FORCE_PR_ASSERT)

NSPR_API(void) PR_Assert(const char *s, const char *file, PRIntn ln);
#define PR_ASSERT(_expr) \
    ((_expr)?((void)0):PR_Assert(# _expr,__FILE__,__LINE__))

#define PR_NOT_REACHED(_reasonStr) \
    PR_Assert(_reasonStr,__FILE__,__LINE__)

#else

#define PR_ASSERT(expr) ((void) 0)
#define PR_NOT_REACHED(reasonStr)

#endif /* defined(DEBUG) || defined(FORCE_PR_ASSERT) */

/*
** Compile-time assert. "condition" must be a constant expression.
** The macro can be used only in places where an "extern" declaration is
** allowed.
*/
#define PR_STATIC_ASSERT(condition) \
    extern void pr_static_assert(int arg[(condition) ? 1 : -1])

PR_END_EXTERN_C

#endif /* prlog_h___ */
