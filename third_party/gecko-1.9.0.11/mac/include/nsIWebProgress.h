/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/uriloader/base/nsIWebProgress.idl
 */

#ifndef __gen_nsIWebProgress_h__
#define __gen_nsIWebProgress_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIDOMWindow; /* forward declaration */

class nsIWebProgressListener; /* forward declaration */


/* starting interface:    nsIWebProgress */
#define NS_IWEBPROGRESS_IID_STR "570f39d0-efd0-11d3-b093-00a024ffc08c"

#define NS_IWEBPROGRESS_IID \
  {0x570f39d0, 0xefd0, 0x11d3, \
    { 0xb0, 0x93, 0x00, 0xa0, 0x24, 0xff, 0xc0, 0x8c }}

/**
 * The nsIWebProgress interface is used to add or remove nsIWebProgressListener
 * instances to observe the loading of asynchronous requests (usually in the
 * context of a DOM window).
 *
 * nsIWebProgress instances may be arranged in a parent-child configuration,
 * corresponding to the parent-child configuration of their respective DOM
 * windows.  However, in some cases a nsIWebProgress instance may not have an
 * associated DOM window.  The parent-child relationship of nsIWebProgress
 * instances is not made explicit by this interface, but the relationship may
 * exist in some implementations.
 *
 * A nsIWebProgressListener instance receives notifications for the
 * nsIWebProgress instance to which it added itself, and it may also receive
 * notifications from any nsIWebProgress instances that are children of that
 * nsIWebProgress instance.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebProgress : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBPROGRESS_IID)

  /**
   * The following flags may be combined to form the aNotifyMask parameter for
   * the addProgressListener method.  They limit the set of events that are
   * delivered to an nsIWebProgressListener instance.
   */
