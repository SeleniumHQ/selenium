/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
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
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

#ifndef nsXPCOMCID_h__
#define nsXPCOMCID_h__

/**
 * XPCOM Directory Service Contract ID
 *   The directory service provides ways to obtain file system locations. The 
 *   directory service is a singleton.
 *
 *   This contract supports the nsIDirectoryService and the nsIProperties
 *   interfaces.
 *
 */
#define NS_DIRECTORY_SERVICE_CONTRACTID "@mozilla.org/file/directory_service;1"

/**
 * XPCOM File
 *   The file abstraction provides ways to obtain and access files and 
 *   directories located on the local system. 
 *
 *   This contract supports the nsIFile interface and the nsILocalFile interface.
 *   This contract may also support platform specific interfaces such as 
 *   nsILocalFileMac on platforms where additional interfaces are required.
 *
 */
#define NS_LOCAL_FILE_CONTRACTID "@mozilla.org/file/local;1"

/**
 * XPCOM Category Manager Contract ID
 *   The contract supports the nsICategoryManager interface. The 
 *   category manager is a singleton.
 * The "enumerateCategory" method of nsICategoryManager will return an object
 * that implements nsIUTF8StringEnumerator. In addition, the enumerator will
 * return the entries in sorted order (sorted by byte comparison).
 */
#define NS_CATEGORYMANAGER_CONTRACTID   "@mozilla.org/categorymanager;1"

/**
 * XPCOM Properties Object Contract ID
 *   Simple mapping object which supports the nsIProperties interface.
 */
#define NS_PROPERTIES_CONTRACTID "@mozilla.org/properties;1"

/**
 * XPCOM Array Object ContractID
 * Simple array implementation which supports the nsIArray and
 * nsIMutableArray interfaces.
 */
#define NS_ARRAY_CONTRACTID  "@mozilla.org/array;1"

/**
 * Observer Service ContractID
 * The observer service implements the global nsIObserverService object.
 * It should be used from the main thread only.
 */
#define NS_OBSERVERSERVICE_CONTRACTID "@mozilla.org/observer-service;1"

/**
 * The following are the CIDs and Contract IDs of the nsISupports wrappers for 
 * primative types.  
 */
#define NS_SUPPORTS_ID_CID \
{ 0xacf8dc40, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_ID_CONTRACTID "@mozilla.org/supports-id;1"

#define NS_SUPPORTS_CSTRING_CID \
{ 0xacf8dc41, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_CSTRING_CONTRACTID "@mozilla.org/supports-cstring;1"

#define NS_SUPPORTS_STRING_CID \
{ 0xacf8dc42, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_STRING_CONTRACTID "@mozilla.org/supports-string;1"

#define NS_SUPPORTS_PRBOOL_CID \
{ 0xacf8dc43, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_PRBOOL_CONTRACTID "@mozilla.org/supports-PRBool;1"

#define NS_SUPPORTS_PRUINT8_CID \
{ 0xacf8dc44, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_PRUINT8_CONTRACTID "@mozilla.org/supports-PRUint8;1"

#define NS_SUPPORTS_PRUINT16_CID \
{ 0xacf8dc46, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_PRUINT16_CONTRACTID "@mozilla.org/supports-PRUint16;1"

#define NS_SUPPORTS_PRUINT32_CID \
{ 0xacf8dc47, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_PRUINT32_CONTRACTID "@mozilla.org/supports-PRUint32;1"

#define NS_SUPPORTS_PRUINT64_CID \
{ 0xacf8dc48, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_PRUINT64_CONTRACTID "@mozilla.org/supports-PRUint64;1"

#define NS_SUPPORTS_PRTIME_CID \
{ 0xacf8dc49, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_PRTIME_CONTRACTID "@mozilla.org/supports-PRTime;1"

#define NS_SUPPORTS_CHAR_CID \
{ 0xacf8dc4a, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_CHAR_CONTRACTID "@mozilla.org/supports-char;1"

#define NS_SUPPORTS_PRINT16_CID \
{ 0xacf8dc4b, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_PRINT16_CONTRACTID "@mozilla.org/supports-PRInt16;1"

#define NS_SUPPORTS_PRINT32_CID \
{ 0xacf8dc4c, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_PRINT32_CONTRACTID "@mozilla.org/supports-PRInt32;1"

#define NS_SUPPORTS_PRINT64_CID \
{ 0xacf8dc4d, 0x4a25, 0x11d3, \
{ 0x98, 0x90, 0x0, 0x60, 0x8, 0x96, 0x24, 0x22 } }
#define NS_SUPPORTS_PRINT64_CONTRACTID "@mozilla.org/supports-PRInt64;1"

#define NS_SUPPORTS_FLOAT_CID \
{ 0xcbf86870, 0x4ac0, 0x11d3, \
{ 0xba, 0xea, 0x0, 0x80, 0x5f, 0x8a, 0x5d, 0xd7 } }
#define NS_SUPPORTS_FLOAT_CONTRACTID "@mozilla.org/supports-float;1"

#define NS_SUPPORTS_DOUBLE_CID \
{ 0xcbf86871, 0x4ac0, 0x11d3, \
{ 0xba, 0xea, 0x0, 0x80, 0x5f, 0x8a, 0x5d, 0xd7 } }
#define NS_SUPPORTS_DOUBLE_CONTRACTID "@mozilla.org/supports-double;1"

#define NS_SUPPORTS_VOID_CID \
{ 0xaf10f3e0, 0x568d, 0x11d3, \
{ 0xba, 0xf8, 0x0, 0x80, 0x5f, 0x8a, 0x5d, 0xd7 } }
#define NS_SUPPORTS_VOID_CONTRACTID "@mozilla.org/supports-void;1"

#define NS_SUPPORTS_INTERFACE_POINTER_CID \
{ 0xA99FEBBA, 0x1DD1, 0x11B2, \
{ 0xA9, 0x43, 0xB0, 0x23, 0x34, 0xA6, 0xD0, 0x83 } }
#define NS_SUPPORTS_INTERFACE_POINTER_CONTRACTID "@mozilla.org/supports-interface-pointer;1"

#endif
