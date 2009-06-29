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

#ifndef nsError_h__
#define nsError_h__

#ifndef nscore_h___
#include "nscore.h"  /* needed for nsresult */
#endif

/*
 * To add error code to your module, you need to do the following:
 *
 * 1) Add a module offset code.  Add yours to the bottom of the list 
 *    right below this comment, adding 1.
 *
 * 2) In your module, define a header file which uses one of the
 *    NE_ERROR_GENERATExxxxxx macros.  Some examples below:
 *
 *    #define NS_ERROR_MYMODULE_MYERROR1 NS_ERROR_GENERATE(NS_ERROR_SEVERITY_ERROR,NS_ERROR_MODULE_MYMODULE,1)
 *    #define NS_ERROR_MYMODULE_MYERROR2 NS_ERROR_GENERATE_SUCCESS(NS_ERROR_MODULE_MYMODULE,2)
 *    #define NS_ERROR_MYMODULE_MYERROR3 NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_MYMODULE,3)
 *
 */


/**
 * @name Standard Module Offset Code. Each Module should identify a unique number
 *       and then all errors associated with that module become offsets from the
 *       base associated with that module id. There are 16 bits of code bits for
 *       each module.
 */

#define NS_ERROR_MODULE_XPCOM      1
#define NS_ERROR_MODULE_BASE       2
#define NS_ERROR_MODULE_GFX        3
#define NS_ERROR_MODULE_WIDGET     4
#define NS_ERROR_MODULE_CALENDAR   5
#define NS_ERROR_MODULE_NETWORK    6
#define NS_ERROR_MODULE_PLUGINS    7
#define NS_ERROR_MODULE_LAYOUT     8
#define NS_ERROR_MODULE_HTMLPARSER 9
#define NS_ERROR_MODULE_RDF        10
#define NS_ERROR_MODULE_UCONV      11
#define NS_ERROR_MODULE_REG        12
#define NS_ERROR_MODULE_FILES      13
#define NS_ERROR_MODULE_DOM        14
#define NS_ERROR_MODULE_IMGLIB     15
#define NS_ERROR_MODULE_MAILNEWS   16
#define NS_ERROR_MODULE_EDITOR     17
#define NS_ERROR_MODULE_XPCONNECT  18
#define NS_ERROR_MODULE_PROFILE    19
#define NS_ERROR_MODULE_LDAP       20
#define NS_ERROR_MODULE_SECURITY   21
#define NS_ERROR_MODULE_DOM_XPATH  22
#define NS_ERROR_MODULE_DOM_RANGE  23
#define NS_ERROR_MODULE_URILOADER  24
#define NS_ERROR_MODULE_CONTENT    25
#define NS_ERROR_MODULE_PYXPCOM    26
#define NS_ERROR_MODULE_XSLT       27
#define NS_ERROR_MODULE_IPC        28
#define NS_ERROR_MODULE_SVG        29
#define NS_ERROR_MODULE_STORAGE    30
#define NS_ERROR_MODULE_SCHEMA     31
#define NS_ERROR_MODULE_DOM_FILE   32

/* NS_ERROR_MODULE_GENERAL should be used by modules that do not
 * care if return code values overlap. Callers of methods that
 * return such codes should be aware that they are not
 * globally unique. Implementors should be careful about blindly
 * returning codes from other modules that might also use
 * the generic base.
 */
#define NS_ERROR_MODULE_GENERAL    51  

/**
 * @name Standard Error Handling Macros
 * @return 0 or 1
 */

#define NS_FAILED(_nsresult) (NS_UNLIKELY((_nsresult) & 0x80000000))
#define NS_SUCCEEDED(_nsresult) (NS_LIKELY(!((_nsresult) & 0x80000000)))

/**
 * @name Severity Code.  This flag identifies the level of warning
 */

#define NS_ERROR_SEVERITY_SUCCESS       0
#define NS_ERROR_SEVERITY_ERROR         1

/**
 * @name Mozilla Code.  This flag separates consumers of mozilla code
 *       from the native platform
 */

#define NS_ERROR_MODULE_BASE_OFFSET 0x45

/**
 * @name Standard Error Generating Macros
 */

#define NS_ERROR_GENERATE(sev,module,code) \
    ((nsresult) (((PRUint32)(sev)<<31) | ((PRUint32)(module+NS_ERROR_MODULE_BASE_OFFSET)<<16) | ((PRUint32)(code))) )

