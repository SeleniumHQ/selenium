/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/netwerk/base/public/nsIURI.idl
 */

#ifndef __gen_nsIURI_h__
#define __gen_nsIURI_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
#undef GetPort  // XXX Windows!
#undef SetPort  // XXX Windows!

/* starting interface:    nsIURI */
#define NS_IURI_IID_STR "07a22cc0-0ce5-11d3-9331-00104ba0fd40"

#define NS_IURI_IID \
  {0x07a22cc0, 0x0ce5, 0x11d3, \
    { 0x93, 0x31, 0x00, 0x10, 0x4b, 0xa0, 0xfd, 0x40 }}

/**
 * URIs are essentially structured names for things -- anything. This interface
 * provides accessors to set and query the most basic components of an URI.
 * Subclasses, including nsIURL, impose greater structure on the URI.
 *
 * This interface follows Tim Berners-Lee's URI spec (RFC2396) [1], where the
 * basic URI components are defined as such:
 * <pre> 
 *      ftp://username:password@hostname:portnumber/pathname
 *      \ /   \               / \      / \        /\       /
 *       -     ---------------   ------   --------  -------
 *       |            |             |        |         |
 *       |            |             |        |        Path
 *       |            |             |       Port         
 *       |            |            Host      /
 *       |         UserPass                 /
 *     Scheme                              /
 *       \                                /
 *        --------------------------------
 *                       |
 *                    PrePath
 * </pre>
 * The definition of the URI components has been extended to allow for
 * internationalized domain names [2] and the more generic IRI structure [3].
 *
 * [1] http://www.ietf.org/rfc/rfc2396.txt
 * [2] http://www.ietf.org/internet-drafts/draft-ietf-idn-idna-06.txt
 * [3] http://www.ietf.org/internet-drafts/draft-masinter-url-i18n-08.txt
 */
/**
 * nsIURI - interface for an uniform resource identifier w/ i18n support.
 *
 * AUTF8String attributes may contain unescaped UTF-8 characters.
 * Consumers should be careful to escape the UTF-8 strings as necessary, but
 * should always try to "display" the UTF-8 version as provided by this
 * interface.
 *
 * AUTF8String attributes may also contain escaped characters.
 * 
 * Unescaping URI segments is unadvised unless there is intimate
 * knowledge of the underlying charset or there is no plan to display (or
 * otherwise enforce a charset on) the resulting URI substring.
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIURI : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IURI_IID)

  /************************************************************************
     * The URI is broken down into the following principal components:
     */
/**
     * Returns a string representation of the URI. Setting the spec causes
     * the new spec to be parsed, initializing the URI.
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String spec; */
  NS_SCRIPTABLE NS_IMETHOD GetSpec(nsACString & aSpec) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSpec(const nsACString & aSpec) = 0;

  /**
     * The prePath (eg. scheme://user:password@host:port) returns the string
     * before the path.  This is useful for authentication or managing sessions.
     *
     * Some characters may be escaped.
     */
  /* readonly attribute AUTF8String prePath; */
  NS_SCRIPTABLE NS_IMETHOD GetPrePath(nsACString & aPrePath) = 0;

  /**
     * The Scheme is the protocol to which this URI refers.  The scheme is
     * restricted to the US-ASCII charset per RFC2396.
     */
  /* attribute ACString scheme; */
  NS_SCRIPTABLE NS_IMETHOD GetScheme(nsACString & aScheme) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetScheme(const nsACString & aScheme) = 0;

  /**
     * The username:password (or username only if value doesn't contain a ':')
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String userPass; */
  NS_SCRIPTABLE NS_IMETHOD GetUserPass(nsACString & aUserPass) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetUserPass(const nsACString & aUserPass) = 0;

  /**
     * The optional username and password, assuming the preHost consists of
     * username:password.
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String username; */
  NS_SCRIPTABLE NS_IMETHOD GetUsername(nsACString & aUsername) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetUsername(const nsACString & aUsername) = 0;

  /* attribute AUTF8String password; */
  NS_SCRIPTABLE NS_IMETHOD GetPassword(nsACString & aPassword) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPassword(const nsACString & aPassword) = 0;

  /**
     * The host:port (or simply the host, if port == -1).
     *
     * Characters are NOT escaped.
     */
  /* attribute AUTF8String hostPort; */
  NS_SCRIPTABLE NS_IMETHOD GetHostPort(nsACString & aHostPort) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHostPort(const nsACString & aHostPort) = 0;

  /**
     * The host is the internet domain name to which this URI refers.  It could
     * be an IPv4 (or IPv6) address literal.  If supported, it could be a
     * non-ASCII internationalized domain name.
     *
     * Characters are NOT escaped.
     */
  /* attribute AUTF8String host; */
  NS_SCRIPTABLE NS_IMETHOD GetHost(nsACString & aHost) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHost(const nsACString & aHost) = 0;

  /**
     * A port value of -1 corresponds to the protocol's default port (eg. -1
     * implies port 80 for http URIs).
     */
  /* attribute long port; */
  NS_SCRIPTABLE NS_IMETHOD GetPort(PRInt32 *aPort) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPort(PRInt32 aPort) = 0;

  /**
     * The path, typically including at least a leading '/' (but may also be
     * empty, depending on the protocol).
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String path; */
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsACString & aPath) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPath(const nsACString & aPath) = 0;

  /************************************************************************
     * An URI supports the following methods:
     */
