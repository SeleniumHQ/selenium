/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/base/public/nsIFileURL.idl
 */

#ifndef __gen_nsIFileURL_h__
#define __gen_nsIFileURL_h__


#ifndef __gen_nsIURL_h__
#include "nsIURL.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIFile; /* forward declaration */


/* starting interface:    nsIFileURL */
#define NS_IFILEURL_IID_STR "d26b2e2e-1dd1-11b2-88f3-8545a7ba7949"

#define NS_IFILEURL_IID \
  {0xd26b2e2e, 0x1dd1, 0x11b2, \
    { 0x88, 0xf3, 0x85, 0x45, 0xa7, 0xba, 0x79, 0x49 }}

/**
 * nsIFileURL provides access to the underlying nsIFile object corresponding to
 * an URL.  The URL scheme need not be file:, since other local protocols may
 * map URLs to files (e.g., resource:).
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIFileURL : public nsIURL {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IFILEURL_IID)

  /**
     * Get/Set nsIFile corresponding to this URL.
     *
     *  - Getter returns a reference to an immutable object.  Callers must clone
     *    before attempting to modify the returned nsIFile object.  NOTE: this
     *    constraint might not be enforced at runtime, so beware!!
     *
     *  - Setter clones the nsIFile object (allowing the caller to safely modify
     *    the nsIFile object after setting it on this interface).
     */
  /* attribute nsIFile file; */
  NS_SCRIPTABLE NS_IMETHOD GetFile(nsIFile * *aFile) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFile(nsIFile * aFile) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIFileURL, NS_IFILEURL_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIFILEURL \
  NS_SCRIPTABLE NS_IMETHOD GetFile(nsIFile * *aFile); \
  NS_SCRIPTABLE NS_IMETHOD SetFile(nsIFile * aFile); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIFILEURL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetFile(nsIFile * *aFile) { return _to GetFile(aFile); } \
  NS_SCRIPTABLE NS_IMETHOD SetFile(nsIFile * aFile) { return _to SetFile(aFile); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIFILEURL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetFile(nsIFile * *aFile) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFile(aFile); } \
  NS_SCRIPTABLE NS_IMETHOD SetFile(nsIFile * aFile) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFile(aFile); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsFileURL : public nsIFileURL
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIFILEURL

  nsFileURL();

private:
  ~nsFileURL();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsFileURL, nsIFileURL)

nsFileURL::nsFileURL()
{
  /* member initializers and constructor code */
}

nsFileURL::~nsFileURL()
{
  /* destructor code */
}

/* attribute nsIFile file; */
NS_IMETHODIMP nsFileURL::GetFile(nsIFile * *aFile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsFileURL::SetFile(nsIFile * aFile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIFileURL_h__ */
