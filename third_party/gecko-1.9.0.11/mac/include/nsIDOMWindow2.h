/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/base/nsIDOMWindow2.idl
 */

#ifndef __gen_nsIDOMWindow2_h__
#define __gen_nsIDOMWindow2_h__


#ifndef __gen_nsIDOMWindow_h__
#include "nsIDOMWindow.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIDOMOfflineResourceList; /* forward declaration */


/* starting interface:    nsIDOMWindow2 */
#define NS_IDOMWINDOW2_IID_STR "73c5fa35-3add-4c87-a303-a850ccf4d65a"

#define NS_IDOMWINDOW2_IID \
  {0x73c5fa35, 0x3add, 0x4c87, \
    { 0xa3, 0x03, 0xa8, 0x50, 0xcc, 0xf4, 0xd6, 0x5a }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMWindow2 : public nsIDOMWindow {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMWINDOW2_IID)

  /**
   * Get the window root for this window. This is useful for hooking
   * up event listeners to this window and every other window nested
   * in the window root.
   */
  /* [noscript] readonly attribute nsIDOMEventTarget windowRoot; */
  NS_IMETHOD GetWindowRoot(nsIDOMEventTarget * *aWindowRoot) = 0;

  /**
   * Get the application cache object for this window.
   */
  /* readonly attribute nsIDOMOfflineResourceList applicationCache; */
  NS_SCRIPTABLE NS_IMETHOD GetApplicationCache(nsIDOMOfflineResourceList * *aApplicationCache) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMWindow2, NS_IDOMWINDOW2_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMWINDOW2 \
  NS_IMETHOD GetWindowRoot(nsIDOMEventTarget * *aWindowRoot); \
  NS_SCRIPTABLE NS_IMETHOD GetApplicationCache(nsIDOMOfflineResourceList * *aApplicationCache); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMWINDOW2(_to) \
  NS_IMETHOD GetWindowRoot(nsIDOMEventTarget * *aWindowRoot) { return _to GetWindowRoot(aWindowRoot); } \
  NS_SCRIPTABLE NS_IMETHOD GetApplicationCache(nsIDOMOfflineResourceList * *aApplicationCache) { return _to GetApplicationCache(aApplicationCache); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMWINDOW2(_to) \
  NS_IMETHOD GetWindowRoot(nsIDOMEventTarget * *aWindowRoot) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWindowRoot(aWindowRoot); } \
  NS_SCRIPTABLE NS_IMETHOD GetApplicationCache(nsIDOMOfflineResourceList * *aApplicationCache) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetApplicationCache(aApplicationCache); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMWindow2 : public nsIDOMWindow2
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMWINDOW2

  nsDOMWindow2();

private:
  ~nsDOMWindow2();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMWindow2, nsIDOMWindow2)

nsDOMWindow2::nsDOMWindow2()
{
  /* member initializers and constructor code */
}

nsDOMWindow2::~nsDOMWindow2()
{
  /* destructor code */
}

/* [noscript] readonly attribute nsIDOMEventTarget windowRoot; */
NS_IMETHODIMP nsDOMWindow2::GetWindowRoot(nsIDOMEventTarget * *aWindowRoot)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMOfflineResourceList applicationCache; */
NS_IMETHODIMP nsDOMWindow2::GetApplicationCache(nsIDOMOfflineResourceList * *aApplicationCache)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMWindow2_h__ */
