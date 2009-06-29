/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * The Original Code is Mozilla Communicator client code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   L. David Baron <dbaron@dbaron.org>
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
#ifndef nsTraceRefcnt_h___
#define nsTraceRefcnt_h___

#include "nsXPCOM.h"

/* By default refcnt logging is not part of the build. */
#undef NS_BUILD_REFCNT_LOGGING

#if (defined(DEBUG) || defined(FORCE_BUILD_REFCNT_LOGGING))
/* Make refcnt logging part of the build. This doesn't mean that
 * actual logging will occur (that requires a separate enable; see
 * nsTraceRefcnt.h for more information).  */
#define NS_BUILD_REFCNT_LOGGING 1
#endif

/* If NO_BUILD_REFCNT_LOGGING is defined then disable refcnt logging
 * in the build. This overrides FORCE_BUILD_REFCNT_LOGGING. */
#if defined(NO_BUILD_REFCNT_LOGGING)
#undef NS_BUILD_REFCNT_LOGGING
#endif

#ifdef NS_BUILD_REFCNT_LOGGING

#define NS_LOG_ADDREF(_p, _rc, _type, _size) \
  NS_LogAddRef((_p), (_rc), (_type), (PRUint32) (_size))

#define NS_LOG_RELEASE(_p, _rc, _type) \
  NS_LogRelease((_p), (_rc), (_type))

#define MOZ_DECL_CTOR_COUNTER(_type)

#define MOZ_COUNT_CTOR(_type)                                 \
PR_BEGIN_MACRO                                                \
  NS_LogCtor((void*)this, #_type, sizeof(*this));             \
PR_END_MACRO

#define MOZ_COUNT_DTOR(_type)                                 \
PR_BEGIN_MACRO                                                \
  NS_LogDtor((void*)this, #_type, sizeof(*this));             \
PR_END_MACRO

/* nsCOMPtr.h allows these macros to be defined by clients
 * These logging functions require dynamic_cast<void*>, so they don't
 * do anything useful if we don't have dynamic_cast<void*>. */
#define NSCAP_LOG_ASSIGNMENT(_c, _p)                                \
  if (_p)                                                           \
    NS_LogCOMPtrAddRef((_c),static_cast<nsISupports*>(_p))

#define NSCAP_LOG_RELEASE(_c, _p)                                   \
  if (_p)                                                           \
    NS_LogCOMPtrRelease((_c), static_cast<nsISupports*>(_p))

#else /* !NS_BUILD_REFCNT_LOGGING */

#define NS_LOG_ADDREF(_p, _rc, _type, _size)
#define NS_LOG_RELEASE(_p, _rc, _type)
#define MOZ_DECL_CTOR_COUNTER(_type)
#define MOZ_COUNT_CTOR(_type)
#define MOZ_COUNT_DTOR(_type)

#endif /* NS_BUILD_REFCNT_LOGGING */

#ifdef __cplusplus

class nsTraceRefcnt {
public:
  inline static void LogAddRef(void* aPtr, nsrefcnt aNewRefCnt,
                               const char* aTypeName, PRUint32 aInstanceSize) {
    NS_LogAddRef(aPtr, aNewRefCnt, aTypeName, aInstanceSize);
  }

  inline static void LogRelease(void* aPtr, nsrefcnt aNewRefCnt,
                                const char* aTypeName) {
    NS_LogRelease(aPtr, aNewRefCnt, aTypeName);
  }

  inline static void LogCtor(void* aPtr, const char* aTypeName,
                             PRUint32 aInstanceSize) {
    NS_LogCtor(aPtr, aTypeName, aInstanceSize);
  }

  inline static void LogDtor(void* aPtr, const char* aTypeName,
                             PRUint32 aInstanceSize) {
    NS_LogDtor(aPtr, aTypeName, aInstanceSize);
  }

  inline static void LogAddCOMPtr(void *aCOMPtr, nsISupports *aObject) {
    NS_LogCOMPtrAddRef(aCOMPtr, aObject);
  }

  inline static void LogReleaseCOMPtr(void *aCOMPtr, nsISupports *aObject) {
    NS_LogCOMPtrRelease(aCOMPtr, aObject);
  }
};

#endif /* defined(__cplusplus) */

#endif /* nsTraceRefcnt_h___ */
