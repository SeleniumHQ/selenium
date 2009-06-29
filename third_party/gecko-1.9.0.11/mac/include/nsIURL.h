/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/base/public/nsIURL.idl
 */

#ifndef __gen_nsIURL_h__
#define __gen_nsIURL_h__


#ifndef __gen_nsIURI_h__
#include "nsIURI.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIURL */
#define NS_IURL_IID_STR "d6116970-8034-11d3-9399-00104ba0fd40"

#define NS_IURL_IID \
  {0xd6116970, 0x8034, 0x11d3, \
    { 0x93, 0x99, 0x00, 0x10, 0x4b, 0xa0, 0xfd, 0x40 }}

/**
 * The nsIURL interface provides convenience methods that further
 * break down the path portion of nsIURI:
 *
 * http://host/directory/fileBaseName.fileExtension?query
 * http://host/directory/fileBaseName.fileExtension#ref
 * http://host/directory/fileBaseName.fileExtension;param
 *            \          \                       /
 *             \          -----------------------
 *              \                   |          /
 *               \               fileName     /
 *                ----------------------------
 *                            |
 *                        filePath
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIURL : public nsIURI {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IURL_IID)

  /*************************************************************************
     * The URL path is broken down into the following principal components:
     */
/**
     * Returns a path including the directory and file portions of a
     * URL.  For example, the filePath of "http://host/foo/bar.html#baz"
     * is "/foo/bar.html".
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String filePath; */
  NS_SCRIPTABLE NS_IMETHOD GetFilePath(nsACString & aFilePath) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFilePath(const nsACString & aFilePath) = 0;

  /**
     * Returns the parameters specified after the ; in the URL. 
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String param; */
  NS_SCRIPTABLE NS_IMETHOD GetParam(nsACString & aParam) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetParam(const nsACString & aParam) = 0;

  /**
     * Returns the query portion (the part after the "?") of the URL.
     * If there isn't one, an empty string is returned.
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String query; */
  NS_SCRIPTABLE NS_IMETHOD GetQuery(nsACString & aQuery) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetQuery(const nsACString & aQuery) = 0;

  /**
     * Returns the reference portion (the part after the "#") of the URL.
     * If there isn't one, an empty string is returned.
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String ref; */
  NS_SCRIPTABLE NS_IMETHOD GetRef(nsACString & aRef) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetRef(const nsACString & aRef) = 0;

  /*************************************************************************
     * The URL filepath is broken down into the following sub-components:
     */
