/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is 
 * Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Josh Aas <josh@mozilla.com>
 *  Robert O'Callahan <robert@ocallahan.org>
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
 * the terms of any one of the NPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#ifndef nsObjCExceptions_h_
#define nsObjCExceptions_h_

#import <Foundation/Foundation.h>

#ifdef DEBUG
#import <ExceptionHandling/NSExceptionHandler.h>
#endif

#if defined(MOZ_CRASHREPORTER) && defined(__cplusplus)
#include "nsICrashReporter.h"
#include "nsCOMPtr.h"
#include "nsServiceManagerUtils.h"
#endif

#include <unistd.h>
#include <signal.h>
#include "nsError.h"

// See Mozilla bug 163260.
// This file can only be included in an Objective-C context.

static void nsObjCExceptionLog(NSException* aException)
{
  NSLog(@"Mozilla has caught an Obj-C exception [%@: %@]",
        [aException name], [aException reason]);

#if defined(MOZ_CRASHREPORTER) && defined(__cplusplus)
  // Attach exception info to the crash report.
  nsCOMPtr<nsICrashReporter_MOZILLA_1_9_BRANCH> crashReporter =
    do_GetService("@mozilla.org/toolkit/crash-reporter;1");
  if (crashReporter)
    crashReporter->AppendObjCExceptionInfoToAppNotes(static_cast<void*>(aException));
#endif

#ifdef DEBUG
  @try {
    // Try to get stack information out of the exception. 10.5 returns the stack
    // info with the callStackReturnAddresses selector.
    NSArray *stackTrace = nil;
    if ([aException respondsToSelector:@selector(callStackReturnAddresses)]) {
      NSArray* addresses = (NSArray*)
        [aException performSelector:@selector(callStackReturnAddresses)];
      if ([addresses count])
        stackTrace = addresses;
    }

    // 10.4 doesn't respond to callStackReturnAddresses so we'll try to pull the
    // stack info out of the userInfo. It might not be there, sadly :(
    if (!stackTrace)
      stackTrace = [[aException userInfo] objectForKey:NSStackTraceKey];

    if (stackTrace) {
      // The command line should look like this:
      //   /usr/bin/atos -p <pid> -printHeader <stack frame addresses>
      NSMutableArray *args =
        [NSMutableArray arrayWithCapacity:[stackTrace count] + 3];

      [args addObject:@"-p"];
      int pid = [[NSProcessInfo processInfo] processIdentifier];
      [args addObject:[NSString stringWithFormat:@"%d", pid]];

      [args addObject:@"-printHeader"];

      unsigned int stackCount = [stackTrace count];
      unsigned int stackIndex = 0;
      for (; stackIndex < stackCount; stackIndex++)
        [args addObject:[[stackTrace objectAtIndex:stackIndex] stringValue]];

      NSPipe *outPipe = [NSPipe pipe];

      NSTask *task = [[NSTask alloc] init];
      [task setLaunchPath:@"/usr/bin/atos"];
      [task setArguments:args];
      [task setStandardOutput:outPipe];
      [task setStandardError:outPipe];

      NSLog(@"Generating stack trace for Obj-C exception...");

      // This will throw an exception if the atos tool cannot be found, and in
      // that case we'll just hit our @catch block below.
      [task launch];

      [task waitUntilExit];
      [task release];

      NSData *outData =
        [[outPipe fileHandleForReading] readDataToEndOfFile];
      NSString *outString =
        [[NSString alloc] initWithData:outData encoding:NSUTF8StringEncoding];

      NSLog(@"Stack trace:\n%@", outString);

      [outString release];
    }
    else {
      NSLog(@"<No stack information available for Obj-C exception>");
    }
  }
  @catch (NSException *exn) {
    NSLog(@"Failed to generate stack trace for Obj-C exception [%@: %@]",
          [exn name], [exn reason]);
  }
#endif
}

