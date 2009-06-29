/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/base/public/nsIRequestObserver.idl
 */

#ifndef __gen_nsIRequestObserver_h__
#define __gen_nsIRequestObserver_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIRequest; /* forward declaration */


/* starting interface:    nsIRequestObserver */
#define NS_IREQUESTOBSERVER_IID_STR "fd91e2e0-1481-11d3-9333-00104ba0fd40"

#define NS_IREQUESTOBSERVER_IID \
  {0xfd91e2e0, 0x1481, 0x11d3, \
    { 0x93, 0x33, 0x00, 0x10, 0x4b, 0xa0, 0xfd, 0x40 }}

/**
 * nsIRequestObserver
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIRequestObserver : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IREQUESTOBSERVER_IID)

  /**
     * Called to signify the beginning of an asynchronous request.
     *
     * @param aRequest request being observed
     * @param aContext user defined context
     *
     * An exception thrown from onStartRequest has the side-effect of
     * causing the request to be canceled.
     */
  /* void onStartRequest (in nsIRequest aRequest, in nsISupports aContext); */
  NS_SCRIPTABLE NS_IMETHOD OnStartRequest(nsIRequest *aRequest, nsISupports *aContext) = 0;

  /**
     * Called to signify the end of an asynchronous request.  This
     * call is always preceded by a call to onStartRequest.
     *
     * @param aRequest request being observed
     * @param aContext user defined context
     * @param aStatusCode reason for stopping (NS_OK if completed successfully)
     *
     * An exception thrown from onStopRequest is generally ignored.
     */
  /* void onStopRequest (in nsIRequest aRequest, in nsISupports aContext, in nsresult aStatusCode); */
  NS_SCRIPTABLE NS_IMETHOD OnStopRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatusCode) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIRequestObserver, NS_IREQUESTOBSERVER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIREQUESTOBSERVER \
  NS_SCRIPTABLE NS_IMETHOD OnStartRequest(nsIRequest *aRequest, nsISupports *aContext); \
  NS_SCRIPTABLE NS_IMETHOD OnStopRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatusCode); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIREQUESTOBSERVER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnStartRequest(nsIRequest *aRequest, nsISupports *aContext) { return _to OnStartRequest(aRequest, aContext); } \
  NS_SCRIPTABLE NS_IMETHOD OnStopRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatusCode) { return _to OnStopRequest(aRequest, aContext, aStatusCode); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIREQUESTOBSERVER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnStartRequest(nsIRequest *aRequest, nsISupports *aContext) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnStartRequest(aRequest, aContext); } \
  NS_SCRIPTABLE NS_IMETHOD OnStopRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatusCode) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnStopRequest(aRequest, aContext, aStatusCode); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsRequestObserver : public nsIRequestObserver
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIREQUESTOBSERVER

  nsRequestObserver();

private:
  ~nsRequestObserver();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsRequestObserver, nsIRequestObserver)

nsRequestObserver::nsRequestObserver()
{
  /* member initializers and constructor code */
}

nsRequestObserver::~nsRequestObserver()
{
  /* destructor code */
}

/* void onStartRequest (in nsIRequest aRequest, in nsISupports aContext); */
NS_IMETHODIMP nsRequestObserver::OnStartRequest(nsIRequest *aRequest, nsISupports *aContext)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void onStopRequest (in nsIRequest aRequest, in nsISupports aContext, in nsresult aStatusCode); */
NS_IMETHODIMP nsRequestObserver::OnStopRequest(nsIRequest *aRequest, nsISupports *aContext, nsresult aStatusCode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIRequestObserver_h__ */