/**
     * URI equivalence test (not a strict string comparison).
     *
     * eg. http://foo.com:80/ == http://foo.com/
     */
  /* boolean equals (in nsIURI other); */
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIURI *other, PRBool *_retval) = 0;

  /**
     * An optimization to do scheme checks without requiring the users of nsIURI
     * to GetScheme, thereby saving extra allocating and freeing. Returns true if
     * the schemes match (case ignored).
     */
  /* boolean schemeIs (in string scheme); */
  NS_SCRIPTABLE NS_IMETHOD SchemeIs(const char *scheme, PRBool *_retval) = 0;

  /**
     * Clones the current URI.  For some protocols, this is more than just an
     * optimization.  For example, under MacOS, the spec of a file URL does not
     * necessarily uniquely identify a file since two volumes could share the
     * same name.
     */
  /* nsIURI clone (); */
  NS_SCRIPTABLE NS_IMETHOD Clone(nsIURI **_retval) = 0;

  /**
     * This method resolves a relative string into an absolute URI string,
     * using this URI as the base. 
     *
     * NOTE: some implementations may have no concept of a relative URI.
     */
  /* AUTF8String resolve (in AUTF8String relativePath); */
  NS_SCRIPTABLE NS_IMETHOD Resolve(const nsACString & relativePath, nsACString & _retval) = 0;

  /************************************************************************
     * Additional attributes:
     */
