/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/base/public/nsILoadGroup.idl
 */

#ifndef __gen_nsILoadGroup_h__
#define __gen_nsILoadGroup_h__


#ifndef __gen_nsIRequest_h__
#include "nsIRequest.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsISimpleEnumerator; /* forward declaration */

class nsIRequestObserver; /* forward declaration */

class nsIInterfaceRequestor; /* forward declaration */


/* starting interface:    nsILoadGroup */
#define NS_ILOADGROUP_IID_STR "3de0a31c-feaf-400f-9f1e-4ef71f8b20cc"

#define NS_ILOADGROUP_IID \
  {0x3de0a31c, 0xfeaf, 0x400f, \
    { 0x9f, 0x1e, 0x4e, 0xf7, 0x1f, 0x8b, 0x20, 0xcc }}

class NS_NO_VTABLE NS_SCRIPTABLE nsILoadGroup : public nsIRequest {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ILOADGROUP_IID)

  /**
 * A load group maintains a collection of nsIRequest objects. 
 *
 * @status FROZEN
 */
/**
     * The group observer is notified when requests are added to and removed
     * from this load group.  The groupObserver is weak referenced.
     */
  /* attribute nsIRequestObserver groupObserver; */
  NS_SCRIPTABLE NS_IMETHOD GetGroupObserver(nsIRequestObserver * *aGroupObserver) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetGroupObserver(nsIRequestObserver * aGroupObserver) = 0;

  /**
     * Accesses the default load request for the group.  Each time a number
     * of requests are added to a group, the defaultLoadRequest may be set
     * to indicate that all of the requests are related to a base request.
     *
     * The load group inherits its load flags from the default load request.
     * If the default load request is NULL, then the group's load flags are
     * not changed.
     */
  /* attribute nsIRequest defaultLoadRequest; */
  NS_SCRIPTABLE NS_IMETHOD GetDefaultLoadRequest(nsIRequest * *aDefaultLoadRequest) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDefaultLoadRequest(nsIRequest * aDefaultLoadRequest) = 0;

  /**
     * Adds a new request to the group.  This will cause the default load
     * flags to be applied to the request.  If this is a foreground
     * request then the groupObserver's onStartRequest will be called.
     *
     * If the request is the default load request or if the default load
     * request is null, then the load group will inherit its load flags from
     * the request.
     */
  /* void addRequest (in nsIRequest aRequest, in nsISupports aContext); */
  NS_SCRIPTABLE NS_IMETHOD AddRequest(nsIRequest *aRequest, nsISupports *aContext) = 0;

  /**
     * Removes a request from the group.  If this is a foreground request
     * then the groupObserver's onStopRequest will be called.
     *
     * By the time this call ends, aRequest will have been removed from the
     * loadgroup, even if this function throws an exception.
     */
  /* void removeRequest (in nsIRequest aRequest, in nsISupports aContext, in nsresult aStatus); */
  NS_SCRIPTABLE NS_IMETHOD RemoveRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatus) = 0;

  /**
     * Returns the requests contained directly in this group.
     * Enumerator element type: nsIRequest.
     */
  /* readonly attribute nsISimpleEnumerator requests; */
  NS_SCRIPTABLE NS_IMETHOD GetRequests(nsISimpleEnumerator * *aRequests) = 0;

  /**
     * Returns the count of "active" requests (ie. requests without the
     * LOAD_BACKGROUND bit set).
     */
  /* readonly attribute unsigned long activeCount; */
  NS_SCRIPTABLE NS_IMETHOD GetActiveCount(PRUint32 *aActiveCount) = 0;

  /**
     * Notification callbacks for the load group.
     */
  /* attribute nsIInterfaceRequestor notificationCallbacks; */
  NS_SCRIPTABLE NS_IMETHOD GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsILoadGroup, NS_ILOADGROUP_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSILOADGROUP \
  NS_SCRIPTABLE NS_IMETHOD GetGroupObserver(nsIRequestObserver * *aGroupObserver); \
  NS_SCRIPTABLE NS_IMETHOD SetGroupObserver(nsIRequestObserver * aGroupObserver); \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultLoadRequest(nsIRequest * *aDefaultLoadRequest); \
  NS_SCRIPTABLE NS_IMETHOD SetDefaultLoadRequest(nsIRequest * aDefaultLoadRequest); \
  NS_SCRIPTABLE NS_IMETHOD AddRequest(nsIRequest *aRequest, nsISupports *aContext); \
  NS_SCRIPTABLE NS_IMETHOD RemoveRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatus); \
  NS_SCRIPTABLE NS_IMETHOD GetRequests(nsISimpleEnumerator * *aRequests); \
  NS_SCRIPTABLE NS_IMETHOD GetActiveCount(PRUint32 *aActiveCount); \
  NS_SCRIPTABLE NS_IMETHOD GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks); \
  NS_SCRIPTABLE NS_IMETHOD SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSILOADGROUP(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetGroupObserver(nsIRequestObserver * *aGroupObserver) { return _to GetGroupObserver(aGroupObserver); } \
  NS_SCRIPTABLE NS_IMETHOD SetGroupObserver(nsIRequestObserver * aGroupObserver) { return _to SetGroupObserver(aGroupObserver); } \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultLoadRequest(nsIRequest * *aDefaultLoadRequest) { return _to GetDefaultLoadRequest(aDefaultLoadRequest); } \
  NS_SCRIPTABLE NS_IMETHOD SetDefaultLoadRequest(nsIRequest * aDefaultLoadRequest) { return _to SetDefaultLoadRequest(aDefaultLoadRequest); } \
  NS_SCRIPTABLE NS_IMETHOD AddRequest(nsIRequest *aRequest, nsISupports *aContext) { return _to AddRequest(aRequest, aContext); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatus) { return _to RemoveRequest(aRequest, aContext, aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD GetRequests(nsISimpleEnumerator * *aRequests) { return _to GetRequests(aRequests); } \
  NS_SCRIPTABLE NS_IMETHOD GetActiveCount(PRUint32 *aActiveCount) { return _to GetActiveCount(aActiveCount); } \
  NS_SCRIPTABLE NS_IMETHOD GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks) { return _to GetNotificationCallbacks(aNotificationCallbacks); } \
  NS_SCRIPTABLE NS_IMETHOD SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks) { return _to SetNotificationCallbacks(aNotificationCallbacks); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSILOADGROUP(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetGroupObserver(nsIRequestObserver * *aGroupObserver) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetGroupObserver(aGroupObserver); } \
  NS_SCRIPTABLE NS_IMETHOD SetGroupObserver(nsIRequestObserver * aGroupObserver) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetGroupObserver(aGroupObserver); } \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultLoadRequest(nsIRequest * *aDefaultLoadRequest) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDefaultLoadRequest(aDefaultLoadRequest); } \
  NS_SCRIPTABLE NS_IMETHOD SetDefaultLoadRequest(nsIRequest * aDefaultLoadRequest) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDefaultLoadRequest(aDefaultLoadRequest); } \
  NS_SCRIPTABLE NS_IMETHOD AddRequest(nsIRequest *aRequest, nsISupports *aContext) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddRequest(aRequest, aContext); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatus) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveRequest(aRequest, aContext, aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD GetRequests(nsISimpleEnumerator * *aRequests) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRequests(aRequests); } \
  NS_SCRIPTABLE NS_IMETHOD GetActiveCount(PRUint32 *aActiveCount) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetActiveCount(aActiveCount); } \
  NS_SCRIPTABLE NS_IMETHOD GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNotificationCallbacks(aNotificationCallbacks); } \
  NS_SCRIPTABLE NS_IMETHOD SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNotificationCallbacks(aNotificationCallbacks); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsLoadGroup : public nsILoadGroup
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSILOADGROUP

  nsLoadGroup();

