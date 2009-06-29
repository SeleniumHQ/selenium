/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/base/public/nsIUploadChannel.idl
 */

#ifndef __gen_nsIUploadChannel_h__
#define __gen_nsIUploadChannel_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIInputStream; /* forward declaration */


/* starting interface:    nsIUploadChannel */
#define NS_IUPLOADCHANNEL_IID_STR "ddf633d8-e9a4-439d-ad88-de636fd9bb75"

#define NS_IUPLOADCHANNEL_IID \
  {0xddf633d8, 0xe9a4, 0x439d, \
    { 0xad, 0x88, 0xde, 0x63, 0x6f, 0xd9, 0xbb, 0x75 }}

/**
 * nsIUploadChannel
 *
 * A channel may optionally implement this interface if it supports the
 * notion of uploading a data stream.  The upload stream may only be set
 * prior to the invocation of asyncOpen on the channel.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIUploadChannel : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IUPLOADCHANNEL_IID)

  /**
     * Sets a stream to be uploaded by this channel.
     *
     * Most implementations of this interface require that the stream:
     *   (1) implement threadsafe addRef and release
     *   (2) implement nsIInputStream::readSegments
     *   (3) implement nsISeekableStream::seek
     *
     * History here is that we need to support both streams that already have
     * headers (e.g., Content-Type and Content-Length) information prepended to
     * the stream (by plugins) as well as clients (composer, uploading
     * application) that want to upload data streams without any knowledge of
     * protocol specifications.  For this reason, we have a special meaning
     * for the aContentType parameter (see below).
     * 
     * @param aStream
     *        The stream to be uploaded by this channel.
     * @param aContentType
     *        If aContentType is empty, the protocol will assume that no
     *        content headers are to be added to the uploaded stream and that
     *        any required headers are already encoded in the stream.  In the
     *        case of HTTP, if this parameter is non-empty, then its value will
     *        replace any existing Content-Type header on the HTTP request.
     *        In the case of FTP and FILE, this parameter is ignored.
     * @param aContentLength
     *        A value of -1 indicates that the length of the stream should be
     *        determined by calling the stream's |available| method.
     */
  /* void setUploadStream (in nsIInputStream aStream, in ACString aContentType, in long aContentLength); */
  NS_SCRIPTABLE NS_IMETHOD SetUploadStream(nsIInputStream *aStream, const nsACString & aContentType, PRInt32 aContentLength) = 0;

  /**
     * Get the stream (to be) uploaded by this channel.
     */
  /* readonly attribute nsIInputStream uploadStream; */
  NS_SCRIPTABLE NS_IMETHOD GetUploadStream(nsIInputStream * *aUploadStream) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIUploadChannel, NS_IUPLOADCHANNEL_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIUPLOADCHANNEL \
  NS_SCRIPTABLE NS_IMETHOD SetUploadStream(nsIInputStream *aStream, const nsACString & aContentType, PRInt32 aContentLength); \
  NS_SCRIPTABLE NS_IMETHOD GetUploadStream(nsIInputStream * *aUploadStream); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIUPLOADCHANNEL(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetUploadStream(nsIInputStream *aStream, const nsACString & aContentType, PRInt32 aContentLength) { return _to SetUploadStream(aStream, aContentType, aContentLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetUploadStream(nsIInputStream * *aUploadStream) { return _to GetUploadStream(aUploadStream); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIUPLOADCHANNEL(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetUploadStream(nsIInputStream *aStream, const nsACString & aContentType, PRInt32 aContentLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUploadStream(aStream, aContentType, aContentLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetUploadStream(nsIInputStream * *aUploadStream) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUploadStream(aUploadStream); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsUploadChannel : public nsIUploadChannel
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIUPLOADCHANNEL

  nsUploadChannel();

private:
  ~nsUploadChannel();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsUploadChannel, nsIUploadChannel)

nsUploadChannel::nsUploadChannel()
{
  /* member initializers and constructor code */
}

nsUploadChannel::~nsUploadChannel()
{
  /* destructor code */
}

/* void setUploadStream (in nsIInputStream aStream, in ACString aContentType, in long aContentLength); */
NS_IMETHODIMP nsUploadChannel::SetUploadStream(nsIInputStream *aStream, const nsACString & aContentType, PRInt32 aContentLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIInputStream uploadStream; */
NS_IMETHODIMP nsUploadChannel::GetUploadStream(nsIInputStream * *aUploadStream)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIUploadChannel_h__ */
