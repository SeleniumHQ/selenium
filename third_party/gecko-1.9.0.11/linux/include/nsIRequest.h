/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/netwerk/base/public/nsIRequest.idl
 */

#ifndef __gen_nsIRequest_h__
#define __gen_nsIRequest_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsILoadGroup; /* forward declaration */

typedef PRUint32 nsLoadFlags;


/* starting interface:    nsIRequest */
#define NS_IREQUEST_IID_STR "ef6bfbd2-fd46-48d8-96b7-9f8f0fd387fe"

#define NS_IREQUEST_IID \
  {0xef6bfbd2, 0xfd46, 0x48d8, \
    { 0x96, 0xb7, 0x9f, 0x8f, 0x0f, 0xd3, 0x87, 0xfe }}

/**
 * nsIRequest
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIRequest : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IREQUEST_IID)

  /**
     * The name of the request.  Often this is the URI of the request.
     */
  /* readonly attribute AUTF8String name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsACString & aName) = 0;

  /**
     * Indicates whether the request is pending. nsIRequest::isPending is
     * true when there is an outstanding asynchronous event that will make
     * the request no longer be pending.  Requests do not necessarily start
     * out pending; in some cases, requests have to be explicitly initiated
     * (e.g. nsIChannel implementations are only pending once asyncOpen
     * returns successfully).
     *
     * Requests can become pending multiple times during their lifetime.
     *
     * @return TRUE if the request has yet to reach completion.
     * @return FALSE if the request has reached completion (e.g., after
     *   OnStopRequest has fired).
     * @note Suspended requests are still considered pending.
     */
  /* boolean isPending (); */
  NS_SCRIPTABLE NS_IMETHOD IsPending(PRBool *_retval) = 0;

  /**
     * The error status associated with the request.
     */
  /* readonly attribute nsresult status; */
  NS_SCRIPTABLE NS_IMETHOD GetStatus(nsresult *aStatus) = 0;

  /**
     * Cancels the current request.  This will close any open input or
     * output streams and terminate any async requests.  Users should 
     * normally pass NS_BINDING_ABORTED, although other errors may also
     * be passed.  The error passed in will become the value of the 
     * status attribute.
     *
     * Implementations must not send any notifications (e.g. via
     * nsIRequestObserver) synchronously from this function. Similarly,
     * removal from the load group (if any) must also happen asynchronously.
     *
     * Requests that use nsIStreamListener must not call onDataAvailable
     * anymore after cancel has been called.
     *
     * @param aStatus the reason for canceling this request.
     *
     * NOTE: most nsIRequest implementations expect aStatus to be a
     * failure code; however, some implementations may allow aStatus to
     * be a success code such as NS_OK.  In general, aStatus should be
     * a failure code.
     */
  /* void cancel (in nsresult aStatus); */
  NS_SCRIPTABLE NS_IMETHOD Cancel(nsresult aStatus) = 0;

  /**
     * Suspends the current request.  This may have the effect of closing
     * any underlying transport (in order to free up resources), although
     * any open streams remain logically opened and will continue delivering
     * data when the transport is resumed.
     *
     * Calling cancel() on a suspended request must not send any
     * notifications (such as onstopRequest) until the request is resumed.
     *
     * NOTE: some implementations are unable to immediately suspend, and
     * may continue to deliver events already posted to an event queue. In
     * general, callers should be capable of handling events even after 
     * suspending a request.
     */
  /* void suspend (); */
  NS_SCRIPTABLE NS_IMETHOD Suspend(void) = 0;

  /**
     * Resumes the current request.  This may have the effect of re-opening
     * any underlying transport and will resume the delivery of data to 
     * any open streams.
     */
  /* void resume (); */
  NS_SCRIPTABLE NS_IMETHOD Resume(void) = 0;

  /**
     * The load group of this request.  While pending, the request is a 
     * member of the load group.  It is the responsibility of the request
     * to implement this policy.
     */
  /* attribute nsILoadGroup loadGroup; */
  NS_SCRIPTABLE NS_IMETHOD GetLoadGroup(nsILoadGroup * *aLoadGroup) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLoadGroup(nsILoadGroup * aLoadGroup) = 0;

  /**
     * The load flags of this request.  Bits 0-15 are reserved.
     *
     * When added to a load group, this request's load flags are merged with
     * the load flags of the load group.
     */
  /* attribute nsLoadFlags loadFlags; */
  NS_SCRIPTABLE NS_IMETHOD GetLoadFlags(nsLoadFlags *aLoadFlags) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLoadFlags(nsLoadFlags aLoadFlags) = 0;

  /**************************************************************************
     * Listed below are the various load flags which may be or'd together.
     */
