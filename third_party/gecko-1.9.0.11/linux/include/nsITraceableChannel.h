/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/netwerk/base/public/nsITraceableChannel.idl
 */

#ifndef __gen_nsITraceableChannel_h__
#define __gen_nsITraceableChannel_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIStreamListener; /* forward declaration */


/* starting interface:    nsITraceableChannel */
#define NS_ITRACEABLECHANNEL_IID_STR "68167b0b-ef34-4d79-a09a-8045f7c5140e"

#define NS_ITRACEABLECHANNEL_IID \
  {0x68167b0b, 0xef34, 0x4d79, \
    { 0xa0, 0x9a, 0x80, 0x45, 0xf7, 0xc5, 0x14, 0x0e }}

/**
 * A channel implementing this interface allows one to intercept its data by
 * inserting intermediate stream listeners.
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsITraceableChannel : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ITRACEABLECHANNEL_IID)

  /* nsIStreamListener setNewListener (in nsIStreamListener aListener); */
  NS_SCRIPTABLE NS_IMETHOD SetNewListener(nsIStreamListener *aListener, nsIStreamListener **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsITraceableChannel, NS_ITRACEABLECHANNEL_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSITRACEABLECHANNEL \
  NS_SCRIPTABLE NS_IMETHOD SetNewListener(nsIStreamListener *aListener, nsIStreamListener **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSITRACEABLECHANNEL(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetNewListener(nsIStreamListener *aListener, nsIStreamListener **_retval) { return _to SetNewListener(aListener, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSITRACEABLECHANNEL(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetNewListener(nsIStreamListener *aListener, nsIStreamListener **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNewListener(aListener, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsTraceableChannel : public nsITraceableChannel
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSITRACEABLECHANNEL

  nsTraceableChannel();

private:
  ~nsTraceableChannel();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsTraceableChannel, nsITraceableChannel)

nsTraceableChannel::nsTraceableChannel()
{
  /* member initializers and constructor code */
}

nsTraceableChannel::~nsTraceableChannel()
{
  /* destructor code */
}

/* nsIStreamListener setNewListener (in nsIStreamListener aListener); */
NS_IMETHODIMP nsTraceableChannel::SetNewListener(nsIStreamListener *aListener, nsIStreamListener **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsITraceableChannel_h__ */
