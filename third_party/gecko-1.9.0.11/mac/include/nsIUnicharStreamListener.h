/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/base/public/nsIUnicharStreamListener.idl
 */

#ifndef __gen_nsIUnicharStreamListener_h__
#define __gen_nsIUnicharStreamListener_h__


#ifndef __gen_nsIRequestObserver_h__
#include "nsIRequestObserver.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIUnicharStreamListener */
#define NS_IUNICHARSTREAMLISTENER_IID_STR "4a7e9b62-fef8-400d-9865-d6820f630b4c"

#define NS_IUNICHARSTREAMLISTENER_IID \
  {0x4a7e9b62, 0xfef8, 0x400d, \
    { 0x98, 0x65, 0xd6, 0x82, 0x0f, 0x63, 0x0b, 0x4c }}

/**
 * nsIUnicharStreamListener is very similar to nsIStreamListener with
 * the difference being that this interface gives notifications about
 * data being available after the raw data has been converted to
 * UTF-16.
 *
 * nsIUnicharStreamListener
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIUnicharStreamListener : public nsIRequestObserver {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IUNICHARSTREAMLISTENER_IID)

  /**
     * Called when the next chunk of data (corresponding to the
     * request) is available.
     *
     * @param aRequest request corresponding to the source of the data
     * @param aContext user defined context
     * @param aData the data chunk
     *
     * An exception thrown from onUnicharDataAvailable has the
     * side-effect of causing the request to be canceled.
     */
  /* void onUnicharDataAvailable (in nsIRequest aRequest, in nsISupports aContext, in AString aData); */
  NS_SCRIPTABLE NS_IMETHOD OnUnicharDataAvailable(nsIRequest *aRequest, nsISupports *aContext, const nsAString & aData) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIUnicharStreamListener, NS_IUNICHARSTREAMLISTENER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIUNICHARSTREAMLISTENER \
  NS_SCRIPTABLE NS_IMETHOD OnUnicharDataAvailable(nsIRequest *aRequest, nsISupports *aContext, const nsAString & aData); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIUNICHARSTREAMLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnUnicharDataAvailable(nsIRequest *aRequest, nsISupports *aContext, const nsAString & aData) { return _to OnUnicharDataAvailable(aRequest, aContext, aData); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIUNICHARSTREAMLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnUnicharDataAvailable(nsIRequest *aRequest, nsISupports *aContext, const nsAString & aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnUnicharDataAvailable(aRequest, aContext, aData); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsUnicharStreamListener : public nsIUnicharStreamListener
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIUNICHARSTREAMLISTENER

  nsUnicharStreamListener();

private:
  ~nsUnicharStreamListener();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsUnicharStreamListener, nsIUnicharStreamListener)

nsUnicharStreamListener::nsUnicharStreamListener()
{
  /* member initializers and constructor code */
}

nsUnicharStreamListener::~nsUnicharStreamListener()
{
  /* destructor code */
}

/* void onUnicharDataAvailable (in nsIRequest aRequest, in nsISupports aContext, in AString aData); */
NS_IMETHODIMP nsUnicharStreamListener::OnUnicharDataAvailable(nsIRequest *aRequest, nsISupports *aContext, const nsAString & aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIUnicharStreamListener_h__ */
