/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/uriloader/base/nsIURIContentListener.idl
 */

#ifndef __gen_nsIURIContentListener_h__
#define __gen_nsIURIContentListener_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIRequest; /* forward declaration */

class nsIStreamListener; /* forward declaration */

class nsIURI; /* forward declaration */


/* starting interface:    nsIURIContentListener */
#define NS_IURICONTENTLISTENER_IID_STR "94928ab3-8b63-11d3-989d-001083010e9b"

#define NS_IURICONTENTLISTENER_IID \
  {0x94928ab3, 0x8b63, 0x11d3, \
    { 0x98, 0x9d, 0x00, 0x10, 0x83, 0x01, 0x0e, 0x9b }}

/**
 * nsIURIContentListener is an interface used by components which
 * want to know (and have a chance to handle) a particular content type.
 * Typical usage scenarios will include running applications which register
 * a nsIURIContentListener for each of its content windows with the uri
 * dispatcher service. 
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIURIContentListener : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IURICONTENTLISTENER_IID)

  /**
  * Gives the original content listener first crack at stopping a load before
  * it happens.
  *
  * @param aURI   URI that is being opened.
  *
  * @return       <code>false</code> if the load can continue;
  *               <code>true</code> if the open should be aborted.
  */
  /* boolean onStartURIOpen (in nsIURI aURI); */
  NS_SCRIPTABLE NS_IMETHOD OnStartURIOpen(nsIURI *aURI, PRBool *_retval) = 0;

  /**
  * Notifies the content listener to hook up an nsIStreamListener capable of
  * consuming the data stream.
  *
  * @param aContentType         Content type of the data.
  * @param aIsContentPreferred  Indicates whether the content should be
  *                             preferred by this listener.
  * @param aRequest             Request that is providing the data.
  * @param aContentHandler      nsIStreamListener that will consume the data.
  *                             This should be set to <code>nsnull</code> if
  *                             this content listener can't handle the content
  *                             type.
  *
  * @return                     <code>true</code> if the consumer wants to
  *                             handle the load completely by itself.  This
  *                             causes the URI Loader do nothing else...
  *                             <code>false</code> if the URI Loader should
  *                             continue handling the load and call the
  *                             returned streamlistener's methods. 
  */
  /* boolean doContent (in string aContentType, in boolean aIsContentPreferred, in nsIRequest aRequest, out nsIStreamListener aContentHandler); */
  NS_SCRIPTABLE NS_IMETHOD DoContent(const char *aContentType, PRBool aIsContentPreferred, nsIRequest *aRequest, nsIStreamListener **aContentHandler, PRBool *_retval) = 0;

  /**
  * When given a uri to dispatch, if the URI is specified as 'preferred 
  * content' then the uri loader tries to find a preferred content handler
  * for the content type. The thought is that many content listeners may
  * be able to handle the same content type if they have to. i.e. the mail
  * content window can handle text/html just like a browser window content
  * listener. However, if the user clicks on a link with text/html content,
  * then the browser window should handle that content and not the mail
  * window where the user may have clicked the link.  This is the difference
  * between isPreferred and canHandleContent.
  *
  * @param aContentType         Content type of the data.
  * @param aDesiredContentType  Indicates that aContentType must be converted
  *                             to aDesiredContentType before processing the
  *                             data.  This causes a stream converted to be
  *                             inserted into the nsIStreamListener chain.
  *                             This argument can be <code>nsnull</code> if
  *                             the content should be consumed directly as
  *                             aContentType.
  *
  * @return                     <code>true</code> if this is a preferred
  *                             content handler for aContentType;
  *                             <code>false<code> otherwise.
  */
  /* boolean isPreferred (in string aContentType, out string aDesiredContentType); */
  NS_SCRIPTABLE NS_IMETHOD IsPreferred(const char *aContentType, char **aDesiredContentType, PRBool *_retval) = 0;

  /**
  * When given a uri to dispatch, if the URI is not specified as 'preferred
  * content' then the uri loader calls canHandleContent to see if the content
  * listener is capable of handling the content.
  *
  * @param aContentType         Content type of the data.
  * @param aIsContentPreferred  Indicates whether the content should be
  *                             preferred by this listener.
  * @param aDesiredContentType  Indicates that aContentType must be converted
  *                             to aDesiredContentType before processing the
  *                             data.  This causes a stream converted to be
  *                             inserted into the nsIStreamListener chain.
  *                             This argument can be <code>nsnull</code> if
  *                             the content should be consumed directly as
  *                             aContentType.
  *
  * @return                     <code>true</code> if the data can be consumed.
  *                             <code>false</code> otherwise.
  *
  * Note: I really envision canHandleContent as a method implemented
  * by the docshell as the implementation is generic to all doc
  * shells. The isPreferred decision is a decision made by a top level
  * application content listener that sits at the top of the docshell
  * hierarchy.
  */
  /* boolean canHandleContent (in string aContentType, in boolean aIsContentPreferred, out string aDesiredContentType); */
  NS_SCRIPTABLE NS_IMETHOD CanHandleContent(const char *aContentType, PRBool aIsContentPreferred, char **aDesiredContentType, PRBool *_retval) = 0;

  /**
  * The load context associated with a particular content listener.
  * The URI Loader stores and accesses this value as needed.
  */
  /* attribute nsISupports loadCookie; */
  NS_SCRIPTABLE NS_IMETHOD GetLoadCookie(nsISupports * *aLoadCookie) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLoadCookie(nsISupports * aLoadCookie) = 0;

  /**
  * The parent content listener if this particular listener is part of a chain
  * of content listeners (i.e. a docshell!)
  *
  * @note If this attribute is set to an object that implements
  *       nsISupportsWeakReference, the implementation should get the
  *       nsIWeakReference and hold that.  Otherwise, the implementation
  *       should not refcount this interface; it should assume that a non
  *       null value is always valid.  In that case, the caller is
  *       responsible for explicitly setting this value back to null if the
  *       parent content listener is destroyed.
  */
  /* attribute nsIURIContentListener parentContentListener; */
  NS_SCRIPTABLE NS_IMETHOD GetParentContentListener(nsIURIContentListener * *aParentContentListener) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetParentContentListener(nsIURIContentListener * aParentContentListener) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIURIContentListener, NS_IURICONTENTLISTENER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIURICONTENTLISTENER \
  NS_SCRIPTABLE NS_IMETHOD OnStartURIOpen(nsIURI *aURI, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD DoContent(const char *aContentType, PRBool aIsContentPreferred, nsIRequest *aRequest, nsIStreamListener **aContentHandler, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsPreferred(const char *aContentType, char **aDesiredContentType, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CanHandleContent(const char *aContentType, PRBool aIsContentPreferred, char **aDesiredContentType, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetLoadCookie(nsISupports * *aLoadCookie); \
  NS_SCRIPTABLE NS_IMETHOD SetLoadCookie(nsISupports * aLoadCookie); \
  NS_SCRIPTABLE NS_IMETHOD GetParentContentListener(nsIURIContentListener * *aParentContentListener); \
  NS_SCRIPTABLE NS_IMETHOD SetParentContentListener(nsIURIContentListener * aParentContentListener); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIURICONTENTLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnStartURIOpen(nsIURI *aURI, PRBool *_retval) { return _to OnStartURIOpen(aURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DoContent(const char *aContentType, PRBool aIsContentPreferred, nsIRequest *aRequest, nsIStreamListener **aContentHandler, PRBool *_retval) { return _to DoContent(aContentType, aIsContentPreferred, aRequest, aContentHandler, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsPreferred(const char *aContentType, char **aDesiredContentType, PRBool *_retval) { return _to IsPreferred(aContentType, aDesiredContentType, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanHandleContent(const char *aContentType, PRBool aIsContentPreferred, char **aDesiredContentType, PRBool *_retval) { return _to CanHandleContent(aContentType, aIsContentPreferred, aDesiredContentType, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetLoadCookie(nsISupports * *aLoadCookie) { return _to GetLoadCookie(aLoadCookie); } \
  NS_SCRIPTABLE NS_IMETHOD SetLoadCookie(nsISupports * aLoadCookie) { return _to SetLoadCookie(aLoadCookie); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentContentListener(nsIURIContentListener * *aParentContentListener) { return _to GetParentContentListener(aParentContentListener); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentContentListener(nsIURIContentListener * aParentContentListener) { return _to SetParentContentListener(aParentContentListener); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIURICONTENTLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnStartURIOpen(nsIURI *aURI, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnStartURIOpen(aURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DoContent(const char *aContentType, PRBool aIsContentPreferred, nsIRequest *aRequest, nsIStreamListener **aContentHandler, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->DoContent(aContentType, aIsContentPreferred, aRequest, aContentHandler, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsPreferred(const char *aContentType, char **aDesiredContentType, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsPreferred(aContentType, aDesiredContentType, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanHandleContent(const char *aContentType, PRBool aIsContentPreferred, char **aDesiredContentType, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CanHandleContent(aContentType, aIsContentPreferred, aDesiredContentType, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetLoadCookie(nsISupports * *aLoadCookie) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLoadCookie(aLoadCookie); } \
  NS_SCRIPTABLE NS_IMETHOD SetLoadCookie(nsISupports * aLoadCookie) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLoadCookie(aLoadCookie); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentContentListener(nsIURIContentListener * *aParentContentListener) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentContentListener(aParentContentListener); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentContentListener(nsIURIContentListener * aParentContentListener) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetParentContentListener(aParentContentListener); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsURIContentListener : public nsIURIContentListener
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIURICONTENTLISTENER

  nsURIContentListener();

private:
  ~nsURIContentListener();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsURIContentListener, nsIURIContentListener)

nsURIContentListener::nsURIContentListener()
{
  /* member initializers and constructor code */
}

nsURIContentListener::~nsURIContentListener()
{
  /* destructor code */
}

/* boolean onStartURIOpen (in nsIURI aURI); */
NS_IMETHODIMP nsURIContentListener::OnStartURIOpen(nsIURI *aURI, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean doContent (in string aContentType, in boolean aIsContentPreferred, in nsIRequest aRequest, out nsIStreamListener aContentHandler); */
NS_IMETHODIMP nsURIContentListener::DoContent(const char *aContentType, PRBool aIsContentPreferred, nsIRequest *aRequest, nsIStreamListener **aContentHandler, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isPreferred (in string aContentType, out string aDesiredContentType); */
NS_IMETHODIMP nsURIContentListener::IsPreferred(const char *aContentType, char **aDesiredContentType, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean canHandleContent (in string aContentType, in boolean aIsContentPreferred, out string aDesiredContentType); */
NS_IMETHODIMP nsURIContentListener::CanHandleContent(const char *aContentType, PRBool aIsContentPreferred, char **aDesiredContentType, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsISupports loadCookie; */
NS_IMETHODIMP nsURIContentListener::GetLoadCookie(nsISupports * *aLoadCookie)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURIContentListener::SetLoadCookie(nsISupports * aLoadCookie)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIURIContentListener parentContentListener; */
NS_IMETHODIMP nsURIContentListener::GetParentContentListener(nsIURIContentListener * *aParentContentListener)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsURIContentListener::SetParentContentListener(nsIURIContentListener * aParentContentListener)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIURIContentListener_h__ */
