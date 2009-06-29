/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/embedding/base/nsIWindowCreator.idl
 */

#ifndef __gen_nsIWindowCreator_h__
#define __gen_nsIWindowCreator_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIWebBrowserChrome; /* forward declaration */


/* starting interface:    nsIWindowCreator */
#define NS_IWINDOWCREATOR_IID_STR "30465632-a777-44cc-90f9-8145475ef999"

#define NS_IWINDOWCREATOR_IID \
  {0x30465632, 0xa777, 0x44cc, \
    { 0x90, 0xf9, 0x81, 0x45, 0x47, 0x5e, 0xf9, 0x99 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIWindowCreator : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWINDOWCREATOR_IID)

  /** Create a new window. Gecko will/may call this method, if made
      available to it, to create new windows.
      @param parent parent window, if any. null if not. the newly created
                    window should be made a child/dependent window of
                    the parent, if any (and if the concept applies
                    to the underlying OS).
      @param chromeFlags chrome features from nsIWebBrowserChrome
      @return the new window
  */
  /* nsIWebBrowserChrome createChromeWindow (in nsIWebBrowserChrome parent, in PRUint32 chromeFlags); */
  NS_SCRIPTABLE NS_IMETHOD CreateChromeWindow(nsIWebBrowserChrome *parent, PRUint32 chromeFlags, nsIWebBrowserChrome **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWindowCreator, NS_IWINDOWCREATOR_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWINDOWCREATOR \
  NS_SCRIPTABLE NS_IMETHOD CreateChromeWindow(nsIWebBrowserChrome *parent, PRUint32 chromeFlags, nsIWebBrowserChrome **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWINDOWCREATOR(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateChromeWindow(nsIWebBrowserChrome *parent, PRUint32 chromeFlags, nsIWebBrowserChrome **_retval) { return _to CreateChromeWindow(parent, chromeFlags, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWINDOWCREATOR(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateChromeWindow(nsIWebBrowserChrome *parent, PRUint32 chromeFlags, nsIWebBrowserChrome **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateChromeWindow(parent, chromeFlags, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWindowCreator : public nsIWindowCreator
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWINDOWCREATOR

  nsWindowCreator();

private:
  ~nsWindowCreator();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWindowCreator, nsIWindowCreator)

nsWindowCreator::nsWindowCreator()
{
  /* member initializers and constructor code */
}

nsWindowCreator::~nsWindowCreator()
{
  /* destructor code */
}

/* nsIWebBrowserChrome createChromeWindow (in nsIWebBrowserChrome parent, in PRUint32 chromeFlags); */
NS_IMETHODIMP nsWindowCreator::CreateChromeWindow(nsIWebBrowserChrome *parent, PRUint32 chromeFlags, nsIWebBrowserChrome **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

// {30465632-A777-44cc-90F9-8145475EF999}
#define NS_WINDOWCREATOR_IID \
 {0x30465632, 0xa777, 0x44cc, {0x90, 0xf9, 0x81, 0x45, 0x47, 0x5e, 0xf9, 0x99}}

#endif /* __gen_nsIWindowCreator_h__ */
