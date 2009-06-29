/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/base/public/nsIStreamListener.idl
 */

#ifndef __gen_nsIStreamListener_h__
#define __gen_nsIStreamListener_h__


#ifndef __gen_nsIRequestObserver_h__
#include "nsIRequestObserver.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIInputStream; /* forward declaration */


/* starting interface:    nsIStreamListener */
#define NS_ISTREAMLISTENER_IID_STR "1a637020-1482-11d3-9333-00104ba0fd40"

#define NS_ISTREAMLISTENER_IID \
  {0x1a637020, 0x1482, 0x11d3, \
    { 0x93, 0x33, 0x00, 0x10, 0x4b, 0xa0, 0xfd, 0x40 }}

/**
 * nsIStreamListener
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIStreamListener : public nsIRequestObserver {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISTREAMLISTENER_IID)

  /**
     * Called when the next chunk of data (corresponding to the request) may
     * be read without blocking the calling thread.  The onDataAvailable impl
     * must read exactly |aCount| bytes of data before returning.
     *
     * @param aRequest request corresponding to the source of the data
     * @param aContext user defined context
     * @param aInputStream input stream containing the data chunk
     * @param aOffset
     *        Number of bytes that were sent in previous onDataAvailable calls
     *        for this request. In other words, the sum of all previous count
     *        parameters.
     *        If that number is greater than or equal to 2^32, this parameter
     *        will be PR_UINT32_MAX (2^32 - 1).
     * @param aCount number of bytes available in the stream
     *
     * NOTE: The aInputStream parameter must implement readSegments.
     *
     * An exception thrown from onDataAvailable has the side-effect of
     * causing the request to be canceled.
     */
  /* void onDataAvailable (in nsIRequest aRequest, in nsISupports aContext, in nsIInputStream aInputStream, in unsigned long aOffset, in unsigned long aCount); */
  NS_SCRIPTABLE NS_IMETHOD OnDataAvailable(nsIRequest *aRequest, nsISupports *aContext, nsIInputStream *aInputStream, PRUint32 aOffset, PRUint32 aCount) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIStreamListener, NS_ISTREAMLISTENER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISTREAMLISTENER \
  NS_SCRIPTABLE NS_IMETHOD OnDataAvailable(nsIRequest *aRequest, nsISupports *aContext, nsIInputStream *aInputStream, PRUint32 aOffset, PRUint32 aCount); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISTREAMLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnDataAvailable(nsIRequest *aRequest, nsISupports *aContext, nsIInputStream *aInputStream, PRUint32 aOffset, PRUint32 aCount) { return _to OnDataAvailable(aRequest, aContext, aInputStream, aOffset, aCount); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISTREAMLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnDataAvailable(nsIRequest *aRequest, nsISupports *aContext, nsIInputStream *aInputStream, PRUint32 aOffset, PRUint32 aCount) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnDataAvailable(aRequest, aContext, aInputStream, aOffset, aCount); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsStreamListener : public nsIStreamListener
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISTREAMLISTENER

  nsStreamListener();

private:
  ~nsStreamListener();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsStreamListener, nsIStreamListener)

nsStreamListener::nsStreamListener()
{
  /* member initializers and constructor code */
}

nsStreamListener::~nsStreamListener()
{
  /* destructor code */
}

/* void onDataAvailable (in nsIRequest aRequest, in nsISupports aContext, in nsIInputStream aInputStream, in unsigned long aOffset, in unsigned long aCount); */
NS_IMETHODIMP nsStreamListener::OnDataAvailable(nsIRequest *aRequest, nsISupports *aContext, nsIInputStream *aInputStream, PRUint32 aOffset, PRUint32 aCount)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIStreamListener_h__ */
