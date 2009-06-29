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

#ifndef prcmon_h___
#define prcmon_h___

/*
** Interface to cached monitors. Cached monitors use an address to find a
** given PR monitor. In this way a monitor can be associated with another
** object without preallocating a monitor for all objects.
**
** A hash table is used to quickly map addresses to individual monitors
** and the system automatically grows the hash table as needed.
**
** Cache monitors are about 5 times slower to use than uncached monitors.
*/
#include "prmon.h"
#include "prinrval.h"

PR_BEGIN_EXTERN_C

/**
** Like PR_EnterMonitor except use the "address" to find a monitor in the
** monitor cache. If successful, returns the PRMonitor now associated
** with "address". Note that you must PR_CExitMonitor the address to
** release the monitor cache entry (otherwise the monitor cache will fill
** up). This call will return NULL if the monitor cache needs to be
** expanded and the system is out of memory.
*/
NSPR_API(PRMonitor*) PR_CEnterMonitor(void *address);

/*
** Like PR_ExitMonitor except use the "address" to find a monitor in the
** monitor cache.
*/
NSPR_API(PRStatus) PR_CExitMonitor(void *address);

/*
** Like PR_Wait except use the "address" to find a monitor in the
** monitor cache.
*/
NSPR_API(PRStatus) PR_CWait(void *address, PRIntervalTime timeout);

/*
** Like PR_Notify except use the "address" to find a monitor in the
** monitor cache.
*/
NSPR_API(PRStatus) PR_CNotify(void *address);

/*
** Like PR_NotifyAll except use the "address" to find a monitor in the
** monitor cache.
*/
NSPR_API(PRStatus) PR_CNotifyAll(void *address);

/*
** Set a callback to be invoked each time a monitor is recycled from the cache
** freelist, with the monitor's cache-key passed in address.
*/
NSPR_API(void) PR_CSetOnMonitorRecycle(void (PR_CALLBACK *callback)(void *address));

PR_END_EXTERN_C

#endif /* prcmon_h___ */
