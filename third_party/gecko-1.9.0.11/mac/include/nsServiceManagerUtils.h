/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
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
 * The Original Code is XPCOM.
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

#ifndef nsServiceManagerUtils_h__
#define nsServiceManagerUtils_h__

#include "nsIServiceManager.h"
#include "nsCOMPtr.h"

inline
const nsGetServiceByCID
do_GetService(const nsCID& aCID)
{
    return nsGetServiceByCID(aCID);
}

inline
const nsGetServiceByCIDWithError
do_GetService(const nsCID& aCID, nsresult* error)
{
    return nsGetServiceByCIDWithError(aCID, error);
}

inline
const nsGetServiceByContractID
do_GetService(const char* aContractID)
{
    return nsGetServiceByContractID(aContractID);
}

inline
const nsGetServiceByContractIDWithError
do_GetService( const char* aContractID, nsresult* error)
{
    return nsGetServiceByContractIDWithError(aContractID, error);
}

class nsGetServiceFromCategory : public nsCOMPtr_helper
{
 public:
    nsGetServiceFromCategory(const char* aCategory, const char* aEntry,
                             nsresult* aErrorPtr)
        : mCategory(aCategory),
        mEntry(aEntry),
        mErrorPtr(aErrorPtr)
        {
            // nothing else to do
        }
    
    virtual nsresult NS_FASTCALL operator()( const nsIID&, void** ) const;
 protected:
    const char*                 mCategory;
    const char*                 mEntry;
    nsresult*                   mErrorPtr;
};

inline
const nsGetServiceFromCategory
do_GetServiceFromCategory( const char* category, const char* entry,
                           nsresult* error = 0)
{
    return nsGetServiceFromCategory(category, entry, error);
}

NS_COM_GLUE nsresult
CallGetService(const nsCID &aClass, const nsIID &aIID, void **aResult);

NS_COM_GLUE nsresult
CallGetService(const char *aContractID, const nsIID &aIID, void **aResult);

// type-safe shortcuts for calling |GetService|
template <class DestinationType>
inline
nsresult
CallGetService( const nsCID &aClass,
                DestinationType** aDestination)
{
    NS_PRECONDITION(aDestination, "null parameter");
    
    return CallGetService(aClass,
                          NS_GET_TEMPLATE_IID(DestinationType),
                          reinterpret_cast<void**>(aDestination));
}

template <class DestinationType>
inline
nsresult
CallGetService( const char *aContractID,
                DestinationType** aDestination)
{
    NS_PRECONDITION(aContractID, "null parameter");
    NS_PRECONDITION(aDestination, "null parameter");
    
    return CallGetService(aContractID,
                          NS_GET_TEMPLATE_IID(DestinationType),
                          reinterpret_cast<void**>(aDestination));
}

#endif