#define NS_ERROR_GENERATE_SUCCESS(module,code) \
    ((nsresult) (((PRUint32)(NS_ERROR_SEVERITY_SUCCESS)<<31) | ((PRUint32)(module+NS_ERROR_MODULE_BASE_OFFSET)<<16) | ((PRUint32)(code))) )

#define NS_ERROR_GENERATE_FAILURE(module,code) \
    ((nsresult) (((PRUint32)(NS_ERROR_SEVERITY_ERROR)<<31) | ((PRUint32)(module+NS_ERROR_MODULE_BASE_OFFSET)<<16) | ((PRUint32)(code))) )

/**
 * @name Standard Macros for retrieving error bits
 */

#define NS_ERROR_GET_CODE(err)     ((err) & 0xffff)
#define NS_ERROR_GET_MODULE(err)   (((((err) >> 16) - NS_ERROR_MODULE_BASE_OFFSET) & 0x1fff))
#define NS_ERROR_GET_SEVERITY(err) (((err) >> 31) & 0x1)

/**
 * @name Standard return values
 */

/*@{*/

/* Standard "it worked" return value */
#define NS_OK                              0

#define NS_ERROR_BASE                      ((nsresult) 0xC1F30000)

/* Returned when an instance is not initialized */
#define NS_ERROR_NOT_INITIALIZED           (NS_ERROR_BASE + 1)

/* Returned when an instance is already initialized */
#define NS_ERROR_ALREADY_INITIALIZED       (NS_ERROR_BASE + 2)

/* Returned by a not implemented function */
#define NS_ERROR_NOT_IMPLEMENTED           ((nsresult) 0x80004001L)

/* Returned when a given interface is not supported. */
#define NS_NOINTERFACE                     ((nsresult) 0x80004002L)
#define NS_ERROR_NO_INTERFACE              NS_NOINTERFACE

#define NS_ERROR_INVALID_POINTER           ((nsresult) 0x80004003L)
#define NS_ERROR_NULL_POINTER              NS_ERROR_INVALID_POINTER

/* Returned when a function aborts */
#define NS_ERROR_ABORT                     ((nsresult) 0x80004004L)

/* Returned when a function fails */
#define NS_ERROR_FAILURE                   ((nsresult) 0x80004005L)

/* Returned when an unexpected error occurs */
#define NS_ERROR_UNEXPECTED                ((nsresult) 0x8000ffffL)

/* Returned when a memory allocation fails */
#define NS_ERROR_OUT_OF_MEMORY             ((nsresult) 0x8007000eL)

/* Returned when an illegal value is passed */
#define NS_ERROR_ILLEGAL_VALUE             ((nsresult) 0x80070057L)
#define NS_ERROR_INVALID_ARG               NS_ERROR_ILLEGAL_VALUE

/* Returned when a class doesn't allow aggregation */
#define NS_ERROR_NO_AGGREGATION            ((nsresult) 0x80040110L)

/* Returned when an operation can't complete due to an unavailable resource */
#define NS_ERROR_NOT_AVAILABLE             ((nsresult) 0x80040111L)

/* Returned when a class is not registered */
#define NS_ERROR_FACTORY_NOT_REGISTERED    ((nsresult) 0x80040154L)

/* Returned when a class cannot be registered, but may be tried again later */
#define NS_ERROR_FACTORY_REGISTER_AGAIN    ((nsresult) 0x80040155L)

/* Returned when a dynamically loaded factory couldn't be found */
#define NS_ERROR_FACTORY_NOT_LOADED        ((nsresult) 0x800401f8L)

/* Returned when a factory doesn't support signatures */
#define NS_ERROR_FACTORY_NO_SIGNATURE_SUPPORT \
                                           (NS_ERROR_BASE + 0x101)

/* Returned when a factory already is registered */
#define NS_ERROR_FACTORY_EXISTS            (NS_ERROR_BASE + 0x100)


/* For COM compatibility reasons, we want to use exact error code numbers
   for NS_ERROR_PROXY_INVALID_IN_PARAMETER and NS_ERROR_PROXY_INVALID_OUT_PARAMETER.
   The first matches:

     #define RPC_E_INVALID_PARAMETER          _HRESULT_TYPEDEF_(0x80010010L)
   
   Errors returning this mean that the xpcom proxy code could not create a proxy for
   one of the in paramaters.

   Because of this, we are ignoring the convention if using a base and offset for
   error numbers.

*/

/* Returned when a proxy could not be create a proxy for one of the IN parameters
   This is returned only when the "real" meathod has NOT been invoked. 
*/

#define NS_ERROR_PROXY_INVALID_IN_PARAMETER        ((nsresult) 0x80010010L)

