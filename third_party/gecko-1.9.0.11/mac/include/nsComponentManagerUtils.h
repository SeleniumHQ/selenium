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
 * The Original Code is mozilla.org Code.
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

#ifndef nsComponentManagerUtils_h__
#define nsComponentManagerUtils_h__

#ifndef nscore_h__
#include "nscore.h"
#endif

#ifndef nsCOMPtr_h__
#include "nsCOMPtr.h"
#endif

#include "nsIFactory.h"


NS_COM_GLUE nsresult
CallCreateInstance
  (const nsCID &aClass, nsISupports *aDelegate, const nsIID &aIID,
   void **aResult);

NS_COM_GLUE nsresult
CallCreateInstance
  (const char *aContractID, nsISupports *aDelegate, const nsIID &aIID,
   void **aResult);

NS_COM_GLUE nsresult
CallGetClassObject
  (const nsCID &aClass, const nsIID &aIID, void **aResult);

NS_COM_GLUE nsresult
CallGetClassObject
  (const char *aContractID, const nsIID &aIID, void **aResult);


class NS_COM_GLUE nsCreateInstanceByCID : public nsCOMPtr_helper
{
public:
    nsCreateInstanceByCID( const nsCID& aCID, nsISupports* aOuter, nsresult* aErrorPtr )
        : mCID(aCID),
          mOuter(aOuter),
          mErrorPtr(aErrorPtr)
    {
        // nothing else to do here
    }
    
    virtual nsresult NS_FASTCALL operator()( const nsIID&, void** ) const;
    
private:
    const nsCID&    mCID;
    nsISupports*    mOuter;
    nsresult*       mErrorPtr;
};

class NS_COM_GLUE nsCreateInstanceByContractID : public nsCOMPtr_helper
{
public:
    nsCreateInstanceByContractID( const char* aContractID, nsISupports* aOuter, nsresult* aErrorPtr )
        : mContractID(aContractID),
          mOuter(aOuter),
          mErrorPtr(aErrorPtr)
    {
        // nothing else to do here
    }
    
    virtual nsresult NS_FASTCALL operator()( const nsIID&, void** ) const;
    
private:
    const char*   mContractID;
    nsISupports*  mOuter;
    nsresult*     mErrorPtr;
};

class NS_COM_GLUE nsCreateInstanceFromFactory : public nsCOMPtr_helper
{
public:
    nsCreateInstanceFromFactory( nsIFactory* aFactory, nsISupports* aOuter, nsresult* aErrorPtr )
        : mFactory(aFactory),
          mOuter(aOuter),
          mErrorPtr(aErrorPtr)
    {
        // nothing else to do here
    }
    
    virtual nsresult NS_FASTCALL operator()( const nsIID&, void** ) const;
    
private:
    nsIFactory*   mFactory;
    nsISupports*  mOuter;
    nsresult*     mErrorPtr;
};


inline
const nsCreateInstanceByCID
do_CreateInstance( const nsCID& aCID, nsresult* error = 0 )
{
    return nsCreateInstanceByCID(aCID, 0, error);
}

inline
const nsCreateInstanceByCID
do_CreateInstance( const nsCID& aCID, nsISupports* aOuter, nsresult* error = 0 )
{
    return nsCreateInstanceByCID(aCID, aOuter, error);
}

inline
const nsCreateInstanceByContractID
do_CreateInstance( const char* aContractID, nsresult* error = 0 )
{
    return nsCreateInstanceByContractID(aContractID, 0, error);
}

inline
const nsCreateInstanceByContractID
do_CreateInstance( const char* aContractID, nsISupports* aOuter, nsresult* error = 0 )
{
    return nsCreateInstanceByContractID(aContractID, aOuter, error);
}

inline
const nsCreateInstanceFromFactory
do_CreateInstance( nsIFactory* aFactory, nsresult* error = 0 )
{
    return nsCreateInstanceFromFactory(aFactory, 0, error);
}

inline
const nsCreateInstanceFromFactory
do_CreateInstance( nsIFactory* aFactory, nsISupports* aOuter, nsresult* error = 0 )
{
    return nsCreateInstanceFromFactory(aFactory, aOuter, error);
}


class NS_COM_GLUE nsGetClassObjectByCID : public nsCOMPtr_helper
{
public:
    nsGetClassObjectByCID( const nsCID& aCID, nsresult* aErrorPtr )
        : mCID(aCID),
          mErrorPtr(aErrorPtr)
    {
        // nothing else to do here
    }
    
    virtual nsresult NS_FASTCALL operator()( const nsIID&, void** ) const;
    
private:
    const nsCID&    mCID;
    nsresult*       mErrorPtr;
};

