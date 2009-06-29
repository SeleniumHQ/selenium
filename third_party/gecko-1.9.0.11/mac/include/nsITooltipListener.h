/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/embedding/browser/webBrowser/nsITooltipListener.idl
 */

#ifndef __gen_nsITooltipListener_h__
#define __gen_nsITooltipListener_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsITooltipListener */
#define NS_ITOOLTIPLISTENER_IID_STR "44b78386-1dd2-11b2-9ad2-e4eee2ca1916"

#define NS_ITOOLTIPLISTENER_IID \
  {0x44b78386, 0x1dd2, 0x11b2, \
    { 0x9a, 0xd2, 0xe4, 0xee, 0xe2, 0xca, 0x19, 0x16 }}

/**
 * An optional interface for embedding clients wishing to receive
 * notifications for when a tooltip should be displayed or removed.
 * The embedder implements this interface on the web browser chrome
 * object associated with the window that notifications are required
 * for.
 *
 * @see nsITooltipTextProvider
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsITooltipListener : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ITOOLTIPLISTENER_IID)

  /**
     * Called when a tooltip should be displayed.
     *
     * @param aXCoords The tooltip left edge X coordinate.
     * @param aYCoords The tooltip top edge Y coordinate.
     * @param aTipText The text to display in the tooltip, typically obtained
     *        from the TITLE attribute of the node (or containing parent)
     *        over which the pointer has been positioned.
     *
     * @note
     * Coordinates are specified in pixels, relative to the top-left
     * corner of the browser area.
     *
     * @return <code>NS_OK</code> if the tooltip was displayed.
     */
  /* void onShowTooltip (in long aXCoords, in long aYCoords, in wstring aTipText); */
  NS_SCRIPTABLE NS_IMETHOD OnShowTooltip(PRInt32 aXCoords, PRInt32 aYCoords, const PRUnichar *aTipText) = 0;

  /**
     * Called when the tooltip should be hidden, either because the pointer
     * has moved or the tooltip has timed out.
     */
  /* void onHideTooltip (); */
  NS_SCRIPTABLE NS_IMETHOD OnHideTooltip(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsITooltipListener, NS_ITOOLTIPLISTENER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSITOOLTIPLISTENER \
  NS_SCRIPTABLE NS_IMETHOD OnShowTooltip(PRInt32 aXCoords, PRInt32 aYCoords, const PRUnichar *aTipText); \
  NS_SCRIPTABLE NS_IMETHOD OnHideTooltip(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSITOOLTIPLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnShowTooltip(PRInt32 aXCoords, PRInt32 aYCoords, const PRUnichar *aTipText) { return _to OnShowTooltip(aXCoords, aYCoords, aTipText); } \
  NS_SCRIPTABLE NS_IMETHOD OnHideTooltip(void) { return _to OnHideTooltip(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSITOOLTIPLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnShowTooltip(PRInt32 aXCoords, PRInt32 aYCoords, const PRUnichar *aTipText) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnShowTooltip(aXCoords, aYCoords, aTipText); } \
  NS_SCRIPTABLE NS_IMETHOD OnHideTooltip(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnHideTooltip(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsTooltipListener : public nsITooltipListener
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSITOOLTIPLISTENER

  nsTooltipListener();

private:
  ~nsTooltipListener();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsTooltipListener, nsITooltipListener)

nsTooltipListener::nsTooltipListener()
{
  /* member initializers and constructor code */
}

nsTooltipListener::~nsTooltipListener()
{
  /* destructor code */
}

/* void onShowTooltip (in long aXCoords, in long aYCoords, in wstring aTipText); */
NS_IMETHODIMP nsTooltipListener::OnShowTooltip(PRInt32 aXCoords, PRInt32 aYCoords, const PRUnichar *aTipText)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void onHideTooltip (); */
NS_IMETHODIMP nsTooltipListener::OnHideTooltip()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsITooltipListener_h__ */