/* Returned when a proxy could not be create a proxy for one of the OUT parameters
   This is returned only when the "real" meathod has ALREADY been invoked. 
*/

#define NS_ERROR_PROXY_INVALID_OUT_PARAMETER        ((nsresult) 0x80010011L)


/*@}*/

 /* I/O Errors */

 /*  Stream closed */
#define NS_BASE_STREAM_CLOSED         NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_BASE, 2)
 /*  Error from the operating system */
#define NS_BASE_STREAM_OSERROR        NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_BASE, 3)
 /*  Illegal arguments */
#define NS_BASE_STREAM_ILLEGAL_ARGS   NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_BASE, 4)
 /*  For unichar streams */
#define NS_BASE_STREAM_NO_CONVERTER   NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_BASE, 5)
 /*  For unichar streams */
#define NS_BASE_STREAM_BAD_CONVERSION NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_BASE, 6)

#define NS_BASE_STREAM_WOULD_BLOCK    NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_BASE, 7)


#define NS_ERROR_FILE_UNRECOGNIZED_PATH         NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 1)
#define NS_ERROR_FILE_UNRESOLVABLE_SYMLINK      NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 2)
#define NS_ERROR_FILE_EXECUTION_FAILED          NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 3)
#define NS_ERROR_FILE_UNKNOWN_TYPE              NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 4)
#define NS_ERROR_FILE_DESTINATION_NOT_DIR       NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 5)
#define NS_ERROR_FILE_TARGET_DOES_NOT_EXIST     NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 6)
#define NS_ERROR_FILE_COPY_OR_MOVE_FAILED       NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 7)
#define NS_ERROR_FILE_ALREADY_EXISTS            NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 8)
#define NS_ERROR_FILE_INVALID_PATH              NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 9)
#define NS_ERROR_FILE_DISK_FULL                 NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 10)
#define NS_ERROR_FILE_CORRUPTED                 NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 11)
#define NS_ERROR_FILE_NOT_DIRECTORY             NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 12)
#define NS_ERROR_FILE_IS_DIRECTORY              NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 13)
#define NS_ERROR_FILE_IS_LOCKED                 NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 14)
#define NS_ERROR_FILE_TOO_BIG                   NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 15)
#define NS_ERROR_FILE_NO_DEVICE_SPACE           NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 16)
#define NS_ERROR_FILE_NAME_TOO_LONG             NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 17)
#define NS_ERROR_FILE_NOT_FOUND                 NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 18)
#define NS_ERROR_FILE_READ_ONLY                 NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 19)
#define NS_ERROR_FILE_DIR_NOT_EMPTY             NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 20)
#define NS_ERROR_FILE_ACCESS_DENIED             NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_FILES, 21)

#define NS_SUCCESS_FILE_DIRECTORY_EMPTY         NS_ERROR_GENERATE_SUCCESS(NS_ERROR_MODULE_FILES, 1)

 /* Result codes used by nsIDirectoryServiceProvider2 */

#define NS_SUCCESS_AGGREGATE_RESULT             NS_ERROR_GENERATE_SUCCESS(NS_ERROR_MODULE_FILES, 2)

 /* Result codes used by nsIVariant */

#define NS_ERROR_CANNOT_CONVERT_DATA            NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_XPCOM,  1)
#define NS_ERROR_OBJECT_IS_IMMUTABLE            NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_XPCOM,  2)
#define NS_ERROR_LOSS_OF_SIGNIFICANT_DATA       NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_XPCOM,  3)

#define NS_SUCCESS_LOSS_OF_INSIGNIFICANT_DATA   NS_ERROR_GENERATE_SUCCESS(NS_ERROR_MODULE_XPCOM,  1)

/**
 * Various operations are not permitted during XPCOM shutdown and will fail
 * with this exception.
 */
#define NS_ERROR_ILLEGAL_DURING_SHUTDOWN        NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_XPCOM, 30)

 /*
  * This will return the nsresult corresponding to the most recent NSPR failure
  * returned by PR_GetError.
  *
  ***********************************************************************
  *      Do not depend on this function. It will be going away!
  ***********************************************************************
  */
extern NS_COM nsresult
NS_ErrorAccordingToNSPR();


#ifdef _MSC_VER
#pragma warning(disable: 4251) /* 'nsCOMPtr<class nsIInputStream>' needs to have dll-interface to be used by clients of class 'nsInputStream' */
#pragma warning(disable: 4275) /* non dll-interface class 'nsISupports' used as base for dll-interface class 'nsIRDFNode' */
#endif

#endif