private:
  ~nsLoadGroup();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsLoadGroup, nsILoadGroup)

nsLoadGroup::nsLoadGroup()
{
  /* member initializers and constructor code */
}

nsLoadGroup::~nsLoadGroup()
{
  /* destructor code */
}

/* attribute nsIRequestObserver groupObserver; */
NS_IMETHODIMP nsLoadGroup::GetGroupObserver(nsIRequestObserver * *aGroupObserver)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsLoadGroup::SetGroupObserver(nsIRequestObserver * aGroupObserver)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIRequest defaultLoadRequest; */
NS_IMETHODIMP nsLoadGroup::GetDefaultLoadRequest(nsIRequest * *aDefaultLoadRequest)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsLoadGroup::SetDefaultLoadRequest(nsIRequest * aDefaultLoadRequest)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void addRequest (in nsIRequest aRequest, in nsISupports aContext); */
NS_IMETHODIMP nsLoadGroup::AddRequest(nsIRequest *aRequest, nsISupports *aContext)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeRequest (in nsIRequest aRequest, in nsISupports aContext, in nsresult aStatus); */
NS_IMETHODIMP nsLoadGroup::RemoveRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatus)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsISimpleEnumerator requests; */
NS_IMETHODIMP nsLoadGroup::GetRequests(nsISimpleEnumerator * *aRequests)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned long activeCount; */
NS_IMETHODIMP nsLoadGroup::GetActiveCount(PRUint32 *aActiveCount)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIInterfaceRequestor notificationCallbacks; */
NS_IMETHODIMP nsLoadGroup::GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsLoadGroup::SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsILoadGroup_h__ */
