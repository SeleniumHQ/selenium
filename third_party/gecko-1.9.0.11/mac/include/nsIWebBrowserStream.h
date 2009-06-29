/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/embedding/browser/webBrowser/nsIWebBrowserStream.idl
 */

#ifndef __gen_nsIWebBrowserStream_h__
#define __gen_nsIWebBrowserStream_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIURI; /* forward declaration */


/* starting interface:    nsIWebBrowserStream */
#define NS_IWEBBROWSERSTREAM_IID_STR "86d02f0e-219b-4cfc-9c88-bd98d2cce0b8"

#define NS_IWEBBROWSERSTREAM_IID \
  {0x86d02f0e, 0x219b, 0x4cfc, \
    { 0x9c, 0x88, 0xbd, 0x98, 0xd2, 0xcc, 0xe0, 0xb8 }}

/**
 * This interface provides a way to stream data to the web browser. This allows
 * loading of data from sources which can not be accessed using URIs and
 * nsIWebNavigation.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebBrowserStream : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBBROWSERSTREAM_IID)

  /**
   * Prepare to load a stream of data. When this function returns successfully,
   * it must be paired by a call to closeStream.
   *
   * @param aBaseURI
   *        The base URI of the data. Must not be null. Relative
   *        URIs will be resolved relative to this URI.
   * @param aContentType
   *        ASCII string giving the content type of the data. If rendering
   *        content of this type is not supported, this method fails.
   *        This string may include a charset declaration, for example:
   *        text/html;charset=ISO-8859-1
   *
   * @throw NS_ERROR_NOT_AVAILABLE
   *        The requested content type is not supported.
   * @throw NS_ERROR_IN_PROGRESS
   *        openStream was called twice without an intermediate closeStream.
   */
  /* void openStream (in nsIURI aBaseURI, in ACString aContentType); */
  NS_SCRIPTABLE NS_IMETHOD OpenStream(nsIURI *aBaseURI, const nsACString & aContentType) = 0;

  /**
   * Append data to this stream.
   * @param aData The data to append
   * @param aLen  Length of the data to append.
   *
   * @note To append more than 4 GB of data, call this method multiple times.
   */
  /* void appendToStream ([array, size_is (aLen), const] in octet aData, in unsigned long aLen); */
  NS_SCRIPTABLE NS_IMETHOD AppendToStream(const PRUint8 *aData, PRUint32 aLen) = 0;

  /**
   * Notifies the browser that all the data has been appended. This may notify
   * the user that the browser is "done loading" in some form.
   *
   * @throw NS_ERROR_UNEXPECTED
   *        This method was called without a preceding openStream.
   */
  /* void closeStream (); */
  NS_SCRIPTABLE NS_IMETHOD CloseStream(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebBrowserStream, NS_IWEBBROWSERSTREAM_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBBROWSERSTREAM \
  NS_SCRIPTABLE NS_IMETHOD OpenStream(nsIURI *aBaseURI, const nsACString & aContentType); \
  NS_SCRIPTABLE NS_IMETHOD AppendToStream(const PRUint8 *aData, PRUint32 aLen); \
  NS_SCRIPTABLE NS_IMETHOD CloseStream(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBBROWSERSTREAM(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenStream(nsIURI *aBaseURI, const nsACString & aContentType) { return _to OpenStream(aBaseURI, aContentType); } \
  NS_SCRIPTABLE NS_IMETHOD AppendToStream(const PRUint8 *aData, PRUint32 aLen) { return _to AppendToStream(aData, aLen); } \
  NS_SCRIPTABLE NS_IMETHOD CloseStream(void) { return _to CloseStream(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBBROWSERSTREAM(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenStream(nsIURI *aBaseURI, const nsACString & aContentType) { return !_to ? NS_ERROR_NULL_POINTER : _to->OpenStream(aBaseURI, aContentType); } \
  NS_SCRIPTABLE NS_IMETHOD AppendToStream(const PRUint8 *aData, PRUint32 aLen) { return !_to ? NS_ERROR_NULL_POINTER : _to->AppendToStream(aData, aLen); } \
  NS_SCRIPTABLE NS_IMETHOD CloseStream(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->CloseStream(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebBrowserStream : public nsIWebBrowserStream
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBBROWSERSTREAM

  nsWebBrowserStream();

private:
  ~nsWebBrowserStream();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebBrowserStream, nsIWebBrowserStream)

nsWebBrowserStream::nsWebBrowserStream()
{
  /* member initializers and constructor code */
}

nsWebBrowserStream::~nsWebBrowserStream()
{
  /* destructor code */
}

/* void openStream (in nsIURI aBaseURI, in ACString aContentType); */
NS_IMETHODIMP nsWebBrowserStream::OpenStream(nsIURI *aBaseURI, const nsACString & aContentType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void appendToStream ([array, size_is (aLen), const] in octet aData, in unsigned long aLen); */
NS_IMETHODIMP nsWebBrowserStream::AppendToStream(const PRUint8 *aData, PRUint32 aLen)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void closeStream (); */
NS_IMETHODIMP nsWebBrowserStream::CloseStream()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIWebBrowserStream_h__ */