static void nsObjCExceptionAbort()
{
  // We need to raise a mach-o signal here, the Mozilla crash reporter on
  // Mac OS X does not respond to POSIX signals. Raising mach-o signals directly
  // is tricky so we do it by just derefing a null pointer.
  int* foo = NULL;
  *foo = 1;
}

static void nsObjCExceptionLogAbort(NSException *e)
{
  nsObjCExceptionLog(e);
  nsObjCExceptionAbort();
}

#define NS_OBJC_TRY(_e, _fail)                     \
@try { _e; }                                       \
@catch(NSException *_exn) {                        \
  nsObjCExceptionLog(_exn);                        \
  _fail;                                           \
}

#define NS_OBJC_TRY_EXPR(_e, _fail)                \
({                                                 \
   typeof(_e) _tmp;                                \
   @try { _tmp = (_e); }                           \
   @catch(NSException *_exn) {                     \
     nsObjCExceptionLog(_exn);                     \
     _fail;                                        \
   }                                               \
   _tmp;                                           \
})

#define NS_OBJC_TRY_EXPR_NULL(_e)                  \
NS_OBJC_TRY_EXPR(_e, 0)

#define NS_OBJC_TRY_IGNORE(_e)                     \
NS_OBJC_TRY(_e, )

// To reduce code size the abort versions do not reuse above macros. This allows
// catch blocks to only contain one call.

#define NS_OBJC_TRY_ABORT(_e)                      \
@try { _e; }                                       \
@catch(NSException *_exn) {                        \
  nsObjCExceptionLogAbort(_exn);                   \
}

#define NS_OBJC_TRY_EXPR_ABORT(_e)                 \
({                                                 \
   typeof(_e) _tmp;                                \
   @try { _tmp = (_e); }                           \
   @catch(NSException *_exn) {                     \
     nsObjCExceptionLogAbort(_exn);                \
   }                                               \
   _tmp;                                           \
})

// For wrapping blocks of Obj-C calls. Terminates app after logging.
#define NS_OBJC_BEGIN_TRY_ABORT_BLOCK @try {
#define NS_OBJC_END_TRY_ABORT_BLOCK   } @catch(NSException *_exn) {            \
                                        nsObjCExceptionLogAbort(_exn);         \
                                      }

// Same as above ABORT_BLOCK but returns a value after the try/catch block to
// suppress compiler warnings. This allows us to avoid having to refactor code
// to get scoping right when wrapping an entire method.

#define NS_OBJC_BEGIN_TRY_ABORT_BLOCK_NIL @try {
#define NS_OBJC_END_TRY_ABORT_BLOCK_NIL   } @catch(NSException *_exn) {        \
                                            nsObjCExceptionLogAbort(_exn);     \
                                          }                                    \
                                          return nil;

#define NS_OBJC_BEGIN_TRY_ABORT_BLOCK_NSNULL @try {
#define NS_OBJC_END_TRY_ABORT_BLOCK_NSNULL   } @catch(NSException *_exn) {     \
                                               nsObjCExceptionLogAbort(_exn);  \
                                             }                                 \
                                             return nsnull;

#define NS_OBJC_BEGIN_TRY_ABORT_BLOCK_NSRESULT @try {
#define NS_OBJC_END_TRY_ABORT_BLOCK_NSRESULT   } @catch(NSException *_exn) {   \
                                                 nsObjCExceptionLogAbort(_exn);\
                                               }                               \
                                               return NS_ERROR_FAILURE;

#define NS_OBJC_BEGIN_TRY_ABORT_BLOCK_RETURN    @try {
#define NS_OBJC_END_TRY_ABORT_BLOCK_RETURN(_rv) } @catch(NSException *_exn) {   \
                                                  nsObjCExceptionLogAbort(_exn);\
                                                }                               \
                                                return _rv;

#define NS_OBJC_BEGIN_TRY_LOGONLY_BLOCK @try {
#define NS_OBJC_END_TRY_LOGONLY_BLOCK   } @catch(NSException *_exn) {           \
                                          nsObjCExceptionLog(_exn);             \
                                        }

#endif // nsObjCExceptions_h_
