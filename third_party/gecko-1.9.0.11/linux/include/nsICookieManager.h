/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/netwerk/cookie/public/nsICookieManager.idl
 */

#ifndef __gen_nsICookieManager_h__
#define __gen_nsICookieManager_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsISimpleEnumerator_h__
#include "nsISimpleEnumerator.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsICookieManager */
#define NS_ICOOKIEMANAGER_IID_STR "aaab6710-0f2c-11d5-a53b-0010a401eb10"

#define NS_ICOOKIEMANAGER_IID \
  {0xaaab6710, 0x0f2c, 0x11d5, \
    { 0xa5, 0x3b, 0x00, 0x10, 0xa4, 0x01, 0xeb, 0x10 }}

/** 
 * An optional interface for accessing or removing the cookies
 * that are in the cookie list
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsICookieManager : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ICOOKIEMANAGER_IID)

  /**
   * Called to remove all cookies from the cookie list
   */
  /* void removeAll (); */
  NS_SCRIPTABLE NS_IMETHOD RemoveAll(void) = 0;

  /**
   * Called to enumerate through each cookie in the cookie list.
   * The objects enumerated over are of type nsICookie
   */
  /* readonly attribute nsISimpleEnumerator enumerator; */
  NS_SCRIPTABLE NS_IMETHOD GetEnumerator(nsISimpleEnumerator * *aEnumerator) = 0;

  /**
   * Called to remove an individual cookie from the cookie list
   *
   * @param aDomain The host or domain for which the cookie was set
   * @param aName The name specified in the cookie
   * @param aBlocked Indicates if cookies from this host should be permanently blocked
   *
   */
  /* void remove (in AUTF8String aDomain, in ACString aName, in AUTF8String aPath, in boolean aBlocked); */
  NS_SCRIPTABLE NS_IMETHOD Remove(const nsACString & aDomain, const nsACString & aName, const nsACString & aPath, PRBool aBlocked) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsICookieManager, NS_ICOOKIEMANAGER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSICOOKIEMANAGER \
  NS_SCRIPTABLE NS_IMETHOD RemoveAll(void); \
  NS_SCRIPTABLE NS_IMETHOD GetEnumerator(nsISimpleEnumerator * *aEnumerator); \
  NS_SCRIPTABLE NS_IMETHOD Remove(const nsACString & aDomain, const nsACString & aName, const nsACString & aPath, PRBool aBlocked); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSICOOKIEMANAGER(_to) \
  NS_SCRIPTABLE NS_IMETHOD RemoveAll(void) { return _to RemoveAll(); } \
  NS_SCRIPTABLE NS_IMETHOD GetEnumerator(nsISimpleEnumerator * *aEnumerator) { return _to GetEnumerator(aEnumerator); } \
  NS_SCRIPTABLE NS_IMETHOD Remove(const nsACString & aDomain, const nsACString & aName, const nsACString & aPath, PRBool aBlocked) { return _to Remove(aDomain, aName, aPath, aBlocked); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSICOOKIEMANAGER(_to) \
  NS_SCRIPTABLE NS_IMETHOD RemoveAll(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveAll(); } \
  NS_SCRIPTABLE NS_IMETHOD GetEnumerator(nsISimpleEnumerator * *aEnumerator) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEnumerator(aEnumerator); } \
  NS_SCRIPTABLE NS_IMETHOD Remove(const nsACString & aDomain, const nsACString & aName, const nsACString & aPath, PRBool aBlocked) { return !_to ? NS_ERROR_NULL_POINTER : _to->Remove(aDomain, aName, aPath, aBlocked); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsCookieManager : public nsICookieManager
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSICOOKIEMANAGER

  nsCookieManager();

private:
  ~nsCookieManager();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsCookieManager, nsICookieManager)

nsCookieManager::nsCookieManager()
{
  /* member initializers and constructor code */
}

nsCookieManager::~nsCookieManager()
{
  /* destructor code */
}

/* void removeAll (); */
NS_IMETHODIMP nsCookieManager::RemoveAll()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsISimpleEnumerator enumerator; */
NS_IMETHODIMP nsCookieManager::GetEnumerator(nsISimpleEnumerator * *aEnumerator)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void remove (in AUTF8String aDomain, in ACString aName, in AUTF8String aPath, in boolean aBlocked); */
NS_IMETHODIMP nsCookieManager::Remove(const nsACString & aDomain, const nsACString & aName, const nsACString & aPath, PRBool aBlocked)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsICookieManager_h__ */
