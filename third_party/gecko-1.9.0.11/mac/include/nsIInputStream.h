/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/xpcom/io/nsIInputStream.idl
 */

#ifndef __gen_nsIInputStream_h__
#define __gen_nsIInputStream_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIInputStream; /* forward declaration */

/**
 * The signature of the writer function passed to ReadSegments. This
 * is the "consumer" of data that gets read from the stream's buffer.
 *
 * @param aInStream stream being read
 * @param aClosure opaque parameter passed to ReadSegments
 * @param aFromSegment pointer to memory owned by the input stream.  This is
 *                     where the writer function should start consuming data.
 * @param aToOffset amount of data already consumed by this writer during this
 *                  ReadSegments call.  This is also the sum of the aWriteCount
 *                  returns from this writer over the previous invocations of
 *                  the writer by this ReadSegments call.
 * @param aCount Number of bytes available to be read starting at aFromSegment
 * @param [out] aWriteCount number of bytes read by this writer function call
 *
 * Implementers should return the following:
 *
 * @return NS_OK and (*aWriteCount > 0) if consumed some data
 * @return <any-error> if not interested in consuming any data
 *
 * Errors are never passed to the caller of ReadSegments.
 *
 * NOTE: returning NS_OK and (*aWriteCount = 0) has undefined behavior.
 *
 * @status FROZEN
 */
typedef NS_CALLBACK(nsWriteSegmentFun)(nsIInputStream *aInStream,
                                       void *aClosure,
                                       const char *aFromSegment,
                                       PRUint32 aToOffset,
                                       PRUint32 aCount,
                                       PRUint32 *aWriteCount);

/* starting interface:    nsIInputStream */
#define NS_IINPUTSTREAM_IID_STR "fa9c7f6c-61b3-11d4-9877-00c04fa0cf4a"

#define NS_IINPUTSTREAM_IID \
  {0xfa9c7f6c, 0x61b3, 0x11d4, \
    { 0x98, 0x77, 0x00, 0xc0, 0x4f, 0xa0, 0xcf, 0x4a }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIInputStream : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IINPUTSTREAM_IID)

  /**
 * nsIInputStream
 *
 * An interface describing a readable stream of data.  An input stream may be
 * "blocking" or "non-blocking" (see the IsNonBlocking method).  A blocking
 * input stream may suspend the calling thread in order to satisfy a call to
 * Close, Available, Read, or ReadSegments.  A non-blocking input stream, on
 * the other hand, must not block the calling thread of execution.
 *
 * NOTE: blocking input streams are often read on a background thread to avoid
 * locking up the main application thread.  For this reason, it is generally
 * the case that a blocking input stream should be implemented using thread-
 * safe AddRef and Release.
 *
 * @status FROZEN
 */
