/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/uriloader/base/nsIWebProgressListener.idl
 */

#ifndef __gen_nsIWebProgressListener_h__
#define __gen_nsIWebProgressListener_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIWebProgress; /* forward declaration */

class nsIRequest; /* forward declaration */

class nsIURI; /* forward declaration */


/* starting interface:    nsIWebProgressListener */
#define NS_IWEBPROGRESSLISTENER_IID_STR "570f39d1-efd0-11d3-b093-00a024ffc08c"

#define NS_IWEBPROGRESSLISTENER_IID \
  {0x570f39d1, 0xefd0, 0x11d3, \
    { 0xb0, 0x93, 0x00, 0xa0, 0x24, 0xff, 0xc0, 0x8c }}

/**
 * The nsIWebProgressListener interface is implemented by clients wishing to
 * listen in on the progress associated with the loading of asynchronous
 * requests in the context of a nsIWebProgress instance as well as any child
 * nsIWebProgress instances.  nsIWebProgress.idl describes the parent-child
 * relationship of nsIWebProgress instances.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebProgressListener : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBPROGRESSLISTENER_IID)

  /**
   * State Transition Flags
   *
   * These flags indicate the various states that requests may transition
   * through as they are being loaded.  These flags are mutually exclusive.
   *
   * For any given request, onStateChange is called once with the STATE_START
   * flag, zero or more times with the STATE_TRANSFERRING flag or once with the
   * STATE_REDIRECTING flag, and then finally once with the STATE_STOP flag.
   * NOTE: For document requests, a second STATE_STOP is generated (see the
   * description of STATE_IS_WINDOW for more details).
   *
   * STATE_START
   *   This flag indicates the start of a request.  This flag is set when a
   *   request is initiated.  The request is complete when onStateChange is
   *   called for the same request with the STATE_STOP flag set.
   *
   * STATE_REDIRECTING
   *   This flag indicates that a request is being redirected.  The request
   *   passed to onStateChange is the request that is being redirected.  When a
   *   redirect occurs, a new request is generated automatically to process the
   *   new request.  Expect a corresponding STATE_START event for the new
   *   request, and a STATE_STOP for the redirected request.
   *
   * STATE_TRANSFERRING
   *   This flag indicates that data for a request is being transferred to an
   *   end consumer.  This flag indicates that the request has been targeted,
   *   and that the user may start seeing content corresponding to the request.
   *
   * STATE_NEGOTIATING
   *   This flag is not used.
   *
   * STATE_STOP
   *   This flag indicates the completion of a request.  The aStatus parameter
   *   to onStateChange indicates the final status of the request.
   */
  enum { STATE_START = 1U };

  enum { STATE_REDIRECTING = 2U };

  enum { STATE_TRANSFERRING = 4U };

  enum { STATE_NEGOTIATING = 8U };

  enum { STATE_STOP = 16U };

  /**
   * State Type Flags
   *
   * These flags further describe the entity for which the state transition is
   * occuring.  These flags are NOT mutually exclusive (i.e., an onStateChange
   * event may indicate some combination of these flags).
   *
   * STATE_IS_REQUEST
   *   This flag indicates that the state transition is for a request, which
   *   includes but is not limited to document requests.  (See below for a
   *   description of document requests.)  Other types of requests, such as
   *   requests for inline content (e.g., images and stylesheets) are
   *   considered normal requests.
   *
   * STATE_IS_DOCUMENT
   *   This flag indicates that the state transition is for a document request.
   *   This flag is set in addition to STATE_IS_REQUEST.  A document request
   *   supports the nsIChannel interface and its loadFlags attribute includes
   *   the nsIChannel::LOAD_DOCUMENT_URI flag.
   * 
   *   A document request does not complete until all requests associated with
   *   the loading of its corresponding document have completed.  This includes
   *   other document requests (e.g., corresponding to HTML <iframe> elements).
   *   The document corresponding to a document request is available via the
   *   DOMWindow attribute of onStateChange's aWebProgress parameter.
   *
   * STATE_IS_NETWORK
   *   This flag indicates that the state transition corresponds to the start
   *   or stop of activity in the indicated nsIWebProgress instance.  This flag
   *   is accompanied by either STATE_START or STATE_STOP, and it may be
   *   combined with other State Type Flags.
   *
   *   Unlike STATE_IS_WINDOW, this flag is only set when activity within the
   *   nsIWebProgress instance being observed starts or stops.  If activity
   *   only occurs in a child nsIWebProgress instance, then this flag will be
   *   set to indicate the start and stop of that activity.
   *
   *   For example, in the case of navigation within a single frame of a HTML
   *   frameset, a nsIWebProgressListener instance attached to the
   *   nsIWebProgress of the frameset window will receive onStateChange calls
   *   with the STATE_IS_NETWORK flag set to indicate the start and stop of
   *   said navigation.  In other words, an observer of an outer window can
   *   determine when activity, that may be constrained to a child window or
   *   set of child windows, starts and stops.
   *
   * STATE_IS_WINDOW
   *   This flag indicates that the state transition corresponds to the start
   *   or stop of activity in the indicated nsIWebProgress instance.  This flag
   *   is accompanied by either STATE_START or STATE_STOP, and it may be
   *   combined with other State Type Flags.
   *
   *   This flag is similar to STATE_IS_DOCUMENT.  However, when a document
   *   request completes, two onStateChange calls with STATE_STOP are
   *   generated.  The document request is passed as aRequest to both calls.
   *   The first has STATE_IS_REQUEST and STATE_IS_DOCUMENT set, and the second
   *   has the STATE_IS_WINDOW flag set (and possibly the STATE_IS_NETWORK flag
   *   set as well -- see above for a description of when the STATE_IS_NETWORK
   *   flag may be set).  This second STATE_STOP event may be useful as a way
   *   to partition the work that occurs when a document request completes.
   */
  enum { STATE_IS_REQUEST = 65536U };

  enum { STATE_IS_DOCUMENT = 131072U };

  enum { STATE_IS_NETWORK = 262144U };

  enum { STATE_IS_WINDOW = 524288U };

  /**
   * State Modifier Flags
   *
   * These flags further describe the transition which is occuring.  These
   * flags are NOT mutually exclusive (i.e., an onStateChange event may
   * indicate some combination of these flags).
   *
   * STATE_RESTORING
   *   This flag indicates that the state transition corresponds to the start
   *   or stop of activity for restoring a previously-rendered presentation.
   *   As such, there is no actual network activity associated with this
   *   request, and any modifications made to the document or presentation
   *   when it was originally loaded will still be present.
   */
  enum { STATE_RESTORING = 16777216U };

  /**
   * State Security Flags
   *
   * These flags describe the security state reported by a call to the
   * onSecurityChange method.  These flags are mutually exclusive.
   *
   * STATE_IS_INSECURE
   *   This flag indicates that the data corresponding to the request
   *   was received over an insecure channel.
   *
   * STATE_IS_BROKEN
   *   This flag indicates an unknown security state.  This may mean that the
   *   request is being loaded as part of a page in which some content was
   *   received over an insecure channel.
   *
   * STATE_IS_SECURE
   *   This flag indicates that the data corresponding to the request was
   *   received over a secure channel.  The degree of security is expressed by
   *   STATE_SECURE_HIGH, STATE_SECURE_MED, or STATE_SECURE_LOW.
   */
  enum { STATE_IS_INSECURE = 4U };

  enum { STATE_IS_BROKEN = 1U };

  enum { STATE_IS_SECURE = 2U };

  /**
   * Security Strength Flags
   *
   * These flags describe the security strength and accompany STATE_IS_SECURE
   * in a call to the onSecurityChange method.  These flags are mutually
   * exclusive.
   *
   * These flags are not meant to provide a precise description of data
   * transfer security.  These are instead intended as a rough indicator that
   * may be used to, for example, color code a security indicator or otherwise
   * provide basic data transfer security feedback to the user.
   *
   * STATE_SECURE_HIGH
   *   This flag indicates a high degree of security.
   *
   * STATE_SECURE_MED
   *   This flag indicates a medium degree of security.
   *
   * STATE_SECURE_LOW
   *   This flag indicates a low degree of security.
   */
  enum { STATE_SECURE_HIGH = 262144U };

  enum { STATE_SECURE_MED = 65536U };

  enum { STATE_SECURE_LOW = 131072U };

  /**
    * State bits for EV == Extended Validation == High Assurance
    *
    * These flags describe the level of identity verification
    * in a call to the onSecurityChange method. 
    *
    * STATE_IDENTITY_EV_TOPLEVEL
    *   The topmost document uses an EV cert.
    *   NOTE: Available since Gecko 1.9
    */
  enum { STATE_IDENTITY_EV_TOPLEVEL = 1048576U };

  /**
   * Notification indicating the state has changed for one of the requests
   * associated with aWebProgress.
   *
   * @param aWebProgress
   *        The nsIWebProgress instance that fired the notification
   * @param aRequest
   *        The nsIRequest that has changed state.
   * @param aStateFlags
   *        Flags indicating the new state.  This value is a combination of one
   *        of the State Transition Flags and one or more of the State Type
   *        Flags defined above.  Any undefined bits are reserved for future
   *        use.
   * @param aStatus
   *        Error status code associated with the state change.  This parameter
   *        should be ignored unless aStateFlags includes the STATE_STOP bit.
   *        The status code indicates success or failure of the request
   *        associated with the state change.  NOTE: aStatus may be a success
   *        code even for server generated errors, such as the HTTP 404 error.
   *        In such cases, the request itself should be queried for extended
   *        error information (e.g., for HTTP requests see nsIHttpChannel).
   */
  /* void onStateChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in unsigned long aStateFlags, in nsresult aStatus); */
  NS_SCRIPTABLE NS_IMETHOD OnStateChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aStateFlags, nsresult aStatus) = 0;

  /**
   * Notification that the progress has changed for one of the requests
   * associated with aWebProgress.  Progress totals are reset to zero when all
   * requests in aWebProgress complete (corresponding to onStateChange being
   * called with aStateFlags including the STATE_STOP and STATE_IS_WINDOW
   * flags).
   *
   * @param aWebProgress
   *        The nsIWebProgress instance that fired the notification.
   * @param aRequest
   *        The nsIRequest that has new progress.
   * @param aCurSelfProgress
   *        The current progress for aRequest.
   * @param aMaxSelfProgress
   *        The maximum progress for aRequest.
   * @param aCurTotalProgress
   *        The current progress for all requests associated with aWebProgress.
   * @param aMaxTotalProgress
   *        The total progress for all requests associated with aWebProgress.
   *
   * NOTE: If any progress value is unknown, or if its value would exceed the
   * maximum value of type long, then its value is replaced with -1.
   *
   * NOTE: If the object also implements nsIWebProgressListener2 and the caller
   * knows about that interface, this function will not be called. Instead,
   * nsIWebProgressListener2::onProgressChange64 will be called.
   */
  /* void onProgressChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in long aCurSelfProgress, in long aMaxSelfProgress, in long aCurTotalProgress, in long aMaxTotalProgress); */
  NS_SCRIPTABLE NS_IMETHOD OnProgressChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRInt32 aCurSelfProgress, PRInt32 aMaxSelfProgress, PRInt32 aCurTotalProgress, PRInt32 aMaxTotalProgress) = 0;

  /**
   * Called when the location of the window being watched changes.  This is not
   * when a load is requested, but rather once it is verified that the load is
   * going to occur in the given window.  For instance, a load that starts in a
   * window might send progress and status messages for the new site, but it
   * will not send the onLocationChange until we are sure that we are loading
   * this new page here.
   *
   * @param aWebProgress
   *        The nsIWebProgress instance that fired the notification.
   * @param aRequest
   *        The associated nsIRequest.  This may be null in some cases.
   * @param aLocation
   *        The URI of the location that is being loaded.
   */
  /* void onLocationChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in nsIURI aLocation); */
  NS_SCRIPTABLE NS_IMETHOD OnLocationChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsIURI *aLocation) = 0;

  /**
   * Notification that the status of a request has changed.  The status message
   * is intended to be displayed to the user (e.g., in the status bar of the
   * browser).
   *
   * @param aWebProgress
   *        The nsIWebProgress instance that fired the notification.
   * @param aRequest
   *        The nsIRequest that has new status.
   * @param aStatus
   *        This value is not an error code.  Instead, it is a numeric value
   *        that indicates the current status of the request.  This interface
   *        does not define the set of possible status codes.  NOTE: Some
   *        status values are defined by nsITransport and nsISocketTransport.
   * @param aMessage
   *        Localized text corresponding to aStatus.
   */
  /* void onStatusChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in nsresult aStatus, in wstring aMessage); */
  NS_SCRIPTABLE NS_IMETHOD OnStatusChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsresult aStatus, const PRUnichar *aMessage) = 0;

  /**
   * Notification called for security progress.  This method will be called on
   * security transitions (eg HTTP -> HTTPS, HTTPS -> HTTP, FOO -> HTTPS) and
   * after document load completion.  It might also be called if an error
   * occurs during network loading.
   *
   * @param aWebProgress
   *        The nsIWebProgress instance that fired the notification.
   * @param aRequest
   *        The nsIRequest that has new security state.
   * @param aState
   *        A value composed of the Security State Flags and the Security
   *        Strength Flags listed above.  Any undefined bits are reserved for
   *        future use.
   *
   * NOTE: These notifications will only occur if a security package is
   * installed.
   */
  /* void onSecurityChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in unsigned long aState); */
  NS_SCRIPTABLE NS_IMETHOD OnSecurityChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aState) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebProgressListener, NS_IWEBPROGRESSLISTENER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBPROGRESSLISTENER \
  NS_SCRIPTABLE NS_IMETHOD OnStateChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aStateFlags, nsresult aStatus); \
  NS_SCRIPTABLE NS_IMETHOD OnProgressChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRInt32 aCurSelfProgress, PRInt32 aMaxSelfProgress, PRInt32 aCurTotalProgress, PRInt32 aMaxTotalProgress); \
  NS_SCRIPTABLE NS_IMETHOD OnLocationChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsIURI *aLocation); \
  NS_SCRIPTABLE NS_IMETHOD OnStatusChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsresult aStatus, const PRUnichar *aMessage); \
  NS_SCRIPTABLE NS_IMETHOD OnSecurityChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aState); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBPROGRESSLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnStateChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aStateFlags, nsresult aStatus) { return _to OnStateChange(aWebProgress, aRequest, aStateFlags, aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD OnProgressChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRInt32 aCurSelfProgress, PRInt32 aMaxSelfProgress, PRInt32 aCurTotalProgress, PRInt32 aMaxTotalProgress) { return _to OnProgressChange(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress); } \
  NS_SCRIPTABLE NS_IMETHOD OnLocationChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsIURI *aLocation) { return _to OnLocationChange(aWebProgress, aRequest, aLocation); } \
  NS_SCRIPTABLE NS_IMETHOD OnStatusChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsresult aStatus, const PRUnichar *aMessage) { return _to OnStatusChange(aWebProgress, aRequest, aStatus, aMessage); } \
  NS_SCRIPTABLE NS_IMETHOD OnSecurityChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aState) { return _to OnSecurityChange(aWebProgress, aRequest, aState); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBPROGRESSLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnStateChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aStateFlags, nsresult aStatus) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnStateChange(aWebProgress, aRequest, aStateFlags, aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD OnProgressChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRInt32 aCurSelfProgress, PRInt32 aMaxSelfProgress, PRInt32 aCurTotalProgress, PRInt32 aMaxTotalProgress) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnProgressChange(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress); } \
  NS_SCRIPTABLE NS_IMETHOD OnLocationChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsIURI *aLocation) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnLocationChange(aWebProgress, aRequest, aLocation); } \
  NS_SCRIPTABLE NS_IMETHOD OnStatusChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsresult aStatus, const PRUnichar *aMessage) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnStatusChange(aWebProgress, aRequest, aStatus, aMessage); } \
  NS_SCRIPTABLE NS_IMETHOD OnSecurityChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aState) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnSecurityChange(aWebProgress, aRequest, aState); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebProgressListener : public nsIWebProgressListener
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBPROGRESSLISTENER

  nsWebProgressListener();