/**
     * Returns the directory portion of a URL.  If the URL denotes a path to a
     * directory and not a file, e.g. http://host/foo/bar/, then the Directory
     * attribute accesses the complete /foo/bar/ portion, and the FileName is
     * the empty string. If the trailing slash is omitted, then the Directory
     * is /foo/ and the file is bar (i.e. this is a syntactic, not a semantic
     * breakdown of the Path).  And hence don't rely on this for something to
     * be a definitely be a file. But you can get just the leading directory
     * portion for sure.
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String directory; */
  NS_SCRIPTABLE NS_IMETHOD GetDirectory(nsACString & aDirectory) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDirectory(const nsACString & aDirectory) = 0;

  /**
     * Returns the file name portion of a URL.  If the URL denotes a path to a
     * directory and not a file, e.g. http://host/foo/bar/, then the Directory
     * attribute accesses the complete /foo/bar/ portion, and the FileName is
     * the empty string. Note that this is purely based on searching for the
     * last trailing slash. And hence don't rely on this to be a definite file. 
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String fileName; */
  NS_SCRIPTABLE NS_IMETHOD GetFileName(nsACString & aFileName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFileName(const nsACString & aFileName) = 0;

  /*************************************************************************
     * The URL filename is broken down even further:
     */
/**
     * Returns the file basename portion of a filename in a url.
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String fileBaseName; */
  NS_SCRIPTABLE NS_IMETHOD GetFileBaseName(nsACString & aFileBaseName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFileBaseName(const nsACString & aFileBaseName) = 0;

  /**
     * Returns the file extension portion of a filename in a url.  If a file
     * extension does not exist, the empty string is returned.
     *
     * Some characters may be escaped.
     */
  /* attribute AUTF8String fileExtension; */
  NS_SCRIPTABLE NS_IMETHOD GetFileExtension(nsACString & aFileExtension) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFileExtension(const nsACString & aFileExtension) = 0;

  /**
     * This method takes a uri and compares the two.  The common uri portion
     * is returned as a string.  The minimum common uri portion is the 
     * protocol, and any of these if present:  login, password, host and port
     * If no commonality is found, "" is returned.  If they are identical, the
     * whole path with file/ref/etc. is returned.  For file uris, it is
     * expected that the common spec would be at least "file:///" since '/' is
     * a shared common root.
     *
     * Examples:
     *    this.spec               aURIToCompare.spec        result
     * 1) http://mozilla.org/     http://www.mozilla.org/   ""
     * 2) http://foo.com/bar/     ftp://foo.com/bar/        ""
     * 3) http://foo.com:8080/    http://foo.com/bar/       ""
     * 4) ftp://user@foo.com/     ftp://user:pw@foo.com/    ""
     * 5) ftp://foo.com/bar/      ftp://foo.com/bar         ftp://foo.com/
     * 6) ftp://foo.com/bar/      ftp://foo.com/bar/b.html  ftp://foo.com/bar/
     * 7) http://foo.com/a.htm#i  http://foo.com/b.htm      http://foo.com/
     * 8) ftp://foo.com/c.htm#i   ftp://foo.com/c.htm       ftp://foo.com/c.htm
     * 9) file:///a/b/c.html      file:///d/e/c.html        file:///
     */
  /* AUTF8String getCommonBaseSpec (in nsIURI aURIToCompare); */
  NS_SCRIPTABLE NS_IMETHOD GetCommonBaseSpec(nsIURI *aURIToCompare, nsACString & _retval) = 0;

  /**
     * This method takes a uri and returns a substring of this if it can be
     * made relative to the uri passed in.  If no commonality is found, the
     * entire uri spec is returned.  If they are identical, "" is returned.
     * Filename, query, etc are always returned except when uris are identical.
     */
  /* AUTF8String getRelativeSpec (in nsIURI aURIToCompare); */
  NS_SCRIPTABLE NS_IMETHOD GetRelativeSpec(nsIURI *aURIToCompare, nsACString & _retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIURL, NS_IURL_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIURL \
  NS_SCRIPTABLE NS_IMETHOD GetFilePath(nsACString & aFilePath); \
  NS_SCRIPTABLE NS_IMETHOD SetFilePath(const nsACString & aFilePath); \
  NS_SCRIPTABLE NS_IMETHOD GetParam(nsACString & aParam); \
  NS_SCRIPTABLE NS_IMETHOD SetParam(const nsACString & aParam); \
  NS_SCRIPTABLE NS_IMETHOD GetQuery(nsACString & aQuery); \
  NS_SCRIPTABLE NS_IMETHOD SetQuery(const nsACString & aQuery); \
  NS_SCRIPTABLE NS_IMETHOD GetRef(nsACString & aRef); \
  NS_SCRIPTABLE NS_IMETHOD SetRef(const nsACString & aRef); \
  NS_SCRIPTABLE NS_IMETHOD GetDirectory(nsACString & aDirectory); \
  NS_SCRIPTABLE NS_IMETHOD SetDirectory(const nsACString & aDirectory); \
  NS_SCRIPTABLE NS_IMETHOD GetFileName(nsACString & aFileName); \
  NS_SCRIPTABLE NS_IMETHOD SetFileName(const nsACString & aFileName); \
  NS_SCRIPTABLE NS_IMETHOD GetFileBaseName(nsACString & aFileBaseName); \
  NS_SCRIPTABLE NS_IMETHOD SetFileBaseName(const nsACString & aFileBaseName); \
  NS_SCRIPTABLE NS_IMETHOD GetFileExtension(nsACString & aFileExtension); \
  NS_SCRIPTABLE NS_IMETHOD SetFileExtension(const nsACString & aFileExtension); \
  NS_SCRIPTABLE NS_IMETHOD GetCommonBaseSpec(nsIURI *aURIToCompare, nsACString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD GetRelativeSpec(nsIURI *aURIToCompare, nsACString & _retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIURL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetFilePath(nsACString & aFilePath) { return _to GetFilePath(aFilePath); } \
  NS_SCRIPTABLE NS_IMETHOD SetFilePath(const nsACString & aFilePath) { return _to SetFilePath(aFilePath); } \
  NS_SCRIPTABLE NS_IMETHOD GetParam(nsACString & aParam) { return _to GetParam(aParam); } \
  NS_SCRIPTABLE NS_IMETHOD SetParam(const nsACString & aParam) { return _to SetParam(aParam); } \
  NS_SCRIPTABLE NS_IMETHOD GetQuery(nsACString & aQuery) { return _to GetQuery(aQuery); } \
  NS_SCRIPTABLE NS_IMETHOD SetQuery(const nsACString & aQuery) { return _to SetQuery(aQuery); } \
  NS_SCRIPTABLE NS_IMETHOD GetRef(nsACString & aRef) { return _to GetRef(aRef); } \
  NS_SCRIPTABLE NS_IMETHOD SetRef(const nsACString & aRef) { return _to SetRef(aRef); } \
  NS_SCRIPTABLE NS_IMETHOD GetDirectory(nsACString & aDirectory) { return _to GetDirectory(aDirectory); } \
  NS_SCRIPTABLE NS_IMETHOD SetDirectory(const nsACString & aDirectory) { return _to SetDirectory(aDirectory); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileName(nsACString & aFileName) { return _to GetFileName(aFileName); } \
  NS_SCRIPTABLE NS_IMETHOD SetFileName(const nsACString & aFileName) { return _to SetFileName(aFileName); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileBaseName(nsACString & aFileBaseName) { return _to GetFileBaseName(aFileBaseName); } \
  NS_SCRIPTABLE NS_IMETHOD SetFileBaseName(const nsACString & aFileBaseName) { return _to SetFileBaseName(aFileBaseName); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileExtension(nsACString & aFileExtension) { return _to GetFileExtension(aFileExtension); } \
  NS_SCRIPTABLE NS_IMETHOD SetFileExtension(const nsACString & aFileExtension) { return _to SetFileExtension(aFileExtension); } \
  NS_SCRIPTABLE NS_IMETHOD GetCommonBaseSpec(nsIURI *aURIToCompare, nsACString & _retval) { return _to GetCommonBaseSpec(aURIToCompare, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetRelativeSpec(nsIURI *aURIToCompare, nsACString & _retval) { return _to GetRelativeSpec(aURIToCompare, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIURL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetFilePath(nsACString & aFilePath) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFilePath(aFilePath); } \
  NS_SCRIPTABLE NS_IMETHOD SetFilePath(const nsACString & aFilePath) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFilePath(aFilePath); } \
  NS_SCRIPTABLE NS_IMETHOD GetParam(nsACString & aParam) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParam(aParam); } \
  NS_SCRIPTABLE NS_IMETHOD SetParam(const nsACString & aParam) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetParam(aParam); } \
  NS_SCRIPTABLE NS_IMETHOD GetQuery(nsACString & aQuery) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetQuery(aQuery); } \
  NS_SCRIPTABLE NS_IMETHOD SetQuery(const nsACString & aQuery) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetQuery(aQuery); } \
  NS_SCRIPTABLE NS_IMETHOD GetRef(nsACString & aRef) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRef(aRef); } \
  NS_SCRIPTABLE NS_IMETHOD SetRef(const nsACString & aRef) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRef(aRef); } \
  NS_SCRIPTABLE NS_IMETHOD GetDirectory(nsACString & aDirectory) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDirectory(aDirectory); } \
  NS_SCRIPTABLE NS_IMETHOD SetDirectory(const nsACString & aDirectory) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDirectory(aDirectory); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileName(nsACString & aFileName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFileName(aFileName); } \
  NS_SCRIPTABLE NS_IMETHOD SetFileName(const nsACString & aFileName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFileName(aFileName); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileBaseName(nsACString & aFileBaseName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFileBaseName(aFileBaseName); } \
  NS_SCRIPTABLE NS_IMETHOD SetFileBaseName(const nsACString & aFileBaseName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFileBaseName(aFileBaseName); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileExtension(nsACString & aFileExtension) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFileExtension(aFileExtension); } \
  NS_SCRIPTABLE NS_IMETHOD SetFileExtension(const nsACString & aFileExtension) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFileExtension(aFileExtension); } \
  NS_SCRIPTABLE NS_IMETHOD GetCommonBaseSpec(nsIURI *aURIToCompare, nsACString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCommonBaseSpec(aURIToCompare, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetRelativeSpec(nsIURI *aURIToCompare, nsACString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRelativeSpec(aURIToCompare, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsURL : public nsIURL
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIURL

  nsURL();

private:
  ~nsURL();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsURL, nsIURL)

nsURL::nsURL()
{
  /* member initializers and constructor code */
}

nsURL::~nsURL()
{
  /* destructor code */
}

/* attribute AUTF8String filePath; */
NS_IMETHODIMP nsURL::GetFilePath(nsACString & aFilePath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURL::SetFilePath(const nsACString & aFilePath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String param; */
NS_IMETHODIMP nsURL::GetParam(nsACString & aParam)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURL::SetParam(const nsACString & aParam)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String query; */
NS_IMETHODIMP nsURL::GetQuery(nsACString & aQuery)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURL::SetQuery(const nsACString & aQuery)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String ref; */
NS_IMETHODIMP nsURL::GetRef(nsACString & aRef)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURL::SetRef(const nsACString & aRef)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String directory; */
NS_IMETHODIMP nsURL::GetDirectory(nsACString & aDirectory)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURL::SetDirectory(const nsACString & aDirectory)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String fileName; */
NS_IMETHODIMP nsURL::GetFileName(nsACString & aFileName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURL::SetFileName(const nsACString & aFileName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String fileBaseName; */
NS_IMETHODIMP nsURL::GetFileBaseName(nsACString & aFileBaseName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURL::SetFileBaseName(const nsACString & aFileBaseName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AUTF8String fileExtension; */
NS_IMETHODIMP nsURL::GetFileExtension(nsACString & aFileExtension)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURL::SetFileExtension(const nsACString & aFileExtension)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* AUTF8String getCommonBaseSpec (in nsIURI aURIToCompare); */
NS_IMETHODIMP nsURL::GetCommonBaseSpec(nsIURI *aURIToCompare, nsACString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* AUTF8String getRelativeSpec (in nsIURI aURIToCompare); */
NS_IMETHODIMP nsURL::GetRelativeSpec(nsIURI *aURIToCompare, nsACString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIURL_h__ */
