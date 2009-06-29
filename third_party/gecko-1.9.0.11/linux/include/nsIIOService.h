/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/netwerk/base/public/nsIIOService.idl
 */

#ifndef __gen_nsIIOService_h__
#define __gen_nsIIOService_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIProtocolHandler; /* forward declaration */

class nsIChannel; /* forward declaration */

class nsIURI; /* forward declaration */

class nsIFile; /* forward declaration */


/* starting interface:    nsIIOService */
#define NS_IIOSERVICE_IID_STR "bddeda3f-9020-4d12-8c70-984ee9f7935e"

#define NS_IIOSERVICE_IID \
  {0xbddeda3f, 0x9020, 0x4d12, \
    { 0x8c, 0x70, 0x98, 0x4e, 0xe9, 0xf7, 0x93, 0x5e }}

/**
 * nsIIOService provides a set of network utility functions.  This interface
 * duplicates many of the nsIProtocolHandler methods in a protocol handler
 * independent way (e.g., NewURI inspects the scheme in order to delegate
 * creation of the new URI to the appropriate protocol handler).  nsIIOService
 * also provides a set of URL parsing utility functions.  These are provided
 * as a convenience to the programmer and in some cases to improve performance
 * by eliminating intermediate data structures and interfaces.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIIOService : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IIOSERVICE_IID)

  /**
     * Returns a protocol handler for a given URI scheme.
     *
     * @param aScheme the URI scheme
     * @return reference to corresponding nsIProtocolHandler
     */
  /* nsIProtocolHandler getProtocolHandler (in string aScheme); */
  NS_SCRIPTABLE NS_IMETHOD GetProtocolHandler(const char *aScheme, nsIProtocolHandler **_retval) = 0;

  /**
     * Returns the protocol flags for a given scheme.
     *
     * @param aScheme the URI scheme
     * @return value of corresponding nsIProtocolHandler::protocolFlags
     */
  /* unsigned long getProtocolFlags (in string aScheme); */
  NS_SCRIPTABLE NS_IMETHOD GetProtocolFlags(const char *aScheme, PRUint32 *_retval) = 0;

  /**
     * This method constructs a new URI by determining the scheme of the
     * URI spec, and then delegating the construction of the URI to the
     * protocol handler for that scheme. QueryInterface can be used on
     * the resulting URI object to obtain a more specific type of URI.
     *
     * @see nsIProtocolHandler::newURI
     */
  /* nsIURI newURI (in AUTF8String aSpec, in string aOriginCharset, in nsIURI aBaseURI); */
  NS_SCRIPTABLE NS_IMETHOD NewURI(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIURI **_retval) = 0;

  /**
     * This method constructs a new URI from a nsIFile.
     *
     * @param aFile specifies the file path
     * @return reference to a new nsIURI object
     */
  /* nsIURI newFileURI (in nsIFile aFile); */
  NS_SCRIPTABLE NS_IMETHOD NewFileURI(nsIFile *aFile, nsIURI **_retval) = 0;

  /**
     * Creates a channel for a given URI.
     *
     * @param aURI nsIURI from which to make a channel
     * @return reference to the new nsIChannel object
     */
  /* nsIChannel newChannelFromURI (in nsIURI aURI); */
  NS_SCRIPTABLE NS_IMETHOD NewChannelFromURI(nsIURI *aURI, nsIChannel **_retval) = 0;

  /**
     * Equivalent to newChannelFromURI(newURI(...))
     */
  /* nsIChannel newChannel (in AUTF8String aSpec, in string aOriginCharset, in nsIURI aBaseURI); */
  NS_SCRIPTABLE NS_IMETHOD NewChannel(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIChannel **_retval) = 0;

  /**
     * Returns true if networking is in "offline" mode. When in offline mode, 
     * attempts to access the network will fail (although this does not 
     * necessarily correlate with whether there is actually a network 
     * available -- that's hard to detect without causing the dialer to 
     * come up).
     *
     * Changing this fires observer notifications ... see below.
     */
  /* attribute boolean offline; */
  NS_SCRIPTABLE NS_IMETHOD GetOffline(PRBool *aOffline) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetOffline(PRBool aOffline) = 0;

  /**
     * Checks if a port number is banned. This involves consulting a list of
     * unsafe ports, corresponding to network services that may be easily
     * exploitable. If the given port is considered unsafe, then the protocol
     * handler (corresponding to aScheme) will be asked whether it wishes to
     * override the IO service's decision to block the port. This gives the
     * protocol handler ultimate control over its own security policy while
     * ensuring reasonable, default protection.
     *
     * @see nsIProtocolHandler::allowPort
     */
  /* boolean allowPort (in long aPort, in string aScheme); */
  NS_SCRIPTABLE NS_IMETHOD AllowPort(PRInt32 aPort, const char *aScheme, PRBool *_retval) = 0;

  /**
     * Utility to extract the scheme from a URL string, consistently and
     * according to spec (see RFC 2396).
     *
     * NOTE: Most URL parsing is done via nsIURI, and in fact the scheme
     * can also be extracted from a URL string via nsIURI.  This method
     * is provided purely as an optimization.
     *
     * @param aSpec the URL string to parse
     * @return URL scheme
     *
     * @throws NS_ERROR_MALFORMED_URI if URL string is not of the right form.
     */
  /* ACString extractScheme (in AUTF8String urlString); */
  NS_SCRIPTABLE NS_IMETHOD ExtractScheme(const nsACString & urlString, nsACString & _retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIIOService, NS_IIOSERVICE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIIOSERVICE \
  NS_SCRIPTABLE NS_IMETHOD GetProtocolHandler(const char *aScheme, nsIProtocolHandler **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetProtocolFlags(const char *aScheme, PRUint32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD NewURI(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIURI **_retval); \
  NS_SCRIPTABLE NS_IMETHOD NewFileURI(nsIFile *aFile, nsIURI **_retval); \
  NS_SCRIPTABLE NS_IMETHOD NewChannelFromURI(nsIURI *aURI, nsIChannel **_retval); \
  NS_SCRIPTABLE NS_IMETHOD NewChannel(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIChannel **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetOffline(PRBool *aOffline); \
  NS_SCRIPTABLE NS_IMETHOD SetOffline(PRBool aOffline); \
  NS_SCRIPTABLE NS_IMETHOD AllowPort(PRInt32 aPort, const char *aScheme, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD ExtractScheme(const nsACString & urlString, nsACString & _retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIIOSERVICE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetProtocolHandler(const char *aScheme, nsIProtocolHandler **_retval) { return _to GetProtocolHandler(aScheme, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetProtocolFlags(const char *aScheme, PRUint32 *_retval) { return _to GetProtocolFlags(aScheme, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NewURI(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIURI **_retval) { return _to NewURI(aSpec, aOriginCharset, aBaseURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NewFileURI(nsIFile *aFile, nsIURI **_retval) { return _to NewFileURI(aFile, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NewChannelFromURI(nsIURI *aURI, nsIChannel **_retval) { return _to NewChannelFromURI(aURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NewChannel(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIChannel **_retval) { return _to NewChannel(aSpec, aOriginCharset, aBaseURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetOffline(PRBool *aOffline) { return _to GetOffline(aOffline); } \
  NS_SCRIPTABLE NS_IMETHOD SetOffline(PRBool aOffline) { return _to SetOffline(aOffline); } \
  NS_SCRIPTABLE NS_IMETHOD AllowPort(PRInt32 aPort, const char *aScheme, PRBool *_retval) { return _to AllowPort(aPort, aScheme, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ExtractScheme(const nsACString & urlString, nsACString & _retval) { return _to ExtractScheme(urlString, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIIOSERVICE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetProtocolHandler(const char *aScheme, nsIProtocolHandler **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetProtocolHandler(aScheme, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetProtocolFlags(const char *aScheme, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetProtocolFlags(aScheme, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NewURI(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIURI **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->NewURI(aSpec, aOriginCharset, aBaseURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NewFileURI(nsIFile *aFile, nsIURI **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->NewFileURI(aFile, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NewChannelFromURI(nsIURI *aURI, nsIChannel **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->NewChannelFromURI(aURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NewChannel(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIChannel **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->NewChannel(aSpec, aOriginCharset, aBaseURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetOffline(PRBool *aOffline) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOffline(aOffline); } \
  NS_SCRIPTABLE NS_IMETHOD SetOffline(PRBool aOffline) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetOffline(aOffline); } \
  NS_SCRIPTABLE NS_IMETHOD AllowPort(PRInt32 aPort, const char *aScheme, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->AllowPort(aPort, aScheme, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ExtractScheme(const nsACString & urlString, nsACString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ExtractScheme(urlString, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsIOService : public nsIIOService
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIIOSERVICE

  nsIOService();

private:
  ~nsIOService();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsIOService, nsIIOService)

nsIOService::nsIOService()
{
  /* member initializers and constructor code */
}

nsIOService::~nsIOService()
{
  /* destructor code */
}

/* nsIProtocolHandler getProtocolHandler (in string aScheme); */
NS_IMETHODIMP nsIOService::GetProtocolHandler(const char *aScheme, nsIProtocolHandler **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* unsigned long getProtocolFlags (in string aScheme); */
NS_IMETHODIMP nsIOService::GetProtocolFlags(const char *aScheme, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIURI newURI (in AUTF8String aSpec, in string aOriginCharset, in nsIURI aBaseURI); */
NS_IMETHODIMP nsIOService::NewURI(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIURI **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIURI newFileURI (in nsIFile aFile); */
NS_IMETHODIMP nsIOService::NewFileURI(nsIFile *aFile, nsIURI **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIChannel newChannelFromURI (in nsIURI aURI); */
NS_IMETHODIMP nsIOService::NewChannelFromURI(nsIURI *aURI, nsIChannel **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIChannel newChannel (in AUTF8String aSpec, in string aOriginCharset, in nsIURI aBaseURI); */
NS_IMETHODIMP nsIOService::NewChannel(const nsACString & aSpec, const char *aOriginCharset, nsIURI *aBaseURI, nsIChannel **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean offline; */
NS_IMETHODIMP nsIOService::GetOffline(PRBool *aOffline)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsIOService::SetOffline(PRBool aOffline)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean allowPort (in long aPort, in string aScheme); */
NS_IMETHODIMP nsIOService::AllowPort(PRInt32 aPort, const char *aScheme, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* ACString extractScheme (in AUTF8String urlString); */
NS_IMETHODIMP nsIOService::ExtractScheme(const nsACString & urlString, nsACString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

/**
 * We send notifications through nsIObserverService with topic
 * NS_IOSERVICE_GOING_OFFLINE_TOPIC and data NS_IOSERVICE_OFFLINE
 * when 'offline' has changed from false to true, and we are about
 * to shut down network services such as DNS. When those
 * services have been shut down, we send a notification with
 * topic NS_IOSERVICE_OFFLINE_STATUS_TOPIC and data
 * NS_IOSERVICE_OFFLINE.
 *
 * When 'offline' changes from true to false, then after
 * network services have been restarted, we send a notification
 * with topic NS_IOSERVICE_OFFLINE_STATUS_TOPIC and data
 * NS_IOSERVICE_ONLINE.
 */
#define NS_IOSERVICE_GOING_OFFLINE_TOPIC  "network:offline-about-to-go-offline"
#define NS_IOSERVICE_OFFLINE_STATUS_TOPIC "network:offline-status-changed"
#define NS_IOSERVICE_OFFLINE              "offline"
#define NS_IOSERVICE_ONLINE               "online"

#endif /* __gen_nsIIOService_h__ */
