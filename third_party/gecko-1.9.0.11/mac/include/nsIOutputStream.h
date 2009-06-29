/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/xpcom/io/nsIOutputStream.idl
 */

#ifndef __gen_nsIOutputStream_h__
#define __gen_nsIOutputStream_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIOutputStream; /* forward declaration */

class nsIInputStream; /* forward declaration */

/**
 * The signature for the reader function passed to WriteSegments. This 
 * is the "provider" of data that gets written into the stream's buffer.
 *
 * @param aOutStream stream being written to
 * @param aClosure opaque parameter passed to WriteSegments
 * @param aToSegment pointer to memory owned by the output stream
 * @param aFromOffset amount already written (since WriteSegments was called)
 * @param aCount length of toSegment
 * @param aReadCount number of bytes written
 *
 * Implementers should return the following:
 *
 * @return NS_OK and (*aReadCount > 0) if successfully provided some data
 * @return NS_OK and (*aReadCount = 0) or
 * @return <any-error> if not interested in providing any data
 *
 * Errors are never passed to the caller of WriteSegments.
 *
 * @status FROZEN
 */
typedef NS_CALLBACK(nsReadSegmentFun)(nsIOutputStream *aOutStream,
                                      void *aClosure,
                                      char *aToSegment,
                                      PRUint32 aFromOffset,
                                      PRUint32 aCount,
                                      PRUint32 *aReadCount);

/* starting interface:    nsIOutputStream */
#define NS_IOUTPUTSTREAM_IID_STR "0d0acd2a-61b4-11d4-9877-00c04fa0cf4a"

#define NS_IOUTPUTSTREAM_IID \
  {0x0d0acd2a, 0x61b4, 0x11d4, \
    { 0x98, 0x77, 0x00, 0xc0, 0x4f, 0xa0, 0xcf, 0x4a }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIOutputStream : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IOUTPUTSTREAM_IID)

  /**
 * nsIOutputStream
 *
 * An interface describing a writable stream of data.  An output stream may be
 * "blocking" or "non-blocking" (see the IsNonBlocking method).  A blocking
 * output stream may suspend the calling thread in order to satisfy a call to
 * Close, Flush, Write, WriteFrom, or WriteSegments.  A non-blocking output
 * stream, on the other hand, must not block the calling thread of execution.
 *
 * NOTE: blocking output streams are often written to on a background thread to
 * avoid locking up the main application thread.  For this reason, it is
 * generally the case that a blocking output stream should be implemented using
 * thread- safe AddRef and Release.
 *
 * @status FROZEN
 */