/**
   * These flags indicate the state transistions to observe, corresponding to
   * nsIWebProgressListener::onStateChange.
   *
   * NOTIFY_STATE_REQUEST
   *   Only receive the onStateChange event if the aStateFlags parameter
   *   includes nsIWebProgressListener::STATE_IS_REQUEST.
   *   
   * NOTIFY_STATE_DOCUMENT
   *   Only receive the onStateChange event if the aStateFlags parameter
   *   includes nsIWebProgressListener::STATE_IS_DOCUMENT.
   *
   * NOTIFY_STATE_NETWORK
   *   Only receive the onStateChange event if the aStateFlags parameter
   *   includes nsIWebProgressListener::STATE_IS_NETWORK.
   *
   * NOTIFY_STATE_WINDOW
   *   Only receive the onStateChange event if the aStateFlags parameter
   *   includes nsIWebProgressListener::STATE_IS_WINDOW.
   *
   * NOTIFY_STATE_ALL
   *   Receive all onStateChange events.
   */
  enum { NOTIFY_STATE_REQUEST = 1U };

  enum { NOTIFY_STATE_DOCUMENT = 2U };

  enum { NOTIFY_STATE_NETWORK = 4U };

  enum { NOTIFY_STATE_WINDOW = 8U };

  enum { NOTIFY_STATE_ALL = 15U };

  /**
   * These flags indicate the other events to observe, corresponding to the
   * other four methods defined on nsIWebProgressListener.
   *
   * NOTIFY_PROGRESS
   *   Receive onProgressChange events.
   *
   * NOTIFY_STATUS
   *   Receive onStatusChange events.
   *
   * NOTIFY_SECURITY
   *   Receive onSecurityChange events.
   *
   * NOTIFY_LOCATION
   *   Receive onLocationChange events.
   *
   * NOTIFY_REFRESH
   *   Receive onRefreshAttempted events.
   *   This is defined on nsIWebProgressListener2.
   */
  enum { NOTIFY_PROGRESS = 16U };

  enum { NOTIFY_STATUS = 32U };

  enum { NOTIFY_SECURITY = 64U };

  enum { NOTIFY_LOCATION = 128U };

  enum { NOTIFY_REFRESH = 256U };

  /**
   * This flag enables all notifications.
   */
  enum { NOTIFY_ALL = 511U };

  /**
   * Registers a listener to receive web progress events.
   *
   * @param aListener
   *        The listener interface to be called when a progress event occurs.
   *        This object must also implement nsISupportsWeakReference.
   * @param aNotifyMask
   *        The types of notifications to receive.
   *
   * @throw NS_ERROR_INVALID_ARG
   *        Indicates that aListener was either null or that it does not
   *        support weak references.
   * @throw NS_ERROR_FAILURE
   *        Indicates that aListener was already registered.
   */
  /* void addProgressListener (in nsIWebProgressListener aListener, in unsigned long aNotifyMask); */
  NS_SCRIPTABLE NS_IMETHOD AddProgressListener(nsIWebProgressListener *aListener, PRUint32 aNotifyMask) = 0;

  /**
   * Removes a previously registered listener of progress events.
   *
   * @param aListener
   *        The listener interface previously registered with a call to
   *        addProgressListener.
   *
   * @throw NS_ERROR_FAILURE
   *        Indicates that aListener was not registered.
   */
  /* void removeProgressListener (in nsIWebProgressListener aListener); */
  NS_SCRIPTABLE NS_IMETHOD RemoveProgressListener(nsIWebProgressListener *aListener) = 0;

  /**
   * The DOM window associated with this nsIWebProgress instance.
   *
   * @throw NS_ERROR_FAILURE
   *        Indicates that there is no associated DOM window.
   */
  /* readonly attribute nsIDOMWindow DOMWindow; */
  NS_SCRIPTABLE NS_IMETHOD GetDOMWindow(nsIDOMWindow * *aDOMWindow) = 0;

  /**
   * Indicates whether or not a document is currently being loaded
   * in the context of this nsIWebProgress instance.
   */
  /* readonly attribute PRBool isLoadingDocument; */
  NS_SCRIPTABLE NS_IMETHOD GetIsLoadingDocument(PRBool *aIsLoadingDocument) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebProgress, NS_IWEBPROGRESS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBPROGRESS \
  NS_SCRIPTABLE NS_IMETHOD AddProgressListener(nsIWebProgressListener *aListener, PRUint32 aNotifyMask); \
  NS_SCRIPTABLE NS_IMETHOD RemoveProgressListener(nsIWebProgressListener *aListener); \
  NS_SCRIPTABLE NS_IMETHOD GetDOMWindow(nsIDOMWindow * *aDOMWindow); \
  NS_SCRIPTABLE NS_IMETHOD GetIsLoadingDocument(PRBool *aIsLoadingDocument); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBPROGRESS(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddProgressListener(nsIWebProgressListener *aListener, PRUint32 aNotifyMask) { return _to AddProgressListener(aListener, aNotifyMask); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveProgressListener(nsIWebProgressListener *aListener) { return _to RemoveProgressListener(aListener); } \
  NS_SCRIPTABLE NS_IMETHOD GetDOMWindow(nsIDOMWindow * *aDOMWindow) { return _to GetDOMWindow(aDOMWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsLoadingDocument(PRBool *aIsLoadingDocument) { return _to GetIsLoadingDocument(aIsLoadingDocument); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBPROGRESS(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddProgressListener(nsIWebProgressListener *aListener, PRUint32 aNotifyMask) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddProgressListener(aListener, aNotifyMask); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveProgressListener(nsIWebProgressListener *aListener) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveProgressListener(aListener); } \
  NS_SCRIPTABLE NS_IMETHOD GetDOMWindow(nsIDOMWindow * *aDOMWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDOMWindow(aDOMWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsLoadingDocument(PRBool *aIsLoadingDocument) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsLoadingDocument(aIsLoadingDocument); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebProgress : public nsIWebProgress
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBPROGRESS

  nsWebProgress();

private:
  ~nsWebProgress();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebProgress, nsIWebProgress)

nsWebProgress::nsWebProgress()
{
  /* member initializers and constructor code */
}

nsWebProgress::~nsWebProgress()
{
  /* destructor code */
}

/* void addProgressListener (in nsIWebProgressListener aListener, in unsigned long aNotifyMask); */
NS_IMETHODIMP nsWebProgress::AddProgressListener(nsIWebProgressListener *aListener, PRUint32 aNotifyMask)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeProgressListener (in nsIWebProgressListener aListener); */
NS_IMETHODIMP nsWebProgress::RemoveProgressListener(nsIWebProgressListener *aListener)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMWindow DOMWindow; */
NS_IMETHODIMP nsWebProgress::GetDOMWindow(nsIDOMWindow * *aDOMWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute PRBool isLoadingDocument; */
NS_IMETHODIMP nsWebProgress::GetIsLoadingDocument(PRBool *aIsLoadingDocument)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIWebProgress_h__ */