/**
     * No special load flags:
     */
  enum { LOAD_NORMAL = 0U };

  /** 
     * Don't deliver status notifications to the nsIProgressEventSink, or keep 
     * this load from completing the nsILoadGroup it may belong to.
     */
  enum { LOAD_BACKGROUND = 1U };

  /**************************************************************************
     * The following flags control the flow of data into the cache.
     */
/**
     * This flag prevents caching of any kind.  It does not, however, prevent
     * cached content from being used to satisfy this request.
     */
  enum { INHIBIT_CACHING = 128U };

  /**
     * This flag prevents caching on disk (or other persistent media), which
     * may be needed to preserve privacy.  For HTTPS, this flag is set auto-
     * matically.
     */
  enum { INHIBIT_PERSISTENT_CACHING = 256U };

  /**************************************************************************
     * The following flags control what happens when the cache contains data
     * that could perhaps satisfy this request.  They are listed in descending
     * order of precidence.
     */
/**
     * Force an end-to-end download of content data from the origin server.
     * This flag is used for a shift-reload.
     */
  enum { LOAD_BYPASS_CACHE = 512U };

  /**
     * Load from the cache, bypassing protocol specific validation logic.  This
     * flag is used when browsing via history.  It is not recommended for normal
     * browsing as it may likely violate reasonable assumptions made by the 
     * server and confuse users.
     */
  enum { LOAD_FROM_CACHE = 1024U };

  /**
     * The following flags control the frequency of cached content validation
     * when neither LOAD_BYPASS_CACHE or LOAD_FROM_CACHE are set.  By default,
     * cached content is automatically validated if necessary before reuse.
     * 
     * VALIDATE_ALWAYS forces validation of any cached content independent of
     * its expiration time.
     * 
     * VALIDATE_NEVER disables validation of expired content.
     *
     * VALIDATE_ONCE_PER_SESSION disables validation of expired content, 
     * provided it has already been validated (at least once) since the start 
     * of this session.
     *
     * NOTE TO IMPLEMENTORS:
     *   These flags are intended for normal browsing, and they should therefore
     *   not apply to content that must be validated before each use.  Consider,
     *   for example, a HTTP response with a "Cache-control: no-cache" header.
     *   According to RFC2616, this response must be validated before it can
     *   be taken from a cache.  Breaking this requirement could result in 
     *   incorrect and potentially undesirable side-effects.
     */
  enum { VALIDATE_ALWAYS = 2048U };

  enum { VALIDATE_NEVER = 4096U };

  enum { VALIDATE_ONCE_PER_SESSION = 8192U };

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIRequest, NS_IREQUEST_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIREQUEST \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsACString & aName); \
  NS_SCRIPTABLE NS_IMETHOD IsPending(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetStatus(nsresult *aStatus); \
  NS_SCRIPTABLE NS_IMETHOD Cancel(nsresult aStatus); \
  NS_SCRIPTABLE NS_IMETHOD Suspend(void); \
  NS_SCRIPTABLE NS_IMETHOD Resume(void); \
  NS_SCRIPTABLE NS_IMETHOD GetLoadGroup(nsILoadGroup * *aLoadGroup); \
  NS_SCRIPTABLE NS_IMETHOD SetLoadGroup(nsILoadGroup * aLoadGroup); \
  NS_SCRIPTABLE NS_IMETHOD GetLoadFlags(nsLoadFlags *aLoadFlags); \
  NS_SCRIPTABLE NS_IMETHOD SetLoadFlags(nsLoadFlags aLoadFlags); \

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIREQUEST(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsACString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD IsPending(PRBool *_retval) { return _to IsPending(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetStatus(nsresult *aStatus) { return _to GetStatus(aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD Cancel(nsresult aStatus) { return _to Cancel(aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD Suspend(void) { return _to Suspend(); } \
  NS_SCRIPTABLE NS_IMETHOD Resume(void) { return _to Resume(); } \
  NS_SCRIPTABLE NS_IMETHOD GetLoadGroup(nsILoadGroup * *aLoadGroup) { return _to GetLoadGroup(aLoadGroup); } \
  NS_SCRIPTABLE NS_IMETHOD SetLoadGroup(nsILoadGroup * aLoadGroup) { return _to SetLoadGroup(aLoadGroup); } \
  NS_SCRIPTABLE NS_IMETHOD GetLoadFlags(nsLoadFlags *aLoadFlags) { return _to GetLoadFlags(aLoadFlags); } \
  NS_SCRIPTABLE NS_IMETHOD SetLoadFlags(nsLoadFlags aLoadFlags) { return _to SetLoadFlags(aLoadFlags); } \

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIREQUEST(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsACString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD IsPending(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsPending(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetStatus(nsresult *aStatus) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetStatus(aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD Cancel(nsresult aStatus) { return !_to ? NS_ERROR_NULL_POINTER : _to->Cancel(aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD Suspend(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Suspend(); } \
  NS_SCRIPTABLE NS_IMETHOD Resume(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Resume(); } \
  NS_SCRIPTABLE NS_IMETHOD GetLoadGroup(nsILoadGroup * *aLoadGroup) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLoadGroup(aLoadGroup); } \
  NS_SCRIPTABLE NS_IMETHOD SetLoadGroup(nsILoadGroup * aLoadGroup) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLoadGroup(aLoadGroup); } \
  NS_SCRIPTABLE NS_IMETHOD GetLoadFlags(nsLoadFlags *aLoadFlags) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLoadFlags(aLoadFlags); } \
  NS_SCRIPTABLE NS_IMETHOD SetLoadFlags(nsLoadFlags aLoadFlags) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLoadFlags(aLoadFlags); } \

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsRequest : public nsIRequest
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIREQUEST

  nsRequest();

private:
  ~nsRequest();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsRequest, nsIRequest)

nsRequest::nsRequest()
{
  /* member initializers and constructor code */
}

nsRequest::~nsRequest()
{
  /* destructor code */
}

/* readonly attribute AUTF8String name; */
NS_IMETHODIMP nsRequest::GetName(nsACString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isPending (); */
NS_IMETHODIMP nsRequest::IsPending(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsresult status; */
NS_IMETHODIMP nsRequest::GetStatus(nsresult *aStatus)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void cancel (in nsresult aStatus); */
NS_IMETHODIMP nsRequest::Cancel(nsresult aStatus)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void suspend (); */
NS_IMETHODIMP nsRequest::Suspend()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void resume (); */
NS_IMETHODIMP nsRequest::Resume()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsILoadGroup loadGroup; */
NS_IMETHODIMP nsRequest::GetLoadGroup(nsILoadGroup * *aLoadGroup)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsRequest::SetLoadGroup(nsILoadGroup * aLoadGroup)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsLoadFlags loadFlags; */
NS_IMETHODIMP nsRequest::GetLoadFlags(nsLoadFlags *aLoadFlags)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsRequest::SetLoadFlags(nsLoadFlags aLoadFlags)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIRequest_h__ */
