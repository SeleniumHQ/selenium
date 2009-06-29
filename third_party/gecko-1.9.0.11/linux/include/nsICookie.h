/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/netwerk/cookie/public/nsICookie.idl
 */

#ifndef __gen_nsICookie_h__
#define __gen_nsICookie_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
/** 
 * An optional interface for accessing the HTTP or
 * javascript cookie object
 * 
 * @status FROZEN
 */
typedef PRInt32 nsCookieStatus;

typedef PRInt32 nsCookiePolicy;


/* starting interface:    nsICookie */
#define NS_ICOOKIE_IID_STR "e9fcb9a4-d376-458f-b720-e65e7df593bc"

#define NS_ICOOKIE_IID \
  {0xe9fcb9a4, 0xd376, 0x458f, \
    { 0xb7, 0x20, 0xe6, 0x5e, 0x7d, 0xf5, 0x93, 0xbc }}

class NS_NO_VTABLE NS_SCRIPTABLE nsICookie : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ICOOKIE_IID)

  /**
     * the name of the cookie
     */
  /* readonly attribute ACString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsACString & aName) = 0;

  /**
     * the cookie value
     */
  /* readonly attribute ACString value; */
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsACString & aValue) = 0;

  /**
     * true if the cookie is a domain cookie, false otherwise
     */
  /* readonly attribute boolean isDomain; */
  NS_SCRIPTABLE NS_IMETHOD GetIsDomain(PRBool *aIsDomain) = 0;

  /**
     * the host (possibly fully qualified) of the cookie
     */
  /* readonly attribute AUTF8String host; */
  NS_SCRIPTABLE NS_IMETHOD GetHost(nsACString & aHost) = 0;

  /**
     * the path pertaining to the cookie
     */
  /* readonly attribute AUTF8String path; */
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsACString & aPath) = 0;

  /**
     * true if the cookie was transmitted over ssl, false otherwise
     */
  /* readonly attribute boolean isSecure; */
  NS_SCRIPTABLE NS_IMETHOD GetIsSecure(PRBool *aIsSecure) = 0;

  /**
     * @DEPRECATED use nsICookie2.expiry and nsICookie2.isSession instead.
     *
     * expiration time in seconds since midnight (00:00:00), January 1, 1970 UTC.
     * expires = 0 represents a session cookie.
     * expires = 1 represents an expiration time earlier than Jan 1, 1970.
     */
  /* readonly attribute PRUint64 expires; */
  NS_SCRIPTABLE NS_IMETHOD GetExpires(PRUint64 *aExpires) = 0;

  /**
     * @DEPRECATED status implementation will return STATUS_UNKNOWN in all cases.
     */
  enum { STATUS_UNKNOWN = 0 };

  enum { STATUS_ACCEPTED = 1 };

  enum { STATUS_DOWNGRADED = 2 };

  enum { STATUS_FLAGGED = 3 };

  enum { STATUS_REJECTED = 4 };

  /* readonly attribute nsCookieStatus status; */
  NS_SCRIPTABLE NS_IMETHOD GetStatus(nsCookieStatus *aStatus) = 0;

  /**
     * @DEPRECATED policy implementation will return POLICY_UNKNOWN in all cases.
     */
  enum { POLICY_UNKNOWN = 0 };

  enum { POLICY_NONE = 1 };

  enum { POLICY_NO_CONSENT = 2 };

  enum { POLICY_IMPLICIT_CONSENT = 3 };

  enum { POLICY_EXPLICIT_CONSENT = 4 };

  enum { POLICY_NO_II = 5 };

  /* readonly attribute nsCookiePolicy policy; */
  NS_SCRIPTABLE NS_IMETHOD GetPolicy(nsCookiePolicy *aPolicy) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsICookie, NS_ICOOKIE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSICOOKIE \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsACString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsACString & aValue); \
  NS_SCRIPTABLE NS_IMETHOD GetIsDomain(PRBool *aIsDomain); \
  NS_SCRIPTABLE NS_IMETHOD GetHost(nsACString & aHost); \
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsACString & aPath); \
  NS_SCRIPTABLE NS_IMETHOD GetIsSecure(PRBool *aIsSecure); \
  NS_SCRIPTABLE NS_IMETHOD GetExpires(PRUint64 *aExpires); \
  NS_SCRIPTABLE NS_IMETHOD GetStatus(nsCookieStatus *aStatus); \
  NS_SCRIPTABLE NS_IMETHOD GetPolicy(nsCookiePolicy *aPolicy); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSICOOKIE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsACString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsACString & aValue) { return _to GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsDomain(PRBool *aIsDomain) { return _to GetIsDomain(aIsDomain); } \
  NS_SCRIPTABLE NS_IMETHOD GetHost(nsACString & aHost) { return _to GetHost(aHost); } \
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsACString & aPath) { return _to GetPath(aPath); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsSecure(PRBool *aIsSecure) { return _to GetIsSecure(aIsSecure); } \
  NS_SCRIPTABLE NS_IMETHOD GetExpires(PRUint64 *aExpires) { return _to GetExpires(aExpires); } \
  NS_SCRIPTABLE NS_IMETHOD GetStatus(nsCookieStatus *aStatus) { return _to GetStatus(aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD GetPolicy(nsCookiePolicy *aPolicy) { return _to GetPolicy(aPolicy); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSICOOKIE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsACString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsACString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsDomain(PRBool *aIsDomain) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsDomain(aIsDomain); } \
  NS_SCRIPTABLE NS_IMETHOD GetHost(nsACString & aHost) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHost(aHost); } \
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsACString & aPath) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPath(aPath); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsSecure(PRBool *aIsSecure) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsSecure(aIsSecure); } \
  NS_SCRIPTABLE NS_IMETHOD GetExpires(PRUint64 *aExpires) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetExpires(aExpires); } \
  NS_SCRIPTABLE NS_IMETHOD GetStatus(nsCookieStatus *aStatus) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetStatus(aStatus); } \
  NS_SCRIPTABLE NS_IMETHOD GetPolicy(nsCookiePolicy *aPolicy) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPolicy(aPolicy); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsCookie : public nsICookie
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSICOOKIE

  nsCookie();

private:
  ~nsCookie();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsCookie, nsICookie)

nsCookie::nsCookie()
{
  /* member initializers and constructor code */
}

nsCookie::~nsCookie()
{
  /* destructor code */
}

/* readonly attribute ACString name; */
NS_IMETHODIMP nsCookie::GetName(nsACString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute ACString value; */
NS_IMETHODIMP nsCookie::GetValue(nsACString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean isDomain; */
NS_IMETHODIMP nsCookie::GetIsDomain(PRBool *aIsDomain)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AUTF8String host; */
NS_IMETHODIMP nsCookie::GetHost(nsACString & aHost)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AUTF8String path; */
NS_IMETHODIMP nsCookie::GetPath(nsACString & aPath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean isSecure; */
NS_IMETHODIMP nsCookie::GetIsSecure(PRBool *aIsSecure)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute PRUint64 expires; */
NS_IMETHODIMP nsCookie::GetExpires(PRUint64 *aExpires)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsCookieStatus status; */
NS_IMETHODIMP nsCookie::GetStatus(nsCookieStatus *aStatus)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsCookiePolicy policy; */
NS_IMETHODIMP nsCookie::GetPolicy(nsCookiePolicy *aPolicy)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsICookie_h__ */
