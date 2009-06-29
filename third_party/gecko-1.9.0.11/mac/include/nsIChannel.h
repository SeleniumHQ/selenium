/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/base/public/nsIChannel.idl
 */

#ifndef __gen_nsIChannel_h__
#define __gen_nsIChannel_h__


#ifndef __gen_nsIRequest_h__
#include "nsIRequest.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIURI; /* forward declaration */

class nsIInterfaceRequestor; /* forward declaration */

class nsIInputStream; /* forward declaration */

class nsIStreamListener; /* forward declaration */


/* starting interface:    nsIChannel */
#define NS_ICHANNEL_IID_STR "c63a055a-a676-4e71-bf3c-6cfa11082018"

#define NS_ICHANNEL_IID \
  {0xc63a055a, 0xa676, 0x4e71, \
    { 0xbf, 0x3c, 0x6c, 0xfa, 0x11, 0x08, 0x20, 0x18 }}

/**
 * The nsIChannel interface allows clients to construct "GET" requests for
 * specific protocols, and manage them in a uniform way.  Once a channel is
 * created (via nsIIOService::newChannel), parameters for that request may
 * be set by using the channel attributes, or by QI'ing to a subclass of
 * nsIChannel for protocol-specific parameters.  Then, the URI can be fetched
 * by calling nsIChannel::open or nsIChannel::asyncOpen.
 *
 * After a request has been completed, the channel is still valid for accessing
 * protocol-specific results.  For example, QI'ing to nsIHttpChannel allows
 * response headers to be retrieved for the corresponding http transaction. 
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIChannel : public nsIRequest {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ICHANNEL_IID)

  /**
     * The original URI used to construct the channel. This is used in the case
     * of a redirect or URI "resolution" (e.g. resolving a resource: URI to a
     * file: URI) so that the original pre-redirect URI can still be obtained. 
     *
     * NOTE: this is distinctly different from the http Referer (referring URI),
     * which is typically the page that contained the original URI (accessible
     * from nsIHttpChannel).
     */
  /* attribute nsIURI originalURI; */
  NS_SCRIPTABLE NS_IMETHOD GetOriginalURI(nsIURI * *aOriginalURI) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetOriginalURI(nsIURI * aOriginalURI) = 0;

  /**
     * The URI corresponding to the channel.  Its value is immutable.
     */
  /* readonly attribute nsIURI URI; */
  NS_SCRIPTABLE NS_IMETHOD GetURI(nsIURI * *aURI) = 0;

  /**
     * The owner, corresponding to the entity that is responsible for this
     * channel.  Used by the security manager to grant or deny privileges to
     * mobile code loaded from this channel.
     *
     * NOTE: this is a strong reference to the owner, so if the owner is also
     * holding a strong reference to the channel, care must be taken to 
     * explicitly drop its reference to the channel.
     */
  /* attribute nsISupports owner; */
  NS_SCRIPTABLE NS_IMETHOD GetOwner(nsISupports * *aOwner) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetOwner(nsISupports * aOwner) = 0;

  /**
     * The notification callbacks for the channel.  This is set by clients, who
     * wish to provide a means to receive progress, status and protocol-specific 
     * notifications.  If this value is NULL, the channel implementation may use
     * the notification callbacks from its load group.  The channel may also
     * query the notification callbacks from its load group if its notification
     * callbacks do not supply the requested interface.
     * 
     * Interfaces commonly requested include: nsIProgressEventSink, nsIPrompt,
     * and nsIAuthPrompt/nsIAuthPrompt2.
     *
     * When the channel is done, it must not continue holding references to
     * this object.
     *
     * NOTE: A channel implementation should take care when "caching" an
     * interface pointer queried from its notification callbacks.  If the
     * notification callbacks are changed, then a cached interface pointer may
     * become invalid and may therefore need to be re-queried.
     */
  /* attribute nsIInterfaceRequestor notificationCallbacks; */
  NS_SCRIPTABLE NS_IMETHOD GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks) = 0;

  /**
     * Transport-level security information (if any) corresponding to the channel.
     */
  /* readonly attribute nsISupports securityInfo; */
  NS_SCRIPTABLE NS_IMETHOD GetSecurityInfo(nsISupports * *aSecurityInfo) = 0;

  /**
     * The MIME type of the channel's content if available. 
     * 
     * NOTE: the content type can often be wrongly specified (e.g., wrong file
     * extension, wrong MIME type, wrong document type stored on a server, etc.),
     * and the caller most likely wants to verify with the actual data.
     *
     * Setting contentType before the channel has been opened provides a hint
     * to the channel as to what the MIME type is.  The channel may ignore this
     * hint in deciding on the actual MIME type that it will report.
     *
     * Setting contentType after onStartRequest has been fired or after open()
     * is called will override the type determined by the channel.
     *
     * Setting contentType between the time that asyncOpen() is called and the
     * time when onStartRequest is fired has undefined behavior at this time.
     *
     * The value of the contentType attribute is a lowercase string.  A value
     * assigned to this attribute will be parsed and normalized as follows:
     *  1- any parameters (delimited with a ';') will be stripped.
     *  2- if a charset parameter is given, then its value will replace the
     *     the contentCharset attribute of the channel.
     *  3- the stripped contentType will be lowercased.
     * Any implementation of nsIChannel must follow these rules.
     */
  /* attribute ACString contentType; */
  NS_SCRIPTABLE NS_IMETHOD GetContentType(nsACString & aContentType) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetContentType(const nsACString & aContentType) = 0;

  /**
     * The character set of the channel's content if available and if applicable.
     * This attribute only applies to textual data.
     *
     * The value of the contentCharset attribute is a mixedcase string.
     */
  /* attribute ACString contentCharset; */
  NS_SCRIPTABLE NS_IMETHOD GetContentCharset(nsACString & aContentCharset) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetContentCharset(const nsACString & aContentCharset) = 0;

  /**
     * The length of the data associated with the channel if available.  A value
     * of -1 indicates that the content length is unknown.
     *
     * Callers should prefer getting the "content-length" property
     * as 64-bit value by QIing the channel to nsIPropertyBag2,
     * if that interface is exposed by the channel.
     */
  /* attribute long contentLength; */
  NS_SCRIPTABLE NS_IMETHOD GetContentLength(PRInt32 *aContentLength) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetContentLength(PRInt32 aContentLength) = 0;

  /**
     * Synchronously open the channel.
     *
     * @return blocking input stream to the channel's data.
     *
     * NOTE: nsIChannel implementations are not required to implement this
     * method.  Moreover, since this method may block the calling thread, it
     * should not be called on a thread that processes UI events.
     *
     * NOTE: Implementations should throw NS_ERROR_IN_PROGRESS if the channel
     * is reopened.
     */
  /* nsIInputStream open (); */
  NS_SCRIPTABLE NS_IMETHOD Open(nsIInputStream **_retval) = 0;

  /**
     * Asynchronously open this channel.  Data is fed to the specified stream
     * listener as it becomes available.  The stream listener's methods are
     * called on the thread that calls asyncOpen and are not called until
     * after asyncOpen returns.  If asyncOpen returns successfully, the
     * channel promises to call at least onStartRequest and onStopRequest.
     *
     * If the nsIRequest object passed to the stream listener's methods is not
     * this channel, an appropriate onChannelRedirect notification needs to be
     * sent to the notification callbacks before onStartRequest is called.
     * Once onStartRequest is called, all following method calls on aListener
     * will get the request that was passed to onStartRequest.
     *
     * If the channel's and loadgroup's notification callbacks do not provide
     * an nsIChannelEventSink when onChannelRedirect would be called, that's
     * equivalent to having called onChannelRedirect.
     *
     * If asyncOpen returns successfully, the channel is responsible for
     * keeping itself alive until it has called onStopRequest on aListener or
     * called onChannelRedirect.
     *
     * Implementations are allowed to synchronously add themselves to the
     * associated load group (if any).
     *
     * NOTE: Implementations should throw NS_ERROR_ALREADY_OPENED if the
     * channel is reopened.
     *
     * @param aListener the nsIStreamListener implementation
     * @param aContext an opaque parameter forwarded to aListener's methods
     * @see nsIChannelEventSink for onChannelRedirect
     */
  /* void asyncOpen (in nsIStreamListener aListener, in nsISupports aContext); */
  NS_SCRIPTABLE NS_IMETHOD AsyncOpen(nsIStreamListener *aListener, nsISupports *aContext) = 0;

  /**************************************************************************
     * Channel specific load flags:
     *
     * Bits 22-31 are reserved for future use by this interface or one of its
     * derivatives (e.g., see nsICachingChannel).
     */