/** 
     * Close the stream.  This method causes subsequent calls to Read and
     * ReadSegments to return 0 bytes read to indicate end-of-file.  Any
     * subsequent calls to Available should throw NS_BASE_STREAM_CLOSED.
     */
  /* void close (); */
  NS_SCRIPTABLE NS_IMETHOD Close(void) = 0;

  /**
     * Determine number of bytes available in the stream.  A non-blocking
     * stream that does not yet have any data to read should return 0 bytes
     * from this method (i.e., it must not throw the NS_BASE_STREAM_WOULD_BLOCK
     * exception).
     * 
     * In addition to the number of bytes available in the stream, this method
     * also informs the caller of the current status of the stream.  A stream
     * that is closed will throw an exception when this method is called.  That
     * enables the caller to know the condition of the stream before attempting
     * to read from it.  If a stream is at end-of-file, but not closed, then
     * this method should return 0 bytes available.
     *
     * @return number of bytes currently available in the stream, or
     *   PR_UINT32_MAX if the size of the stream exceeds PR_UINT32_MAX.
     *
     * @throws NS_BASE_STREAM_CLOSED if the stream is closed normally or at
     *   end-of-file
     * @throws <other-error> if the stream is closed due to some error
     *   condition
     */
  /* unsigned long available (); */
  NS_SCRIPTABLE NS_IMETHOD Available(PRUint32 *_retval) = 0;

  /** 
     * Read data from the stream.
     *
     * @param aBuf the buffer into which the data is to be read
     * @param aCount the maximum number of bytes to be read
     *
     * @return number of bytes read (may be less than aCount).
     * @return 0 if reached end-of-file
     *
     * @throws NS_BASE_STREAM_WOULD_BLOCK if reading from the input stream would
     *   block the calling thread (non-blocking mode only)
     * @throws <other-error> on failure
     *
     * NOTE: this method should not throw NS_BASE_STREAM_CLOSED.
     */
  /* [noscript] unsigned long read (in charPtr aBuf, in unsigned long aCount); */
  NS_IMETHOD Read(char * aBuf, PRUint32 aCount, PRUint32 *_retval) = 0;

  /**
     * Low-level read method that provides access to the stream's underlying
     * buffer.  The writer function may be called multiple times for segmented
     * buffers.  ReadSegments is expected to keep calling the writer until
     * either there is nothing left to read or the writer returns an error.
     * ReadSegments should not call the writer with zero bytes to consume.
     *
     * @param aWriter the "consumer" of the data to be read
     * @param aClosure opaque parameter passed to writer 
     * @param aCount the maximum number of bytes to be read
     *
     * @return number of bytes read (may be less than aCount)
     * @return 0 if reached end-of-file (or if aWriter refused to consume data)
     *
     * @throws NS_BASE_STREAM_WOULD_BLOCK if reading from the input stream would
     *   block the calling thread (non-blocking mode only)
     * @throws NS_ERROR_NOT_IMPLEMENTED if the stream has no underlying buffer
     * @throws <other-error> on failure
     *
     * NOTE: this function may be unimplemented if a stream has no underlying
     * buffer (e.g., socket input stream).
     *
     * NOTE: this method should not throw NS_BASE_STREAM_CLOSED.
     */
  /* [noscript] unsigned long readSegments (in nsWriteSegmentFun aWriter, in voidPtr aClosure, in unsigned long aCount); */
  NS_IMETHOD ReadSegments(nsWriteSegmentFun aWriter, void * aClosure, PRUint32 aCount, PRUint32 *_retval) = 0;

  /**
     * @return true if stream is non-blocking
     *
     * NOTE: reading from a blocking input stream will block the calling thread
     * until at least one byte of data can be extracted from the stream.
     *
     * NOTE: a non-blocking input stream may implement nsIAsyncInputStream to
     * provide consumers with a way to wait for the stream to have more data
     * once its read method is unable to return any data without blocking.
     */
  /* boolean isNonBlocking (); */
  NS_SCRIPTABLE NS_IMETHOD IsNonBlocking(PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIInputStream, NS_IINPUTSTREAM_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIINPUTSTREAM \
  NS_SCRIPTABLE NS_IMETHOD Close(void); \
  NS_SCRIPTABLE NS_IMETHOD Available(PRUint32 *_retval); \
  NS_IMETHOD Read(char * aBuf, PRUint32 aCount, PRUint32 *_retval); \
  NS_IMETHOD ReadSegments(nsWriteSegmentFun aWriter, void * aClosure, PRUint32 aCount, PRUint32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsNonBlocking(PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIINPUTSTREAM(_to) \
  NS_SCRIPTABLE NS_IMETHOD Close(void) { return _to Close(); } \
  NS_SCRIPTABLE NS_IMETHOD Available(PRUint32 *_retval) { return _to Available(_retval); } \
  NS_IMETHOD Read(char * aBuf, PRUint32 aCount, PRUint32 *_retval) { return _to Read(aBuf, aCount, _retval); } \
  NS_IMETHOD ReadSegments(nsWriteSegmentFun aWriter, void * aClosure, PRUint32 aCount, PRUint32 *_retval) { return _to ReadSegments(aWriter, aClosure, aCount, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsNonBlocking(PRBool *_retval) { return _to IsNonBlocking(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIINPUTSTREAM(_to) \
  NS_SCRIPTABLE NS_IMETHOD Close(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Close(); } \
  NS_SCRIPTABLE NS_IMETHOD Available(PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Available(_retval); } \
  NS_IMETHOD Read(char * aBuf, PRUint32 aCount, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Read(aBuf, aCount, _retval); } \
  NS_IMETHOD ReadSegments(nsWriteSegmentFun aWriter, void * aClosure, PRUint32 aCount, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadSegments(aWriter, aClosure, aCount, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsNonBlocking(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsNonBlocking(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsInputStream : public nsIInputStream
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIINPUTSTREAM

  nsInputStream();

private:
  ~nsInputStream();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsInputStream, nsIInputStream)

nsInputStream::nsInputStream()
{
  /* member initializers and constructor code */
}

nsInputStream::~nsInputStream()
{
  /* destructor code */
}

/* void close (); */
NS_IMETHODIMP nsInputStream::Close()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* unsigned long available (); */
NS_IMETHODIMP nsInputStream::Available(PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] unsigned long read (in charPtr aBuf, in unsigned long aCount); */
NS_IMETHODIMP nsInputStream::Read(char * aBuf, PRUint32 aCount, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] unsigned long readSegments (in nsWriteSegmentFun aWriter, in voidPtr aClosure, in unsigned long aCount); */
NS_IMETHODIMP nsInputStream::ReadSegments(nsWriteSegmentFun aWriter, void * aClosure, PRUint32 aCount, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isNonBlocking (); */
NS_IMETHODIMP nsInputStream::IsNonBlocking(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIInputStream_h__ */
