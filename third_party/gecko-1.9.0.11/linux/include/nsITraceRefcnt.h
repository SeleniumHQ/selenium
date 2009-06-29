/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/xpcom/base/nsITraceRefcnt.idl
 */

#ifndef __gen_nsITraceRefcnt_h__
#define __gen_nsITraceRefcnt_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsITraceRefcnt */
#define NS_ITRACEREFCNT_IID_STR "273dc92f-0fe6-4545-96a9-21be77828039"

#define NS_ITRACEREFCNT_IID \
  {0x273dc92f, 0x0fe6, 0x4545, \
    { 0x96, 0xa9, 0x21, 0xbe, 0x77, 0x82, 0x80, 0x39 }}

/**  
 * nsITraceRefcnt is an interface between XPCOM Glue and XPCOM.
 *
 * @status DEPRECATED  Replaced by the NS_Log* functions.
 * @status FROZEN
 */
class NS_NO_VTABLE nsITraceRefcnt : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ITRACEREFCNT_IID)

  /* void logAddRef (in voidPtr aPtr, in nsrefcnt aNewRefcnt, in string aTypeName, in unsigned long aInstanceSize); */
  NS_IMETHOD LogAddRef(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName, PRUint32 aInstanceSize) = 0;

  /* void logRelease (in voidPtr aPtr, in nsrefcnt aNewRefcnt, in string aTypeName); */
  NS_IMETHOD LogRelease(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName) = 0;

  /* void logCtor (in voidPtr aPtr, in string aTypeName, in unsigned long aInstanceSize); */
  NS_IMETHOD LogCtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize) = 0;

  /* void logDtor (in voidPtr aPtr, in string aTypeName, in unsigned long aInstanceSize); */
  NS_IMETHOD LogDtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize) = 0;

  /* void logAddCOMPtr (in voidPtr aPtr, in nsISupports aObject); */
  NS_IMETHOD LogAddCOMPtr(void * aPtr, nsISupports *aObject) = 0;

  /* void logReleaseCOMPtr (in voidPtr aPtr, in nsISupports aObject); */
  NS_IMETHOD LogReleaseCOMPtr(void * aPtr, nsISupports *aObject) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsITraceRefcnt, NS_ITRACEREFCNT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSITRACEREFCNT \
  NS_IMETHOD LogAddRef(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName, PRUint32 aInstanceSize); \
  NS_IMETHOD LogRelease(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName); \
  NS_IMETHOD LogCtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize); \
  NS_IMETHOD LogDtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize); \
  NS_IMETHOD LogAddCOMPtr(void * aPtr, nsISupports *aObject); \
  NS_IMETHOD LogReleaseCOMPtr(void * aPtr, nsISupports *aObject); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSITRACEREFCNT(_to) \
  NS_IMETHOD LogAddRef(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName, PRUint32 aInstanceSize) { return _to LogAddRef(aPtr, aNewRefcnt, aTypeName, aInstanceSize); } \
  NS_IMETHOD LogRelease(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName) { return _to LogRelease(aPtr, aNewRefcnt, aTypeName); } \
  NS_IMETHOD LogCtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize) { return _to LogCtor(aPtr, aTypeName, aInstanceSize); } \
  NS_IMETHOD LogDtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize) { return _to LogDtor(aPtr, aTypeName, aInstanceSize); } \
  NS_IMETHOD LogAddCOMPtr(void * aPtr, nsISupports *aObject) { return _to LogAddCOMPtr(aPtr, aObject); } \
  NS_IMETHOD LogReleaseCOMPtr(void * aPtr, nsISupports *aObject) { return _to LogReleaseCOMPtr(aPtr, aObject); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSITRACEREFCNT(_to) \
  NS_IMETHOD LogAddRef(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName, PRUint32 aInstanceSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->LogAddRef(aPtr, aNewRefcnt, aTypeName, aInstanceSize); } \
  NS_IMETHOD LogRelease(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName) { return !_to ? NS_ERROR_NULL_POINTER : _to->LogRelease(aPtr, aNewRefcnt, aTypeName); } \
  NS_IMETHOD LogCtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->LogCtor(aPtr, aTypeName, aInstanceSize); } \
  NS_IMETHOD LogDtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->LogDtor(aPtr, aTypeName, aInstanceSize); } \
  NS_IMETHOD LogAddCOMPtr(void * aPtr, nsISupports *aObject) { return !_to ? NS_ERROR_NULL_POINTER : _to->LogAddCOMPtr(aPtr, aObject); } \
  NS_IMETHOD LogReleaseCOMPtr(void * aPtr, nsISupports *aObject) { return !_to ? NS_ERROR_NULL_POINTER : _to->LogReleaseCOMPtr(aPtr, aObject); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsTraceRefcnt : public nsITraceRefcnt
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSITRACEREFCNT

  nsTraceRefcnt();

private:
  ~nsTraceRefcnt();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsTraceRefcnt, nsITraceRefcnt)

nsTraceRefcnt::nsTraceRefcnt()
{
  /* member initializers and constructor code */
}

nsTraceRefcnt::~nsTraceRefcnt()
{
  /* destructor code */
}

/* void logAddRef (in voidPtr aPtr, in nsrefcnt aNewRefcnt, in string aTypeName, in unsigned long aInstanceSize); */
NS_IMETHODIMP nsTraceRefcnt::LogAddRef(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName, PRUint32 aInstanceSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void logRelease (in voidPtr aPtr, in nsrefcnt aNewRefcnt, in string aTypeName); */
NS_IMETHODIMP nsTraceRefcnt::LogRelease(void * aPtr, nsrefcnt aNewRefcnt, const char *aTypeName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void logCtor (in voidPtr aPtr, in string aTypeName, in unsigned long aInstanceSize); */
NS_IMETHODIMP nsTraceRefcnt::LogCtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void logDtor (in voidPtr aPtr, in string aTypeName, in unsigned long aInstanceSize); */
NS_IMETHODIMP nsTraceRefcnt::LogDtor(void * aPtr, const char *aTypeName, PRUint32 aInstanceSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void logAddCOMPtr (in voidPtr aPtr, in nsISupports aObject); */
NS_IMETHODIMP nsTraceRefcnt::LogAddCOMPtr(void * aPtr, nsISupports *aObject)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void logReleaseCOMPtr (in voidPtr aPtr, in nsISupports aObject); */
NS_IMETHODIMP nsTraceRefcnt::LogReleaseCOMPtr(void * aPtr, nsISupports *aObject)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsITraceRefcnt_h__ */