/**
     * Set (e.g., by the docshell) to indicate whether or not the channel
     * corresponds to a document URI.
     */
  enum { LOAD_DOCUMENT_URI = 65536U };

  /** 
     * If the end consumer for this load has been retargeted after discovering 
     * its content, this flag will be set:
     */
  enum { LOAD_RETARGETED_DOCUMENT_URI = 131072U };

  /**
     * This flag is set to indicate that this channel is replacing another
     * channel.  This means that:
     *
     * 1) the stream listener this channel will be notifying was initially
     *    passed to the asyncOpen method of some other channel
     *
     *   and
     *
     * 2) this channel's URI is a better identifier of the resource being
     *    accessed than this channel's originalURI.
     *
     * This flag can be set, for example, for redirects or for cases when a
     * single channel has multiple parts to it (and thus can follow
     * onStopRequest with another onStartRequest/onStopRequest pair, each pair
     * for a different request).
     */
  enum { LOAD_REPLACE = 262144U };

  /**
     * Set (e.g., by the docshell) to indicate whether or not the channel
     * corresponds to an initial document URI load (e.g., link click).
     */
  enum { LOAD_INITIAL_DOCUMENT_URI = 524288U };

  /**
     * Set (e.g., by the URILoader) to indicate whether or not the end consumer
     * for this load has been determined.
     */
  enum { LOAD_TARGETED = 1048576U };

  /**
     * If this flag is set, the channel should call the content sniffers as
     * described in nsNetCID.h about NS_CONTENT_SNIFFER_CATEGORY.
     *
     * Note: Channels may ignore this flag; however, new channel implementations
     * should only do so with good reason.
     */
  enum { LOAD_CALL_CONTENT_SNIFFERS = 2097152U };

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIChannel, NS_ICHANNEL_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSICHANNEL \
  NS_SCRIPTABLE NS_IMETHOD GetOriginalURI(nsIURI * *aOriginalURI); \
  NS_SCRIPTABLE NS_IMETHOD SetOriginalURI(nsIURI * aOriginalURI); \
  NS_SCRIPTABLE NS_IMETHOD GetURI(nsIURI * *aURI); \
  NS_SCRIPTABLE NS_IMETHOD GetOwner(nsISupports * *aOwner); \
  NS_SCRIPTABLE NS_IMETHOD SetOwner(nsISupports * aOwner); \
  NS_SCRIPTABLE NS_IMETHOD GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks); \
  NS_SCRIPTABLE NS_IMETHOD SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks); \
  NS_SCRIPTABLE NS_IMETHOD GetSecurityInfo(nsISupports * *aSecurityInfo); \
  NS_SCRIPTABLE NS_IMETHOD GetContentType(nsACString & aContentType); \
  NS_SCRIPTABLE NS_IMETHOD SetContentType(const nsACString & aContentType); \
  NS_SCRIPTABLE NS_IMETHOD GetContentCharset(nsACString & aContentCharset); \
  NS_SCRIPTABLE NS_IMETHOD SetContentCharset(const nsACString & aContentCharset); \
  NS_SCRIPTABLE NS_IMETHOD GetContentLength(PRInt32 *aContentLength); \
  NS_SCRIPTABLE NS_IMETHOD SetContentLength(PRInt32 aContentLength); \
  NS_SCRIPTABLE NS_IMETHOD Open(nsIInputStream **_retval); \
  NS_SCRIPTABLE NS_IMETHOD AsyncOpen(nsIStreamListener *aListener, nsISupports *aContext); \

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSICHANNEL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetOriginalURI(nsIURI * *aOriginalURI) { return _to GetOriginalURI(aOriginalURI); } \
  NS_SCRIPTABLE NS_IMETHOD SetOriginalURI(nsIURI * aOriginalURI) { return _to SetOriginalURI(aOriginalURI); } \
  NS_SCRIPTABLE NS_IMETHOD GetURI(nsIURI * *aURI) { return _to GetURI(aURI); } \
  NS_SCRIPTABLE NS_IMETHOD GetOwner(nsISupports * *aOwner) { return _to GetOwner(aOwner); } \
  NS_SCRIPTABLE NS_IMETHOD SetOwner(nsISupports * aOwner) { return _to SetOwner(aOwner); } \
  NS_SCRIPTABLE NS_IMETHOD GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks) { return _to GetNotificationCallbacks(aNotificationCallbacks); } \
  NS_SCRIPTABLE NS_IMETHOD SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks) { return _to SetNotificationCallbacks(aNotificationCallbacks); } \
  NS_SCRIPTABLE NS_IMETHOD GetSecurityInfo(nsISupports * *aSecurityInfo) { return _to GetSecurityInfo(aSecurityInfo); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentType(nsACString & aContentType) { return _to GetContentType(aContentType); } \
  NS_SCRIPTABLE NS_IMETHOD SetContentType(const nsACString & aContentType) { return _to SetContentType(aContentType); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentCharset(nsACString & aContentCharset) { return _to GetContentCharset(aContentCharset); } \
  NS_SCRIPTABLE NS_IMETHOD SetContentCharset(const nsACString & aContentCharset) { return _to SetContentCharset(aContentCharset); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentLength(PRInt32 *aContentLength) { return _to GetContentLength(aContentLength); } \
  NS_SCRIPTABLE NS_IMETHOD SetContentLength(PRInt32 aContentLength) { return _to SetContentLength(aContentLength); } \
  NS_SCRIPTABLE NS_IMETHOD Open(nsIInputStream **_retval) { return _to Open(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD AsyncOpen(nsIStreamListener *aListener, nsISupports *aContext) { return _to AsyncOpen(aListener, aContext); } \

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSICHANNEL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetOriginalURI(nsIURI * *aOriginalURI) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOriginalURI(aOriginalURI); } \
  NS_SCRIPTABLE NS_IMETHOD SetOriginalURI(nsIURI * aOriginalURI) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetOriginalURI(aOriginalURI); } \
  NS_SCRIPTABLE NS_IMETHOD GetURI(nsIURI * *aURI) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetURI(aURI); } \
  NS_SCRIPTABLE NS_IMETHOD GetOwner(nsISupports * *aOwner) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOwner(aOwner); } \
  NS_SCRIPTABLE NS_IMETHOD SetOwner(nsISupports * aOwner) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetOwner(aOwner); } \
  NS_SCRIPTABLE NS_IMETHOD GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNotificationCallbacks(aNotificationCallbacks); } \
  NS_SCRIPTABLE NS_IMETHOD SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNotificationCallbacks(aNotificationCallbacks); } \
  NS_SCRIPTABLE NS_IMETHOD GetSecurityInfo(nsISupports * *aSecurityInfo) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSecurityInfo(aSecurityInfo); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentType(nsACString & aContentType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContentType(aContentType); } \
  NS_SCRIPTABLE NS_IMETHOD SetContentType(const nsACString & aContentType) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetContentType(aContentType); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentCharset(nsACString & aContentCharset) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContentCharset(aContentCharset); } \
  NS_SCRIPTABLE NS_IMETHOD SetContentCharset(const nsACString & aContentCharset) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetContentCharset(aContentCharset); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentLength(PRInt32 *aContentLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContentLength(aContentLength); } \
  NS_SCRIPTABLE NS_IMETHOD SetContentLength(PRInt32 aContentLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetContentLength(aContentLength); } \
  NS_SCRIPTABLE NS_IMETHOD Open(nsIInputStream **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Open(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD AsyncOpen(nsIStreamListener *aListener, nsISupports *aContext) { return !_to ? NS_ERROR_NULL_POINTER : _to->AsyncOpen(aListener, aContext); } \

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsChannel : public nsIChannel
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSICHANNEL

  nsChannel();

private:
  ~nsChannel();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsChannel, nsIChannel)

nsChannel::nsChannel()
{
  /* member initializers and constructor code */
}

nsChannel::~nsChannel()
{
  /* destructor code */
}

/* attribute nsIURI originalURI; */
NS_IMETHODIMP nsChannel::GetOriginalURI(nsIURI * *aOriginalURI)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsChannel::SetOriginalURI(nsIURI * aOriginalURI)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIURI URI; */
NS_IMETHODIMP nsChannel::GetURI(nsIURI * *aURI)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsISupports owner; */
NS_IMETHODIMP nsChannel::GetOwner(nsISupports * *aOwner)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsChannel::SetOwner(nsISupports * aOwner)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIInterfaceRequestor notificationCallbacks; */
NS_IMETHODIMP nsChannel::GetNotificationCallbacks(nsIInterfaceRequestor * *aNotificationCallbacks)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsChannel::SetNotificationCallbacks(nsIInterfaceRequestor * aNotificationCallbacks)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsISupports securityInfo; */
NS_IMETHODIMP nsChannel::GetSecurityInfo(nsISupports * *aSecurityInfo)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute ACString contentType; */
NS_IMETHODIMP nsChannel::GetContentType(nsACString & aContentType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsChannel::SetContentType(const nsACString & aContentType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute ACString contentCharset; */
NS_IMETHODIMP nsChannel::GetContentCharset(nsACString & aContentCharset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsChannel::SetContentCharset(const nsACString & aContentCharset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long contentLength; */
NS_IMETHODIMP nsChannel::GetContentLength(PRInt32 *aContentLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsChannel::SetContentLength(PRInt32 aContentLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIInputStream open (); */
NS_IMETHODIMP nsChannel::Open(nsIInputStream **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void asyncOpen (in nsIStreamListener aListener, in nsISupports aContext); */
NS_IMETHODIMP nsChannel::AsyncOpen(nsIStreamListener *aListener, nsISupports *aContext)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIChannel_h__ */
