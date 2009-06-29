/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is mozilla.org.
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Johnny Stenback <jst@mozilla.org>
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

#ifndef __nsParserDataListener_h__
#define __nsParserDataListener_h__

/*
 * Include this header if you're implementing a parser data
 * listener. To make a component a parser data listener you'll need to
 * make your component implement the interface
 * nsIUnicharStreamListener. That interface has three methods (one +
 * two inherited ones, not counting what's defined in
 * nsISupports). The methods are:
 *
 *  void onStartRequest(in nsIRequest aRequest,
 *                      in nsISupports aContext);
 *  void onUnicharDataAvailable(in nsIRequest aRequest,
 *                              in nsISupports aContext, in AString aData);
 *  void onStopRequest(in nsIRequest aRequest,
 *                     in nsISupports aContext,
 *                     in nsresult aStatusCode);
 *
 * All those methods are called for every network request that ends up
 * feeding data to the parser. The method are called in the order
 * shown above, first one call to onStartRequest(), then one call to
 * onUnicharDataAvailable() per chunk of data received and converted
 * to UTF-16, and finally one call to onStopRequest().
 *
 * The nsIRequest passed into these methods will be the same object
 * for all these calls for a given network request. If the request
 * pointer is used to uniquely identify an ongoing request, the
 * pointer should be QueryInterface()'d to nsISupports to ensure that
 * the pointer used is the identity pointer to the object.
 *
 * The context argument passed to these methods will be the document
 * (nsIDOMDocument) parsed from the stream, or null when not
 * available.
 *
 * Any errors returned from any of these calls will end up canceling
 * the stream, and the data that is passed to the call in question
 * will *not* be seen by the parser. So unless you intend to interrupt
 * a request, *make sure* that you return NS_OK from these methods!
 */

#include "nsIUnicharStreamListener.h"

/*
 * To register a component to be a parser data listener the
 * component's contract id should be registered with the category
 * manager (nsICategoryManager), with the category
 * PARSER_DATA_LISTENER_CATEGORY, defined here.
 *
 * @status FROZEN
 */
#define PARSER_DATA_LISTENER_CATEGORY "Parser data listener"

#endif // __nsParserDataListener_h__
