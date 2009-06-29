/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/embedding/browser/webBrowser/nsIWebBrowser.idl
 */

#ifndef __gen_nsIWebBrowser_h__
#define __gen_nsIWebBrowser_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIInterfaceRequestor; /* forward declaration */

class nsIWebBrowserChrome; /* forward declaration */

class nsIURIContentListener; /* forward declaration */

class nsIDOMWindow; /* forward declaration */

class nsIWeakReference; /* forward declaration */


/* starting interface:    nsIWebBrowser */
#define NS_IWEBBROWSER_IID_STR "69e5df00-7b8b-11d3-af61-00a024ffc08c"

#define NS_IWEBBROWSER_IID \
  {0x69e5df00, 0x7b8b, 0x11d3, \
    { 0xaf, 0x61, 0x00, 0xa0, 0x24, 0xff, 0xc0, 0x8c }}

/**
 * The nsIWebBrowser interface is implemented by web browser objects.
 * Embedders use this interface during initialisation to associate
 * the new web browser instance with the embedders chrome and
 * to register any listeners. The interface may also be used at runtime
 * to obtain the content DOM window and from that the rest of the DOM.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebBrowser : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBBROWSER_IID)

  /**
     * Registers a listener of the type specified by the iid to receive
     * callbacks. The browser stores a weak reference to the listener
     * to avoid any circular dependencies.
     * Typically this method will be called to register an object
     * to receive <CODE>nsIWebProgressListener</CODE> or 
     * <CODE>nsISHistoryListener</CODE> notifications in which case the
     * the IID is that of the interface.
     *
     * @param aListener The listener to be added.
     * @param aIID      The IID of the interface that will be called
     *                  on the listener as appropriate.
     * @return          <CODE>NS_OK</CODE> for successful registration;
     *                  <CODE>NS_ERROR_INVALID_ARG</CODE> if aIID is not
     *                  supposed to be registered using this method;
     *                  <CODE>NS_ERROR_FAILURE</CODE> either aListener did not
     *                  expose the interface specified by the IID, or some
     *                  other internal error occurred.
     *
     * @see removeWebBrowserListener
     * @see nsIWeakReference
     * @see nsIWebProgressListener
     * @see nsISHistoryListener
     *
     * @return <CODE>NS_OK</CODE>, listener was successfully added;
     *         <CODE>NS_ERROR_INVALID_ARG</CODE>, one of the arguments was
     *         invalid or the object did not implement the interface
     *         specified by the IID.
     */
  /* void addWebBrowserListener (in nsIWeakReference aListener, in nsIIDRef aIID); */
  NS_SCRIPTABLE NS_IMETHOD AddWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID) = 0;

  /**
     * Removes a previously registered listener.
     *
     * @param aListener The listener to be removed.
     * @param aIID      The IID of the interface on the listener that will
     *                  no longer be called.
     *
     * @return <CODE>NS_OK</CODE>, listener was successfully removed;
     *         <CODE>NS_ERROR_INVALID_ARG</CODE> arguments was invalid or
     *         the object did not implement the interface specified by the IID.
     *
     * @see addWebBrowserListener
     * @see nsIWeakReference
     */
  /* void removeWebBrowserListener (in nsIWeakReference aListener, in nsIIDRef aIID); */
  NS_SCRIPTABLE NS_IMETHOD RemoveWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID) = 0;

  /**
     * The chrome object associated with the browser instance. The embedder
     * must create one chrome object for <I>each</I> browser object
     * that is instantiated. The embedder must associate the two by setting
     * this property to point to the chrome object before creating the browser
     * window via the browser's <CODE>nsIBaseWindow</CODE> interface. 
     *
     * The chrome object must also implement <CODE>nsIEmbeddingSiteWindow</CODE>.
     *
     * The chrome may optionally implement <CODE>nsIInterfaceRequestor</CODE>,
     * <CODE>nsIWebBrowserChromeFocus</CODE>,
     * <CODE>nsIContextMenuListener</CODE> and
     * <CODE>nsITooltipListener</CODE> to receive additional notifications
     * from the browser object.
     *
     * The chrome object may optionally implement <CODE>nsIWebProgressListener</CODE> 
     * instead of explicitly calling <CODE>addWebBrowserListener</CODE> and
     * <CODE>removeWebBrowserListener</CODE> to register a progress listener
     * object. If the implementation does this, it must also implement
     * <CODE>nsIWeakReference</CODE>.
     * 
     * @note The implementation should not refcount the supplied chrome
     *       object; it should assume that a non <CODE>nsnull</CODE> value is
     *       always valid. The embedder must explicitly set this value back
     *       to nsnull if the chrome object is destroyed before the browser
     *       object.
     *
     * @see nsIBaseWindow
     * @see nsIWebBrowserChrome
     * @see nsIEmbeddingSiteWindow
     * @see nsIInterfaceRequestor
     * @see nsIWebBrowserChromeFocus
     * @see nsIContextMenuListener
     * @see nsITooltipListener
     * @see nsIWeakReference
     * @see nsIWebProgressListener
     */
  /* attribute nsIWebBrowserChrome containerWindow; */
  NS_SCRIPTABLE NS_IMETHOD GetContainerWindow(nsIWebBrowserChrome * *aContainerWindow) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetContainerWindow(nsIWebBrowserChrome * aContainerWindow) = 0;

  /**
     * URI content listener parent. The embedder may set this property to
     * their own implementation if they intend to override or prevent
     * how certain kinds of content are loaded.
     *
     * @note If this attribute is set to an object that implements
     *       nsISupportsWeakReference, the implementation should get the
     *       nsIWeakReference and hold that.  Otherwise, the implementation
     *       should not refcount this interface; it should assume that a non
     *       null value is always valid.  In that case, the embedder should
     *       explicitly set this value back to null if the parent content
     *       listener is destroyed before the browser object.
     *
     * @see nsIURIContentListener
     */
  /* attribute nsIURIContentListener parentURIContentListener; */
  NS_SCRIPTABLE NS_IMETHOD GetParentURIContentListener(nsIURIContentListener * *aParentURIContentListener) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetParentURIContentListener(nsIURIContentListener * aParentURIContentListener) = 0;

  /**
     * The top-level DOM window. The embedder may walk the entire
     * DOM starting from this value.
     *
     * @see nsIDOMWindow
     */
  /* readonly attribute nsIDOMWindow contentDOMWindow; */
  NS_SCRIPTABLE NS_IMETHOD GetContentDOMWindow(nsIDOMWindow * *aContentDOMWindow) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebBrowser, NS_IWEBBROWSER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBBROWSER \
  NS_SCRIPTABLE NS_IMETHOD AddWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID); \
  NS_SCRIPTABLE NS_IMETHOD RemoveWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID); \
  NS_SCRIPTABLE NS_IMETHOD GetContainerWindow(nsIWebBrowserChrome * *aContainerWindow); \
  NS_SCRIPTABLE NS_IMETHOD SetContainerWindow(nsIWebBrowserChrome * aContainerWindow); \
  NS_SCRIPTABLE NS_IMETHOD GetParentURIContentListener(nsIURIContentListener * *aParentURIContentListener); \
  NS_SCRIPTABLE NS_IMETHOD SetParentURIContentListener(nsIURIContentListener * aParentURIContentListener); \
  NS_SCRIPTABLE NS_IMETHOD GetContentDOMWindow(nsIDOMWindow * *aContentDOMWindow); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBBROWSER(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID) { return _to AddWebBrowserListener(aListener, aIID); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID) { return _to RemoveWebBrowserListener(aListener, aIID); } \
  NS_SCRIPTABLE NS_IMETHOD GetContainerWindow(nsIWebBrowserChrome * *aContainerWindow) { return _to GetContainerWindow(aContainerWindow); } \
  NS_SCRIPTABLE NS_IMETHOD SetContainerWindow(nsIWebBrowserChrome * aContainerWindow) { return _to SetContainerWindow(aContainerWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentURIContentListener(nsIURIContentListener * *aParentURIContentListener) { return _to GetParentURIContentListener(aParentURIContentListener); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentURIContentListener(nsIURIContentListener * aParentURIContentListener) { return _to SetParentURIContentListener(aParentURIContentListener); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentDOMWindow(nsIDOMWindow * *aContentDOMWindow) { return _to GetContentDOMWindow(aContentDOMWindow); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBBROWSER(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddWebBrowserListener(aListener, aIID); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveWebBrowserListener(aListener, aIID); } \
  NS_SCRIPTABLE NS_IMETHOD GetContainerWindow(nsIWebBrowserChrome * *aContainerWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContainerWindow(aContainerWindow); } \
  NS_SCRIPTABLE NS_IMETHOD SetContainerWindow(nsIWebBrowserChrome * aContainerWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetContainerWindow(aContainerWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentURIContentListener(nsIURIContentListener * *aParentURIContentListener) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentURIContentListener(aParentURIContentListener); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentURIContentListener(nsIURIContentListener * aParentURIContentListener) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetParentURIContentListener(aParentURIContentListener); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentDOMWindow(nsIDOMWindow * *aContentDOMWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContentDOMWindow(aContentDOMWindow); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebBrowser : public nsIWebBrowser
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBBROWSER

  nsWebBrowser();

private:
  ~nsWebBrowser();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebBrowser, nsIWebBrowser)

nsWebBrowser::nsWebBrowser()
{
  /* member initializers and constructor code */
}

nsWebBrowser::~nsWebBrowser()
{
  /* destructor code */
}

/* void addWebBrowserListener (in nsIWeakReference aListener, in nsIIDRef aIID); */
NS_IMETHODIMP nsWebBrowser::AddWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeWebBrowserListener (in nsIWeakReference aListener, in nsIIDRef aIID); */
NS_IMETHODIMP nsWebBrowser::RemoveWebBrowserListener(nsIWeakReference *aListener, const nsIID & aIID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIWebBrowserChrome containerWindow; */
NS_IMETHODIMP nsWebBrowser::GetContainerWindow(nsIWebBrowserChrome * *aContainerWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowser::SetContainerWindow(nsIWebBrowserChrome * aContainerWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIURIContentListener parentURIContentListener; */
NS_IMETHODIMP nsWebBrowser::GetParentURIContentListener(nsIURIContentListener * *aParentURIContentListener)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowser::SetParentURIContentListener(nsIURIContentListener * aParentURIContentListener)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMWindow contentDOMWindow; */
NS_IMETHODIMP nsWebBrowser::GetContentDOMWindow(nsIDOMWindow * *aContentDOMWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIWebBrowser_h__ */
