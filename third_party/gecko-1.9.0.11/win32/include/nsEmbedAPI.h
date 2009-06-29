/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is the Mozilla browser.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications, Inc.
 * Portions created by the Initial Developer are Copyright (C) 1999
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Adam Lock <adamlock@netscape.com>
 *   Benjamin Smedberg <benjamin@smedbergs.us>
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

#ifndef NSEMBEDAPI_H
#define NSEMBEDAPI_H

#include "nscore.h"
#include "nsXPCOM.h"
#include "nsILocalFile.h"
#include "nsIDirectoryService.h"

/**
 * @file
 * @brief The Gecko embedding API functions, structures and definitions.
 */

/**
 * Initialises the Gecko embedding layer. You <I>must</I>
 * call this method before proceeding to use Gecko. This function ensures
 * XPCOM is started, creates the component registry if necessary and
 * starts global services.
 *
 * @status FROZEN
 *
 * @note Use <CODE>NS_NewLocalFile</CODE> to create the file object you
 *       supply as the bin directory path in this call. The function
 *       may be safely called before the rest of XPCOM or embedding has
 *       been initialised.
 *
 * @param aMozBinDirectory The Gecko directory containing the component
 *                         registry and runtime libraries;
 *                         or use <CODE>nsnull</CODE> to use the working
 *                         directory.
 * @param aAppFileLocProvider The object to be used by Gecko that specifies
 *                         to Gecko where to find profiles, the component
 *                         registry preferences and so on; or use
 *                         <CODE>nsnull</CODE> for the default behaviour.
 * @param aStaticComponents An array of static components (see NS_InitXPCOM3).
 *                         may be null.
 * @param aStaticComponentCount Number of static components in the
 *                              aStaticComponents array.
 *
 * @see NS_NewLocalFile
 * @see nsILocalFile
 * @see nsIDirectoryServiceProvider
 *
 * @return NS_OK for success;
 *         other error codes indicate a failure during initialisation.
 *
 */
extern "C" NS_HIDDEN NS_METHOD
NS_InitEmbedding(nsILocalFile *aMozBinDirectory,
                 nsIDirectoryServiceProvider *aAppFileLocProvider,
                 nsStaticModuleInfo const *aStaticComponents = nsnull,
                 PRUint32 aStaticComponentCount = 0);


/**
 * Terminates the Gecko embedding layer. Call this function during shutdown to
 * ensure that global services are unloaded, files are closed and
 * XPCOM is shutdown.
 *
 * @status FROZEN
 *
 * @note Release any XPCOM objects within Gecko that you may be holding a
 *       reference to before calling this function.
 *
 * @return NS_OK
 */
extern "C" NS_HIDDEN NS_METHOD
NS_TermEmbedding();

/*---------------------------------------------------------------------------*/
/* Event processing APIs. The native OS dependencies mean you must be        */
/* building on a supported platform to get the functions below.              */
/*---------------------------------------------------------------------------*/

#undef MOZ_SUPPORTS_EMBEDDING_EVENT_PROCESSING

/* Win32 specific stuff */
#if defined (WIN32) || defined (WINCE)
#include "windows.h"
/**
 * @var typedef MSG nsEmbedNativeEvent
 * 
 * Embedding events are native <CODE>MSG</CODE> structs on Win32.
 */
typedef MSG nsEmbedNativeEvent;
#define MOZ_SUPPORTS_EMBEDDING_EVENT_PROCESSING
#endif

/* OS/2 specific stuff */
#ifdef XP_OS2
#include "os2.h"

/**
 * @var typedef MSG nsEmbedNativeEvent
 * 
 * Embedding events are native <CODE>QMSG</CODE> structs on OS/2.
 */
typedef QMSG nsEmbedNativeEvent;
#define MOZ_SUPPORTS_EMBEDDING_EVENT_PROCESSING
#endif

/* Mac specific stuff */
/* TODO implementation left as an exercise for the reader */

/* GTK specific stuff */
/* TODO implementation left as an exercise for the reader */


#ifdef MOZ_SUPPORTS_EMBEDDING_EVENT_PROCESSING

/**
 * @fn nsresult NS_HandleEmbeddingEvent(nsEmbedNativeEvent &aEvent, PRBool &aWasHandled)
 *
 * This function gives Gecko the chance to process a native window events.
 * Call this function from your message processing loop.
 *
 * @status UNDER_REVIEW
 *
 * @param aEvent The native UI event
 * @param aWasHandled Returns with <CODE>PR_TRUE</CODE> if the end was
 *                    handled; in which case it should not be handled by your
 *                    application.
 *
 * @return NS_OK
 */
extern "C" NS_HIDDEN NS_METHOD
NS_HandleEmbeddingEvent(nsEmbedNativeEvent &aEvent, PRBool &aWasHandled);

#endif /* MOZ_SUPPORTS_EMBEDDING_EVENT_PROCESSING */

#endif /* NSEMBEDAPI_H */