class NS_COM_GLUE nsGetClassObjectByContractID : public nsCOMPtr_helper
{
public:
    nsGetClassObjectByContractID( const char* aContractID, nsresult* aErrorPtr )
        : mContractID(aContractID),
          mErrorPtr(aErrorPtr)
    {
        // nothing else to do here
    }
    
    virtual nsresult NS_FASTCALL operator()( const nsIID&, void** ) const;
    
private:
    const char*   mContractID;
    nsresult*     mErrorPtr;
};

/**
 * do_GetClassObject can be used to improve performance of callers 
 * that call |CreateInstance| many times.  They can cache the factory
 * and call do_CreateInstance or CallCreateInstance with the cached
 * factory rather than having the component manager retrieve it every
 * time.
 */
inline const nsGetClassObjectByCID
do_GetClassObject( const nsCID& aCID, nsresult* error = 0 )
{
    return nsGetClassObjectByCID(aCID, error);
}

inline const nsGetClassObjectByContractID
do_GetClassObject( const char* aContractID, nsresult* error = 0 )
{
    return nsGetClassObjectByContractID(aContractID, error);
}

// type-safe shortcuts for calling |CreateInstance|
template <class DestinationType>
inline
nsresult
CallCreateInstance( const nsCID &aClass,
                    nsISupports *aDelegate,
                    DestinationType** aDestination )
{
    NS_PRECONDITION(aDestination, "null parameter");
    
    return CallCreateInstance(aClass, aDelegate,
                              NS_GET_TEMPLATE_IID(DestinationType),
                              reinterpret_cast<void**>(aDestination));
}

template <class DestinationType>
inline
nsresult
CallCreateInstance( const nsCID &aClass,
                    DestinationType** aDestination )
{
    NS_PRECONDITION(aDestination, "null parameter");
    
    return CallCreateInstance(aClass, nsnull,
                              NS_GET_TEMPLATE_IID(DestinationType),
                              reinterpret_cast<void**>(aDestination));
}

template <class DestinationType>
inline
nsresult
CallCreateInstance( const char *aContractID,
                    nsISupports *aDelegate,
                    DestinationType** aDestination )
{
    NS_PRECONDITION(aContractID, "null parameter");
    NS_PRECONDITION(aDestination, "null parameter");
    
    return CallCreateInstance(aContractID, 
                              aDelegate,
                              NS_GET_TEMPLATE_IID(DestinationType),
                              reinterpret_cast<void**>(aDestination));
}

template <class DestinationType>
inline
nsresult
CallCreateInstance( const char *aContractID,
                    DestinationType** aDestination )
{
    NS_PRECONDITION(aContractID, "null parameter");
    NS_PRECONDITION(aDestination, "null parameter");
    
    return CallCreateInstance(aContractID, nsnull,
                              NS_GET_TEMPLATE_IID(DestinationType),
                              reinterpret_cast<void**>(aDestination));
}

template <class DestinationType>
inline
nsresult
CallCreateInstance( nsIFactory *aFactory,
                    nsISupports *aDelegate,
                    DestinationType** aDestination )
{
    NS_PRECONDITION(aFactory, "null parameter");
    NS_PRECONDITION(aDestination, "null parameter");
    
    return aFactory->CreateInstance(aDelegate,
                                    NS_GET_TEMPLATE_IID(DestinationType),
                                    reinterpret_cast<void**>(aDestination));
}

template <class DestinationType>
inline
nsresult
CallCreateInstance( nsIFactory *aFactory,
                    DestinationType** aDestination )
{
    NS_PRECONDITION(aFactory, "null parameter");
    NS_PRECONDITION(aDestination, "null parameter");
    
    return aFactory->CreateInstance(nsnull,
                                    NS_GET_TEMPLATE_IID(DestinationType),
                                    reinterpret_cast<void**>(aDestination));
}

template <class DestinationType>
inline
nsresult
CallGetClassObject( const nsCID &aClass,
                    DestinationType** aDestination )
{
    NS_PRECONDITION(aDestination, "null parameter");
    
    return CallGetClassObject(aClass,
        NS_GET_TEMPLATE_IID(DestinationType), reinterpret_cast<void**>(aDestination));
}

template <class DestinationType>
inline
nsresult
CallGetClassObject( const char* aContractID,
                    DestinationType** aDestination )
{
    NS_PRECONDITION(aDestination, "null parameter");
    
    return CallGetClassObject(aContractID,
        NS_GET_TEMPLATE_IID(DestinationType), reinterpret_cast<void**>(aDestination));
}

#endif /* nsComponentManagerUtils_h__ */