/** 
     * Close the stream. Forces the output stream to flush any buffered data.
     *
     * @throws NS_BASE_STREAM_WOULD_BLOCK if unable to flush without blocking 
     *   the calling thread (non-blocking mode only)
     */
  /* void close (); */
  NS_SCRIPTABLE NS_IMETHOD Close(void) = 0;

  /**
     * Flush the stream.
     *
     * @throws NS_BASE_STREAM_WOULD_BLOCK if unable to flush without blocking 
     *   the calling thread (non-blocking mode only)
     */
  /* void flush (); */
  NS_SCRIPTABLE NS_IMETHOD Flush(void) = 0;

  /**
     * Write data into the stream.
     *
     * @param aBuf the buffer containing the data to be written
     * @param aCount the maximum number of bytes to be written
     *
     * @return number of bytes written (may be less than aCount)
     *
     * @throws NS_BASE_STREAM_WOULD_BLOCK if writing to the output stream would
     *   block the calling thread (non-blocking mode only)
     * @throws <other-error> on failure
     */
  /* unsigned long write (in string aBuf, in unsigned long aCount); */
  NS_SCRIPTABLE NS_IMETHOD Write(const char *aBuf, PRUint32 aCount, PRUint32 *_retval) = 0;

  /**
     * Writes data into the stream from an input stream.
     *
     * @param aFromStream the stream containing the data to be written
     * @param aCount the maximum number of bytes to be written
     *
     * @return number of bytes written (may be less than aCount)
     *
     * @throws NS_BASE_STREAM_WOULD_BLOCK if writing to the output stream would
     *    block the calling thread (non-blocking mode only)
     * @throws <other-error> on failure
     *
     * NOTE: This method is defined by this interface in order to allow the
     * output stream to efficiently copy the data from the input stream into
     * its internal buffer (if any). If this method was provided as an external
     * facility, a separate char* buffer would need to be used in order to call
     * the output stream's other Write method.
     */
  /* unsigned long writeFrom (in nsIInputStream aFromStream, in unsigned long aCount); */
  NS_SCRIPTABLE NS_IMETHOD WriteFrom(nsIInputStream *aFromStream, PRUint32 aCount, PRUint32 *_retval) = 0;

  /**
     * Low-level write method that has access to the stream's underlying buffer.
     * The reader function may be called multiple times for segmented buffers.
     * WriteSegments is expected to keep calling the reader until either there
     * is nothing left to write or the reader returns an error.  WriteSegments
     * should not call the reader with zero bytes to provide.
     *
     * @param aReader the "provider" of the data to be written
     * @param aClosure opaque parameter passed to reader
     * @param aCount the maximum number of bytes to be written
     *
     * @return number of bytes written (may be less than aCount)
     *
     * @throws NS_BASE_STREAM_WOULD_BLOCK if writing to the output stream would
     *    block the calling thread (non-blocking mode only)
     * @throws NS_ERROR_NOT_IMPLEMENTED if the stream has no underlying buffer
     * @throws <other-error> on failure
     *
     * NOTE: this function may be unimplemented if a stream has no underlying
     * buffer (e.g., socket output stream).
     */
  /* [noscript] unsigned long writeSegments (in nsReadSegmentFun aReader, in voidPtr aClosure, in unsigned long aCount); */
  NS_IMETHOD WriteSegments(nsReadSegmentFun aReader, void * aClosure, PRUint32 aCount, PRUint32 *_retval) = 0;

  /**
     * @return true if stream is non-blocking
     *
     * NOTE: writing to a blocking output stream will block the calling thread
     * until all given data can be consumed by the stream.
     *
     * NOTE: a non-blocking output stream may implement nsIAsyncOutputStream to
     * provide consumers with a way to wait for the stream to accept more data
     * once its write method is unable to accept any data without blocking.
     */
  /* boolean isNonBlocking (); */
  NS_SCRIPTABLE NS_IMETHOD IsNonBlocking(PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIOutputStream, NS_IOUTPUTSTREAM_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIOUTPUTSTREAM \
  NS_SCRIPTABLE NS_IMETHOD Close(void); \
  NS_SCRIPTABLE NS_IMETHOD Flush(void); \
  NS_SCRIPTABLE NS_IMETHOD Write(const char *aBuf, PRUint32 aCount, PRUint32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD WriteFrom(nsIInputStream *aFromStream, PRUint32 aCount, PRUint32 *_retval); \
  NS_IMETHOD WriteSegments(nsReadSegmentFun aReader, void * aClosure, PRUint32 aCount, PRUint32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsNonBlocking(PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIOUTPUTSTREAM(_to) \
  NS_SCRIPTABLE NS_IMETHOD Close(void) { return _to Close(); } \
  NS_SCRIPTABLE NS_IMETHOD Flush(void) { return _to Flush(); } \
  NS_SCRIPTABLE NS_IMETHOD Write(const char *aBuf, PRUint32 aCount, PRUint32 *_retval) { return _to Write(aBuf, aCount, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD WriteFrom(nsIInputStream *aFromStream, PRUint32 aCount, PRUint32 *_retval) { return _to WriteFrom(aFromStream, aCount, _retval); } \
  NS_IMETHOD WriteSegments(nsReadSegmentFun aReader, void * aClosure, PRUint32 aCount, PRUint32 *_retval) { return _to WriteSegments(aReader, aClosure, aCount, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsNonBlocking(PRBool *_retval) { return _to IsNonBlocking(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIOUTPUTSTREAM(_to) \
  NS_SCRIPTABLE NS_IMETHOD Close(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Close(); } \
  NS_SCRIPTABLE NS_IMETHOD Flush(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Flush(); } \
  NS_SCRIPTABLE NS_IMETHOD Write(const char *aBuf, PRUint32 aCount, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Write(aBuf, aCount, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD WriteFrom(nsIInputStream *aFromStream, PRUint32 aCount, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->WriteFrom(aFromStream, aCount, _retval); } \
  NS_IMETHOD WriteSegments(nsReadSegmentFun aReader, void * aClosure, PRUint32 aCount, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->WriteSegments(aReader, aClosure, aCount, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsNonBlocking(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsNonBlocking(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsOutputStream : public nsIOutputStream
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIOUTPUTSTREAM

  nsOutputStream();

private:
  ~nsOutputStream();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsOutputStream, nsIOutputStream)

nsOutputStream::nsOutputStream()
{
  /* member initializers and constructor code */
}

nsOutputStream::~nsOutputStream()
{
  /* destructor code */
}

/* void close (); */
NS_IMETHODIMP nsOutputStream::Close()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void flush (); */
NS_IMETHODIMP nsOutputStream::Flush()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* unsigned long write (in string aBuf, in unsigned long aCount); */
NS_IMETHODIMP nsOutputStream::Write(const char *aBuf, PRUint32 aCount, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* unsigned long writeFrom (in nsIInputStream aFromStream, in unsigned long aCount); */
NS_IMETHODIMP nsOutputStream::WriteFrom(nsIInputStream *aFromStream, PRUint32 aCount, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] unsigned long writeSegments (in nsReadSegmentFun aReader, in voidPtr aClosure, in unsigned long aCount); */
NS_IMETHODIMP nsOutputStream::WriteSegments(nsReadSegmentFun aReader, void * aClosure, PRUint32 aCount, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isNonBlocking (); */
NS_IMETHODIMP nsOutputStream::IsNonBlocking(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIOutputStream_h__ */