/**
     * The URI spec with an ASCII compatible encoding.  Host portion follows
     * the IDNA draft spec.  Other parts are URL-escaped per the rules of
     * RFC2396.  The result is strictly ASCII.
     */
  /* readonly attribute ACString asciiSpec; */
  NS_SCRIPTABLE NS_IMETHOD GetAsciiSpec(nsACString & aAsciiSpec) = 0;

  /**
     * The URI host with an ASCII compatible encoding.  Follows the IDNA
     * draft spec for converting internationalized domain names (UTF-8) to
     * ASCII for compatibility with existing internet infrasture.
     */
  /* readonly attribute ACString asciiHost; */
  NS_SCRIPTABLE NS_IMETHOD GetAsciiHost(nsACString & aAsciiHost) = 0;

  /**
     * The charset of the document from which this URI originated.  An empty
     * value implies UTF-8.
     *
     * If this value is something other than UTF-8 then the URI components
     * (e.g., spec, prePath, username, etc.) will all be fully URL-escaped.
     * Otherwise, the URI components may contain unescaped multibyte UTF-8
     * characters.
     */
  /* readonly attribute ACString originCharset; */
  NS_SCRIPTABLE NS_IMETHOD GetOriginCharset(nsACString & aOriginCharset) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIURI, NS_IURI_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIURI \
  NS_SCRIPTABLE NS_IMETHOD GetSpec(nsACString & aSpec); \
  NS_SCRIPTABLE NS_IMETHOD SetSpec(const nsACString & aSpec); \
  NS_SCRIPTABLE NS_IMETHOD GetPrePath(nsACString & aPrePath); \
  NS_SCRIPTABLE NS_IMETHOD GetScheme(nsACString & aScheme); \
  NS_SCRIPTABLE NS_IMETHOD SetScheme(const nsACString & aScheme); \
  NS_SCRIPTABLE NS_IMETHOD GetUserPass(nsACString & aUserPass); \
  NS_SCRIPTABLE NS_IMETHOD SetUserPass(const nsACString & aUserPass); \
  NS_SCRIPTABLE NS_IMETHOD GetUsername(nsACString & aUsername); \
  NS_SCRIPTABLE NS_IMETHOD SetUsername(const nsACString & aUsername); \
  NS_SCRIPTABLE NS_IMETHOD GetPassword(nsACString & aPassword); \
  NS_SCRIPTABLE NS_IMETHOD SetPassword(const nsACString & aPassword); \
  NS_SCRIPTABLE NS_IMETHOD GetHostPort(nsACString & aHostPort); \
  NS_SCRIPTABLE NS_IMETHOD SetHostPort(const nsACString & aHostPort); \
  NS_SCRIPTABLE NS_IMETHOD GetHost(nsACString & aHost); \
  NS_SCRIPTABLE NS_IMETHOD SetHost(const nsACString & aHost); \
  NS_SCRIPTABLE NS_IMETHOD GetPort(PRInt32 *aPort); \
  NS_SCRIPTABLE NS_IMETHOD SetPort(PRInt32 aPort); \
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsACString & aPath); \
  NS_SCRIPTABLE NS_IMETHOD SetPath(const nsACString & aPath); \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIURI *other, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD SchemeIs(const char *scheme, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Clone(nsIURI **_retval); \
  NS_SCRIPTABLE NS_IMETHOD Resolve(const nsACString & relativePath, nsACString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD GetAsciiSpec(nsACString & aAsciiSpec); \
  NS_SCRIPTABLE NS_IMETHOD GetAsciiHost(nsACString & aAsciiHost); \
  NS_SCRIPTABLE NS_IMETHOD GetOriginCharset(nsACString & aOriginCharset); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIURI(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetSpec(nsACString & aSpec) { return _to GetSpec(aSpec); } \
  NS_SCRIPTABLE NS_IMETHOD SetSpec(const nsACString & aSpec) { return _to SetSpec(aSpec); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrePath(nsACString & aPrePath) { return _to GetPrePath(aPrePath); } \
  NS_SCRIPTABLE NS_IMETHOD GetScheme(nsACString & aScheme) { return _to GetScheme(aScheme); } \
  NS_SCRIPTABLE NS_IMETHOD SetScheme(const nsACString & aScheme) { return _to SetScheme(aScheme); } \
  NS_SCRIPTABLE NS_IMETHOD GetUserPass(nsACString & aUserPass) { return _to GetUserPass(aUserPass); } \
  NS_SCRIPTABLE NS_IMETHOD SetUserPass(const nsACString & aUserPass) { return _to SetUserPass(aUserPass); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsername(nsACString & aUsername) { return _to GetUsername(aUsername); } \
  NS_SCRIPTABLE NS_IMETHOD SetUsername(const nsACString & aUsername) { return _to SetUsername(aUsername); } \
  NS_SCRIPTABLE NS_IMETHOD GetPassword(nsACString & aPassword) { return _to GetPassword(aPassword); } \
  NS_SCRIPTABLE NS_IMETHOD SetPassword(const nsACString & aPassword) { return _to SetPassword(aPassword); } \
  NS_SCRIPTABLE NS_IMETHOD GetHostPort(nsACString & aHostPort) { return _to GetHostPort(aHostPort); } \
  NS_SCRIPTABLE NS_IMETHOD SetHostPort(const nsACString & aHostPort) { return _to SetHostPort(aHostPort); } \
  NS_SCRIPTABLE NS_IMETHOD GetHost(nsACString & aHost) { return _to GetHost(aHost); } \
  NS_SCRIPTABLE NS_IMETHOD SetHost(const nsACString & aHost) { return _to SetHost(aHost); } \
  NS_SCRIPTABLE NS_IMETHOD GetPort(PRInt32 *aPort) { return _to GetPort(aPort); } \
  NS_SCRIPTABLE NS_IMETHOD SetPort(PRInt32 aPort) { return _to SetPort(aPort); } \
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsACString & aPath) { return _to GetPath(aPath); } \
  NS_SCRIPTABLE NS_IMETHOD SetPath(const nsACString & aPath) { return _to SetPath(aPath); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIURI *other, PRBool *_retval) { return _to Equals(other, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SchemeIs(const char *scheme, PRBool *_retval) { return _to SchemeIs(scheme, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Clone(nsIURI **_retval) { return _to Clone(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD Resolve(const nsACString & relativePath, nsACString & _retval) { return _to Resolve(relativePath, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetAsciiSpec(nsACString & aAsciiSpec) { return _to GetAsciiSpec(aAsciiSpec); } \
  NS_SCRIPTABLE NS_IMETHOD GetAsciiHost(nsACString & aAsciiHost) { return _to GetAsciiHost(aAsciiHost); } \
  NS_SCRIPTABLE NS_IMETHOD GetOriginCharset(nsACString & aOriginCharset) { return _to GetOriginCharset(aOriginCharset); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIURI(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetSpec(nsACString & aSpec) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSpec(aSpec); } \
  NS_SCRIPTABLE NS_IMETHOD SetSpec(const nsACString & aSpec) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSpec(aSpec); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrePath(nsACString & aPrePath) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPrePath(aPrePath); } \
  NS_SCRIPTABLE NS_IMETHOD GetScheme(nsACString & aScheme) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScheme(aScheme); } \
  NS_SCRIPTABLE NS_IMETHOD SetScheme(const nsACString & aScheme) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetScheme(aScheme); } \
  NS_SCRIPTABLE NS_IMETHOD GetUserPass(nsACString & aUserPass) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUserPass(aUserPass); } \
  NS_SCRIPTABLE NS_IMETHOD SetUserPass(const nsACString & aUserPass) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUserPass(aUserPass); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsername(nsACString & aUsername) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUsername(aUsername); } \
  NS_SCRIPTABLE NS_IMETHOD SetUsername(const nsACString & aUsername) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUsername(aUsername); } \
  NS_SCRIPTABLE NS_IMETHOD GetPassword(nsACString & aPassword) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPassword(aPassword); } \
  NS_SCRIPTABLE NS_IMETHOD SetPassword(const nsACString & aPassword) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPassword(aPassword); } \
  NS_SCRIPTABLE NS_IMETHOD GetHostPort(nsACString & aHostPort) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHostPort(aHostPort); } \
  NS_SCRIPTABLE NS_IMETHOD SetHostPort(const nsACString & aHostPort) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHostPort(aHostPort); } \
  NS_SCRIPTABLE NS_IMETHOD GetHost(nsACString & aHost) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHost(aHost); } \
  NS_SCRIPTABLE NS_IMETHOD SetHost(const nsACString & aHost) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHost(aHost); } \
  NS_SCRIPTABLE NS_IMETHOD GetPort(PRInt32 *aPort) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPort(aPort); } \
  NS_SCRIPTABLE NS_IMETHOD SetPort(PRInt32 aPort) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPort(aPort); } \
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsACString & aPath) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPath(aPath); } \
  NS_SCRIPTABLE NS_IMETHOD SetPath(const nsACString & aPath) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPath(aPath); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIURI *other, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Equals(other, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SchemeIs(const char *scheme, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->SchemeIs(scheme, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Clone(nsIURI **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Clone(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD Resolve(const nsACString & relativePath, nsACString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Resolve(relativePath, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetAsciiSpec(nsACString & aAsciiSpec) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAsciiSpec(aAsciiSpec); } \
  NS_SCRIPTABLE NS_IMETHOD GetAsciiHost(nsACString & aAsciiHost) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAsciiHost(aAsciiHost); } \
  NS_SCRIPTABLE NS_IMETHOD GetOriginCharset(nsACString & aOriginCharset) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOriginCharset(aOriginCharset); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsURI : public nsIURI
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIURI

  nsURI();

private:
  ~nsURI();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsURI, nsIURI)

nsURI::nsURI()
{
  /* member initializers and constructor code */
}

nsURI::~nsURI()
{
  /* destructor code */
}

/* attribute AUTF8String spec; */
NS_IMETHODIMP nsURI::GetSpec(nsACString & aSpec)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURI::SetSpec(const nsACString & aSpec)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AUTF8String prePath; */
NS_IMETHODIMP nsURI::GetPrePath(nsACString & aPrePath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute ACString scheme; */
NS_IMETHODIMP nsURI::GetScheme(nsACString & aScheme)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURI::SetScheme(const nsACString & aScheme)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String userPass; */
NS_IMETHODIMP nsURI::GetUserPass(nsACString & aUserPass)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURI::SetUserPass(const nsACString & aUserPass)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String username; */
NS_IMETHODIMP nsURI::GetUsername(nsACString & aUsername)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURI::SetUsername(const nsACString & aUsername)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String password; */
NS_IMETHODIMP nsURI::GetPassword(nsACString & aPassword)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURI::SetPassword(const nsACString & aPassword)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String hostPort; */
NS_IMETHODIMP nsURI::GetHostPort(nsACString & aHostPort)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURI::SetHostPort(const nsACString & aHostPort)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String host; */
NS_IMETHODIMP nsURI::GetHost(nsACString & aHost)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURI::SetHost(const nsACString & aHost)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long port; */
NS_IMETHODIMP nsURI::GetPort(PRInt32 *aPort)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURI::SetPort(PRInt32 aPort)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String path; */
NS_IMETHODIMP nsURI::GetPath(nsACString & aPath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURI::SetPath(const nsACString & aPath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean equals (in nsIURI other); */
NS_IMETHODIMP nsURI::Equals(nsIURI *other, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean schemeIs (in string scheme); */
NS_IMETHODIMP nsURI::SchemeIs(const char *scheme, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIURI clone (); */
NS_IMETHODIMP nsURI::Clone(nsIURI **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* AUTF8String resolve (in AUTF8String relativePath); */
NS_IMETHODIMP nsURI::Resolve(const nsACString & relativePath, nsACString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute ACString asciiSpec; */
NS_IMETHODIMP nsURI::GetAsciiSpec(nsACString & aAsciiSpec)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute ACString asciiHost; */
NS_IMETHODIMP nsURI::GetAsciiHost(nsACString & aAsciiHost)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute ACString originCharset; */
NS_IMETHODIMP nsURI::GetOriginCharset(nsACString & aOriginCharset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIURI_h__ */