private:
  ~nsWebProgressListener();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebProgressListener, nsIWebProgressListener)

nsWebProgressListener::nsWebProgressListener()
{
  /* member initializers and constructor code */
}

nsWebProgressListener::~nsWebProgressListener()
{
  /* destructor code */
}

/* void onStateChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in unsigned long aStateFlags, in nsresult aStatus); */
NS_IMETHODIMP nsWebProgressListener::OnStateChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aStateFlags, nsresult aStatus)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void onProgressChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in long aCurSelfProgress, in long aMaxSelfProgress, in long aCurTotalProgress, in long aMaxTotalProgress); */
NS_IMETHODIMP nsWebProgressListener::OnProgressChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRInt32 aCurSelfProgress, PRInt32 aMaxSelfProgress, PRInt32 aCurTotalProgress, PRInt32 aMaxTotalProgress)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void onLocationChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in nsIURI aLocation); */
NS_IMETHODIMP nsWebProgressListener::OnLocationChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsIURI *aLocation)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void onStatusChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in nsresult aStatus, in wstring aMessage); */
NS_IMETHODIMP nsWebProgressListener::OnStatusChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, nsresult aStatus, const PRUnichar *aMessage)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void onSecurityChange (in nsIWebProgress aWebProgress, in nsIRequest aRequest, in unsigned long aState); */
NS_IMETHODIMP nsWebProgressListener::OnSecurityChange(nsIWebProgress *aWebProgress, nsIRequest *aRequest, PRUint32 aState)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIWebProgressListener_h__ */
