/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/embedding/browser/webBrowser/nsIWebBrowserSetup.idl
 */

#ifndef __gen_nsIWebBrowserSetup_h__
#define __gen_nsIWebBrowserSetup_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIWebBrowserSetup */
#define NS_IWEBBROWSERSETUP_IID_STR "f15398a0-8018-11d3-af70-00a024ffc08c"

#define NS_IWEBBROWSERSETUP_IID \
  {0xf15398a0, 0x8018, 0x11d3, \
    { 0xaf, 0x70, 0x00, 0xa0, 0x24, 0xff, 0xc0, 0x8c }}

/**
 * The nsIWebBrowserSetup interface lets you set properties on a browser
 * object; you can do so at any time during the life cycle of the browser.
 *
 * @note Unless stated otherwise, settings are presumed to be enabled by
 *       default.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebBrowserSetup : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBBROWSERSETUP_IID)

  /**
     * Boolean. Enables/disables plugin support for this browser.
     *
     * @see setProperty
     */
  enum { SETUP_ALLOW_PLUGINS = 1U };

  /**
     * Boolean. Enables/disables Javascript support for this browser.
     *
     * @see setProperty
     */
  enum { SETUP_ALLOW_JAVASCRIPT = 2U };

  /**
     * Boolean. Enables/disables meta redirect support for this browser.
     * Meta redirect timers will be ignored if this option is disabled.
     *
     * @see setProperty
     */
  enum { SETUP_ALLOW_META_REDIRECTS = 3U };

  /**
     * Boolean. Enables/disables subframes within the browser
     *
     * @see setProperty
     */
  enum { SETUP_ALLOW_SUBFRAMES = 4U };

  /**
     * Boolean. Enables/disables image loading for this browser
     * window. If you disable the images, load a page, then enable the images,
     * the page will *not* automatically load the images for the previously
     * loaded page. This flag controls the state of a webBrowser at load time 
     * and does not automatically re-load a page when the state is toggled. 
     * Reloading must be done by hand, or by walking through the DOM tree and 
     * re-setting the src attributes.
     *
     * @see setProperty
     */
  enum { SETUP_ALLOW_IMAGES = 5U };

  /**
     * Boolean. Enables/disables whether the document as a whole gets focus before
     * traversing the document's content, or after traversing its content.
     *
     * NOTE: this property is obsolete and now has no effect
     *
     * @see setProperty
     */
  enum { SETUP_FOCUS_DOC_BEFORE_CONTENT = 6U };

  /**
     * Boolean. Enables/disables the use of global history in the browser. Visited
     * URLs will not be recorded in the global history when it is disabled.
     *
     * @see setProperty
     */
  enum { SETUP_USE_GLOBAL_HISTORY = 256U };

  /**
     * Boolean. A value of PR_TRUE makes the browser a chrome wrapper.
     * Default is PR_FALSE.
     *
     * @since mozilla1.0
     *
     * @see setProperty
     */
  enum { SETUP_IS_CHROME_WRAPPER = 7U };

  /**
     * Sets an integer or boolean property on the new web browser object.
     * Only PR_TRUE and PR_FALSE are legal boolean values.
     *
     * @param aId The identifier of the property to be set.
     * @param aValue The value of the property.
     */
  /* void setProperty (in unsigned long aId, in unsigned long aValue); */
  NS_SCRIPTABLE NS_IMETHOD SetProperty(PRUint32 aId, PRUint32 aValue) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebBrowserSetup, NS_IWEBBROWSERSETUP_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBBROWSERSETUP \
  NS_SCRIPTABLE NS_IMETHOD SetProperty(PRUint32 aId, PRUint32 aValue); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBBROWSERSETUP(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetProperty(PRUint32 aId, PRUint32 aValue) { return _to SetProperty(aId, aValue); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBBROWSERSETUP(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetProperty(PRUint32 aId, PRUint32 aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetProperty(aId, aValue); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebBrowserSetup : public nsIWebBrowserSetup
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBBROWSERSETUP

  nsWebBrowserSetup();

private:
  ~nsWebBrowserSetup();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebBrowserSetup, nsIWebBrowserSetup)

nsWebBrowserSetup::nsWebBrowserSetup()
{
  /* member initializers and constructor code */
}

nsWebBrowserSetup::~nsWebBrowserSetup()
{
  /* destructor code */
}

/* void setProperty (in unsigned long aId, in unsigned long aValue); */
NS_IMETHODIMP nsWebBrowserSetup::SetProperty(PRUint32 aId, PRUint32 aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIWebBrowserSetup_h__ */
