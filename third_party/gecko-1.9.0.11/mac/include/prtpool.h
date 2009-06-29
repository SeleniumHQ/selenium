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
 * Portions created by the Initial Developer are Copyright (C) 1999-2000
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

#ifndef prtpool_h___
#define prtpool_h___

#include "prtypes.h"
#include "prthread.h"
#include "prio.h"
#include "prerror.h"

/*
 * NOTE:
 *		THIS API IS A PRELIMINARY VERSION IN NSPR 4.0 AND IS SUBJECT TO
 *		CHANGE
 */

PR_BEGIN_EXTERN_C

typedef struct PRJobIoDesc {
    PRFileDesc *socket;
    PRErrorCode error;
    PRIntervalTime timeout;
} PRJobIoDesc;

typedef struct PRThreadPool PRThreadPool;
typedef struct PRJob PRJob;
typedef void (PR_CALLBACK *PRJobFn) (void *arg);

/* Create thread pool */
NSPR_API(PRThreadPool *)
PR_CreateThreadPool(PRInt32 initial_threads, PRInt32 max_threads,
                          PRUint32 stacksize);

/* queue a job */
NSPR_API(PRJob *)
PR_QueueJob(PRThreadPool *tpool, PRJobFn fn, void *arg, PRBool joinable);

/* queue a job, when a socket is readable */
NSPR_API(PRJob *)
PR_QueueJob_Read(PRThreadPool *tpool, PRJobIoDesc *iod,
							PRJobFn fn, void * arg, PRBool joinable);

/* queue a job, when a socket is writeable */
NSPR_API(PRJob *)
PR_QueueJob_Write(PRThreadPool *tpool, PRJobIoDesc *iod,
								PRJobFn fn, void * arg, PRBool joinable);

/* queue a job, when a socket has a pending connection */
NSPR_API(PRJob *)
PR_QueueJob_Accept(PRThreadPool *tpool, PRJobIoDesc *iod,
									PRJobFn fn, void * arg, PRBool joinable);

/* queue a job, when the socket connection to addr succeeds or fails */
NSPR_API(PRJob *)
PR_QueueJob_Connect(PRThreadPool *tpool, PRJobIoDesc *iod,
			const PRNetAddr *addr, PRJobFn fn, void * arg, PRBool joinable);

/* queue a job, when a timer exipres */
NSPR_API(PRJob *)
PR_QueueJob_Timer(PRThreadPool *tpool, PRIntervalTime timeout,
								PRJobFn fn, void * arg, PRBool joinable);
/* cancel a job */
NSPR_API(PRStatus)
PR_CancelJob(PRJob *job);

/* join a job */
NSPR_API(PRStatus)
PR_JoinJob(PRJob *job);

/* shutdown pool */
NSPR_API(PRStatus)
PR_ShutdownThreadPool(PRThreadPool *tpool);

/* join pool, wait for exit of all threads */
NSPR_API(PRStatus)
PR_JoinThreadPool(PRThreadPool *tpool);

PR_END_EXTERN_C

#endif /* prtpool_h___ */
