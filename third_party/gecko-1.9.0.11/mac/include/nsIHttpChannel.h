/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/protocol/http/public/nsIHttpChannel.idl
 */

#ifndef __gen_nsIHttpChannel_h__
#define __gen_nsIHttpChannel_h__


#ifndef __gen_nsIChannel_h__
#include "nsIChannel.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIHttpHeaderVisitor; /* forward declaration */


/* starting interface:    nsIHttpChannel */
#define NS_IHTTPCHANNEL_IID_STR "9277fe09-f0cc-4cd9-bbce-581dd94b0260"

#define NS_IHTTPCHANNEL_IID \
  {0x9277fe09, 0xf0cc, 0x4cd9, \
    { 0xbb, 0xce, 0x58, 0x1d, 0xd9, 0x4b, 0x02, 0x60 }}

/**
 * nsIHttpChannel
 *
 * This interface allows for the modification of HTTP request parameters and
 * the inspection of the resulting HTTP response status and headers when they
 * become available.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIHttpChannel : public nsIChannel {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IHTTPCHANNEL_IID)

  /**************************************************************************
     * REQUEST CONFIGURATION
     *
     * Modifying request parameters after asyncOpen has been called is an error.
     */
/**
     * Set/get the HTTP request method (default is "GET").  Setter is case
     * insensitive; getter returns an uppercase string.
     *
     * This attribute may only be set before the channel is opened.
     *
     * NOTE: The data for a "POST" or "PUT" request can be configured via
     * nsIUploadChannel; however, after setting the upload data, it may be
     * necessary to set the request method explicitly.  The documentation
     * for nsIUploadChannel has further details.
     *
     * @throws NS_ERROR_IN_PROGRESS if set after the channel has been opened.
     */
  /* attribute ACString requestMethod; */
  NS_SCRIPTABLE NS_IMETHOD GetRequestMethod(nsACString & aRequestMethod) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetRequestMethod(const nsACString & aRequestMethod) = 0;

  /**
     * Get/set the HTTP referrer URI.  This is the address (URI) of the
     * resource from which this channel's URI was obtained (see RFC2616 section
     * 14.36).
     * 
     * This attribute may only be set before the channel is opened.
     *
     * NOTE: The channel may silently refuse to set the Referer header if the
     * URI does not pass certain security checks (e.g., a "https://" URL will
     * never be sent as the referrer for a plaintext HTTP request).  The
     * implementation is not required to throw an exception when the referrer
     * URI is rejected.
     *
     * @throws NS_ERROR_IN_PROGRESS if set after the channel has been opened.
     */
  /* attribute nsIURI referrer; */
  NS_SCRIPTABLE NS_IMETHOD GetReferrer(nsIURI * *aReferrer) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetReferrer(nsIURI * aReferrer) = 0;

  /**
     * Get the value of a particular request header.
     *
     * @param aHeader
     *        The case-insensitive name of the request header to query (e.g.,
     *        "Cache-Control").
     *
     * @return the value of the request header.
     * @throws NS_ERROR_NOT_AVAILABLE if the header is not set.
     */
  /* ACString getRequestHeader (in ACString aHeader); */
  NS_SCRIPTABLE NS_IMETHOD GetRequestHeader(const nsACString & aHeader, nsACString & _retval) = 0;

  /**
     * Set the value of a particular request header.
     *
     * This method allows, for example, the cookies module to add "Cookie"
     * headers to the outgoing HTTP request.
     *
     * This method may only be called before the channel is opened.
     *
     * @param aHeader
     *        The case-insensitive name of the request header to set (e.g.,
     *        "Cookie").
     * @param aValue
     *        The request header value to set (e.g., "X=1").
     * @param aMerge
     *        If true, the new header value will be merged with any existing
     *        values for the specified header.  This flag is ignored if the
     *        specified header does not support merging (e.g., the "Content-
     *        Type" header can only have one value).  The list of headers for
     *        which this flag is ignored is an implementation detail.  If this
     *        flag is false, then the header value will be replaced with the
     *        contents of |aValue|.
     *
     * If aValue is empty and aMerge is false, the header will be cleared.
     *
     * @throws NS_ERROR_IN_PROGRESS if called after the channel has been
     *         opened.
     */
  /* void setRequestHeader (in ACString aHeader, in ACString aValue, in boolean aMerge); */
  NS_SCRIPTABLE NS_IMETHOD SetRequestHeader(const nsACString & aHeader, const nsACString & aValue, PRBool aMerge) = 0;

  /**
     * Call this method to visit all request headers.  Calling setRequestHeader
     * while visiting request headers has undefined behavior.  Don't do it!
     *
     * @param aVisitor
     *        the header visitor instance.
     */
  /* void visitRequestHeaders (in nsIHttpHeaderVisitor aVisitor); */
  NS_SCRIPTABLE NS_IMETHOD VisitRequestHeaders(nsIHttpHeaderVisitor *aVisitor) = 0;

  /**
     * This attribute is a hint to the channel to indicate whether or not
     * the underlying HTTP transaction should be allowed to be pipelined
     * with other transactions.  This should be set to FALSE, for example,
     * if the application knows that the corresponding document is likely
     * to be very large.
     *
     * This attribute is true by default, though other factors may prevent
     * pipelining.
     *
     * This attribute may only be set before the channel is opened.
     *
     * @throws NS_ERROR_FAILURE if set after the channel has been opened.
     */
  /* attribute boolean allowPipelining; */
  NS_SCRIPTABLE NS_IMETHOD GetAllowPipelining(PRBool *aAllowPipelining) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAllowPipelining(PRBool aAllowPipelining) = 0;

  /**
     * This attribute specifies the number of redirects this channel is allowed
     * to make.  If zero, the channel will fail to redirect and will generate
     * a NS_ERROR_REDIRECT_LOOP failure status.
     *
     * NOTE: An HTTP redirect results in a new channel being created.  If the
     * new channel supports nsIHttpChannel, then it will be assigned a value
     * to its |redirectionLimit| attribute one less than the value of the
     * redirected channel's |redirectionLimit| attribute.  The initial value
     * for this attribute may be a configurable preference (depending on the
     * implementation).
     */
  /* attribute unsigned long redirectionLimit; */
  NS_SCRIPTABLE NS_IMETHOD GetRedirectionLimit(PRUint32 *aRedirectionLimit) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetRedirectionLimit(PRUint32 aRedirectionLimit) = 0;

  /**************************************************************************
     * RESPONSE INFO
     *
     * Accessing response info before the onStartRequest event is an error.
     */
/**
     * Get the HTTP response code (e.g., 200).
     *
     * @throws NS_ERROR_NOT_AVAILABLE if called before the response
     *         has been received (before onStartRequest).
     */
  /* readonly attribute unsigned long responseStatus; */
  NS_SCRIPTABLE NS_IMETHOD GetResponseStatus(PRUint32 *aResponseStatus) = 0;

  /**
     * Get the HTTP response status text (e.g., "OK").
     *
     * NOTE: This returns the raw (possibly 8-bit) text from the server.  There
     * are no assumptions made about the charset of the returned text.  You
     * have been warned!
     *
     * @throws NS_ERROR_NOT_AVAILABLE if called before the response
     *         has been received (before onStartRequest).
     */
  /* readonly attribute ACString responseStatusText; */
  NS_SCRIPTABLE NS_IMETHOD GetResponseStatusText(nsACString & aResponseStatusText) = 0;

  /**
     * Returns true if the HTTP response code indicates success.  The value of
     * nsIRequest::status will be NS_OK even when processing a 404 response
     * because a 404 response may include a message body that (in some cases)
     * should be shown to the user.
     *
     * Use this attribute to distinguish server error pages from normal pages,
     * instead of comparing the response status manually against the set of
     * valid response codes, if that is required by your application.
     *
     * @throws NS_ERROR_NOT_AVAILABLE if called before the response
     *         has been received (before onStartRequest).
     */
  /* readonly attribute boolean requestSucceeded; */
  NS_SCRIPTABLE NS_IMETHOD GetRequestSucceeded(PRBool *aRequestSucceeded) = 0;

  /**
     * Get the value of a particular response header.
     *
     * @param aHeader
     *        The case-insensitive name of the response header to query (e.g.,
     *        "Set-Cookie").
     *
     * @return the value of the response header.
     *
     * @throws NS_ERROR_NOT_AVAILABLE if called before the response
     *         has been received (before onStartRequest) or if the header is
     *         not set in the response.
     */
  /* ACString getResponseHeader (in ACString header); */
  NS_SCRIPTABLE NS_IMETHOD GetResponseHeader(const nsACString & header, nsACString & _retval) = 0;

  /**
     * Set the value of a particular response header.
     *
     * This method allows, for example, the HTML content sink to inform the HTTP
     * channel about HTTP-EQUIV headers found in HTML <META> tags.
     *
     * @param aHeader
     *        The case-insensitive name of the response header to set (e.g.,
     *        "Cache-control").
     * @param aValue
     *        The response header value to set (e.g., "no-cache").
     * @param aMerge
     *        If true, the new header value will be merged with any existing
     *        values for the specified header.  This flag is ignored if the
     *        specified header does not support merging (e.g., the "Content-
     *        Type" header can only have one value).  The list of headers for
     *        which this flag is ignored is an implementation detail.  If this
     *        flag is false, then the header value will be replaced with the
     *        contents of |aValue|.
     *
     * If aValue is empty and aMerge is false, the header will be cleared.
     * 
     * @throws NS_ERROR_NOT_AVAILABLE if called before the response
     *         has been received (before onStartRequest).
     * @throws NS_ERROR_ILLEGAL_VALUE if changing the value of this response
     *         header is not allowed.
     */
  /* void setResponseHeader (in ACString header, in ACString value, in boolean merge); */
  NS_SCRIPTABLE NS_IMETHOD SetResponseHeader(const nsACString & header, const nsACString & value, PRBool merge) = 0;

  /**
     * Call this method to visit all response headers.  Calling
     * setResponseHeader while visiting response headers has undefined
     * behavior.  Don't do it!
     *
     * @param aVisitor
     *        the header visitor instance.
     *
     * @throws NS_ERROR_NOT_AVAILABLE if called before the response
     *         has been received (before onStartRequest).
     */
  /* void visitResponseHeaders (in nsIHttpHeaderVisitor aVisitor); */
  NS_SCRIPTABLE NS_IMETHOD VisitResponseHeaders(nsIHttpHeaderVisitor *aVisitor) = 0;

  /**
     * Returns true if the server sent a "Cache-Control: no-store" response
     * header.
     *
     * @throws NS_ERROR_NOT_AVAILABLE if called before the response
     *         has been received (before onStartRequest).
     */
  /* boolean isNoStoreResponse (); */
  NS_SCRIPTABLE NS_IMETHOD IsNoStoreResponse(PRBool *_retval) = 0;

  /**
     * Returns true if the server sent the equivalent of a "Cache-control:
     * no-cache" response header.  Equivalent response headers include:
     * "Pragma: no-cache", "Expires: 0", and "Expires" with a date value
     * in the past relative to the value of the "Date" header.
     *
     * @throws NS_ERROR_NOT_AVAILABLE if called before the response
     *         has been received (before onStartRequest).
     */
  /* boolean isNoCacheResponse (); */
  NS_SCRIPTABLE NS_IMETHOD IsNoCacheResponse(PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIHttpChannel, NS_IHTTPCHANNEL_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIHTTPCHANNEL \
  NS_SCRIPTABLE NS_IMETHOD GetRequestMethod(nsACString & aRequestMethod); \
  NS_SCRIPTABLE NS_IMETHOD SetRequestMethod(const nsACString & aRequestMethod); \
  NS_SCRIPTABLE NS_IMETHOD GetReferrer(nsIURI * *aReferrer); \
  NS_SCRIPTABLE NS_IMETHOD SetReferrer(nsIURI * aReferrer); \
  NS_SCRIPTABLE NS_IMETHOD GetRequestHeader(const nsACString & aHeader, nsACString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD SetRequestHeader(const nsACString & aHeader, const nsACString & aValue, PRBool aMerge); \
  NS_SCRIPTABLE NS_IMETHOD VisitRequestHeaders(nsIHttpHeaderVisitor *aVisitor); \
  NS_SCRIPTABLE NS_IMETHOD GetAllowPipelining(PRBool *aAllowPipelining); \
  NS_SCRIPTABLE NS_IMETHOD SetAllowPipelining(PRBool aAllowPipelining); \
  NS_SCRIPTABLE NS_IMETHOD GetRedirectionLimit(PRUint32 *aRedirectionLimit); \
  NS_SCRIPTABLE NS_IMETHOD SetRedirectionLimit(PRUint32 aRedirectionLimit); \
  NS_SCRIPTABLE NS_IMETHOD GetResponseStatus(PRUint32 *aResponseStatus); \
  NS_SCRIPTABLE NS_IMETHOD GetResponseStatusText(nsACString & aResponseStatusText); \
  NS_SCRIPTABLE NS_IMETHOD GetRequestSucceeded(PRBool *aRequestSucceeded); \
  NS_SCRIPTABLE NS_IMETHOD GetResponseHeader(const nsACString & header, nsACString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD SetResponseHeader(const nsACString & header, const nsACString & value, PRBool merge); \
  NS_SCRIPTABLE NS_IMETHOD VisitResponseHeaders(nsIHttpHeaderVisitor *aVisitor); \
  NS_SCRIPTABLE NS_IMETHOD IsNoStoreResponse(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsNoCacheResponse(PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIHTTPCHANNEL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetRequestMethod(nsACString & aRequestMethod) { return _to GetRequestMethod(aRequestMethod); } \
  NS_SCRIPTABLE NS_IMETHOD SetRequestMethod(const nsACString & aRequestMethod) { return _to SetRequestMethod(aRequestMethod); } \
  NS_SCRIPTABLE NS_IMETHOD GetReferrer(nsIURI * *aReferrer) { return _to GetReferrer(aReferrer); } \
  NS_SCRIPTABLE NS_IMETHOD SetReferrer(nsIURI * aReferrer) { return _to SetReferrer(aReferrer); } \
  NS_SCRIPTABLE NS_IMETHOD GetRequestHeader(const nsACString & aHeader, nsACString & _retval) { return _to GetRequestHeader(aHeader, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetRequestHeader(const nsACString & aHeader, const nsACString & aValue, PRBool aMerge) { return _to SetRequestHeader(aHeader, aValue, aMerge); } \
  NS_SCRIPTABLE NS_IMETHOD VisitRequestHeaders(nsIHttpHeaderVisitor *aVisitor) { return _to VisitRequestHeaders(aVisitor); } \
  NS_SCRIPTABLE NS_IMETHOD GetAllowPipelining(PRBool *aAllowPipelining) { return _to GetAllowPipelining(aAllowPipelining); } \
  NS_SCRIPTABLE NS_IMETHOD SetAllowPipelining(PRBool aAllowPipelining) { return _to SetAllowPipelining(aAllowPipelining); } \
  NS_SCRIPTABLE NS_IMETHOD GetRedirectionLimit(PRUint32 *aRedirectionLimit) { return _to GetRedirectionLimit(aRedirectionLimit); } \
  NS_SCRIPTABLE NS_IMETHOD SetRedirectionLimit(PRUint32 aRedirectionLimit) { return _to SetRedirectionLimit(aRedirectionLimit); } \
  NS_SCRIPTABLE NS_IMETHOD GetResponseStatus(PRUint32 *aResponseStatus) { return _to GetResponseStatus(aResponseStatus); } \
  NS_SCRIPTABLE NS_IMETHOD GetResponseStatusText(nsACString & aResponseStatusText) { return _to GetResponseStatusText(aResponseStatusText); } \
  NS_SCRIPTABLE NS_IMETHOD GetRequestSucceeded(PRBool *aRequestSucceeded) { return _to GetRequestSucceeded(aRequestSucceeded); } \
  NS_SCRIPTABLE NS_IMETHOD GetResponseHeader(const nsACString & header, nsACString & _retval) { return _to GetResponseHeader(header, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetResponseHeader(const nsACString & header, const nsACString & value, PRBool merge) { return _to SetResponseHeader(header, value, merge); } \
  NS_SCRIPTABLE NS_IMETHOD VisitResponseHeaders(nsIHttpHeaderVisitor *aVisitor) { return _to VisitResponseHeaders(aVisitor); } \
  NS_SCRIPTABLE NS_IMETHOD IsNoStoreResponse(PRBool *_retval) { return _to IsNoStoreResponse(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsNoCacheResponse(PRBool *_retval) { return _to IsNoCacheResponse(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIHTTPCHANNEL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetRequestMethod(nsACString & aRequestMethod) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRequestMethod(aRequestMethod); } \
  NS_SCRIPTABLE NS_IMETHOD SetRequestMethod(const nsACString & aRequestMethod) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRequestMethod(aRequestMethod); } \
  NS_SCRIPTABLE NS_IMETHOD GetReferrer(nsIURI * *aReferrer) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetReferrer(aReferrer); } \
  NS_SCRIPTABLE NS_IMETHOD SetReferrer(nsIURI * aReferrer) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetReferrer(aReferrer); } \
  NS_SCRIPTABLE NS_IMETHOD GetRequestHeader(const nsACString & aHeader, nsACString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRequestHeader(aHeader, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetRequestHeader(const nsACString & aHeader, const nsACString & aValue, PRBool aMerge) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRequestHeader(aHeader, aValue, aMerge); } \
  NS_SCRIPTABLE NS_IMETHOD VisitRequestHeaders(nsIHttpHeaderVisitor *aVisitor) { return !_to ? NS_ERROR_NULL_POINTER : _to->VisitRequestHeaders(aVisitor); } \
  NS_SCRIPTABLE NS_IMETHOD GetAllowPipelining(PRBool *aAllowPipelining) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAllowPipelining(aAllowPipelining); } \
  NS_SCRIPTABLE NS_IMETHOD SetAllowPipelining(PRBool aAllowPipelining) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAllowPipelining(aAllowPipelining); } \
  NS_SCRIPTABLE NS_IMETHOD GetRedirectionLimit(PRUint32 *aRedirectionLimit) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRedirectionLimit(aRedirectionLimit); } \
  NS_SCRIPTABLE NS_IMETHOD SetRedirectionLimit(PRUint32 aRedirectionLimit) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRedirectionLimit(aRedirectionLimit); } \
  NS_SCRIPTABLE NS_IMETHOD GetResponseStatus(PRUint32 *aResponseStatus) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetResponseStatus(aResponseStatus); } \
  NS_SCRIPTABLE NS_IMETHOD GetResponseStatusText(nsACString & aResponseStatusText) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetResponseStatusText(aResponseStatusText); } \
  NS_SCRIPTABLE NS_IMETHOD GetRequestSucceeded(PRBool *aRequestSucceeded) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRequestSucceeded(aRequestSucceeded); } \
  NS_SCRIPTABLE NS_IMETHOD GetResponseHeader(const nsACString & header, nsACString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetResponseHeader(header, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetResponseHeader(const nsACString & header, const nsACString & value, PRBool merge) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetResponseHeader(header, value, merge); } \
  NS_SCRIPTABLE NS_IMETHOD VisitResponseHeaders(nsIHttpHeaderVisitor *aVisitor) { return !_to ? NS_ERROR_NULL_POINTER : _to->VisitResponseHeaders(aVisitor); } \
  NS_SCRIPTABLE NS_IMETHOD IsNoStoreResponse(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsNoStoreResponse(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsNoCacheResponse(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsNoCacheResponse(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsHttpChannel : public nsIHttpChannel
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIHTTPCHANNEL

  nsHttpChannel();

private:
  ~nsHttpChannel();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsHttpChannel, nsIHttpChannel)

nsHttpChannel::nsHttpChannel()
{
  /* member initializers and constructor code */
}

nsHttpChannel::~nsHttpChannel()
{
  /* destructor code */
}

/* attribute ACString requestMethod; */
NS_IMETHODIMP nsHttpChannel::GetRequestMethod(nsACString & aRequestMethod)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsHttpChannel::SetRequestMethod(const nsACString & aRequestMethod)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIURI referrer; */
NS_IMETHODIMP nsHttpChannel::GetReferrer(nsIURI * *aReferrer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsHttpChannel::SetReferrer(nsIURI * aReferrer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* ACString getRequestHeader (in ACString aHeader); */
NS_IMETHODIMP nsHttpChannel::GetRequestHeader(const nsACString & aHeader, nsACString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setRequestHeader (in ACString aHeader, in ACString aValue, in boolean aMerge); */
NS_IMETHODIMP nsHttpChannel::SetRequestHeader(const nsACString & aHeader, const nsACString & aValue, PRBool aMerge)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void visitRequestHeaders (in nsIHttpHeaderVisitor aVisitor); */
NS_IMETHODIMP nsHttpChannel::VisitRequestHeaders(nsIHttpHeaderVisitor *aVisitor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean allowPipelining; */
NS_IMETHODIMP nsHttpChannel::GetAllowPipelining(PRBool *aAllowPipelining)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsHttpChannel::SetAllowPipelining(PRBool aAllowPipelining)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute unsigned long redirectionLimit; */
NS_IMETHODIMP nsHttpChannel::GetRedirectionLimit(PRUint32 *aRedirectionLimit)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsHttpChannel::SetRedirectionLimit(PRUint32 aRedirectionLimit)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned long responseStatus; */
NS_IMETHODIMP nsHttpChannel::GetResponseStatus(PRUint32 *aResponseStatus)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute ACString responseStatusText; */
NS_IMETHODIMP nsHttpChannel::GetResponseStatusText(nsACString & aResponseStatusText)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean requestSucceeded; */
NS_IMETHODIMP nsHttpChannel::GetRequestSucceeded(PRBool *aRequestSucceeded)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* ACString getResponseHeader (in ACString header); */
NS_IMETHODIMP nsHttpChannel::GetResponseHeader(const nsACString & header, nsACString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setResponseHeader (in ACString header, in ACString value, in boolean merge); */
NS_IMETHODIMP nsHttpChannel::SetResponseHeader(const nsACString & header, const nsACString & value, PRBool merge)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void visitResponseHeaders (in nsIHttpHeaderVisitor aVisitor); */
NS_IMETHODIMP nsHttpChannel::VisitResponseHeaders(nsIHttpHeaderVisitor *aVisitor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isNoStoreResponse (); */
NS_IMETHODIMP nsHttpChannel::IsNoStoreResponse(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isNoCacheResponse (); */
NS_IMETHODIMP nsHttpChannel::IsNoCacheResponse(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIHttpChannel_h__ */
