/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/embedding/browser/webBrowser/nsIWebBrowserChromeFocus.idl
 */

#ifndef __gen_nsIWebBrowserChromeFocus_h__
#define __gen_nsIWebBrowserChromeFocus_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIWebBrowserChromeFocus */
#define NS_IWEBBROWSERCHROMEFOCUS_IID_STR "d2206418-1dd1-11b2-8e55-acddcd2bcfb8"

#define NS_IWEBBROWSERCHROMEFOCUS_IID \
  {0xd2206418, 0x1dd1, 0x11b2, \
    { 0x8e, 0x55, 0xac, 0xdd, 0xcd, 0x2b, 0xcf, 0xb8 }}

/**
 * The nsIWebBrowserChromeFocus is implemented by the same object as the
 * nsIEmbeddingSiteWindow. It represents the focus up-calls from mozilla
 * to the embedding chrome. See mozilla bug #70224 for gratuitous info.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebBrowserChromeFocus : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBBROWSERCHROMEFOCUS_IID)

  /**
     * Set the focus at the next focusable element in the chrome.
     */
  /* void focusNextElement (); */
  NS_SCRIPTABLE NS_IMETHOD FocusNextElement(void) = 0;

  /**
     * Set the focus at the previous focusable element in the chrome.
     */
  /* void focusPrevElement (); */
  NS_SCRIPTABLE NS_IMETHOD FocusPrevElement(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebBrowserChromeFocus, NS_IWEBBROWSERCHROMEFOCUS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBBROWSERCHROMEFOCUS \
  NS_SCRIPTABLE NS_IMETHOD FocusNextElement(void); \
  NS_SCRIPTABLE NS_IMETHOD FocusPrevElement(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBBROWSERCHROMEFOCUS(_to) \
  NS_SCRIPTABLE NS_IMETHOD FocusNextElement(void) { return _to FocusNextElement(); } \
  NS_SCRIPTABLE NS_IMETHOD FocusPrevElement(void) { return _to FocusPrevElement(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBBROWSERCHROMEFOCUS(_to) \
  NS_SCRIPTABLE NS_IMETHOD FocusNextElement(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->FocusNextElement(); } \
  NS_SCRIPTABLE NS_IMETHOD FocusPrevElement(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->FocusPrevElement(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebBrowserChromeFocus : public nsIWebBrowserChromeFocus
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBBROWSERCHROMEFOCUS

  nsWebBrowserChromeFocus();

private:
  ~nsWebBrowserChromeFocus();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebBrowserChromeFocus, nsIWebBrowserChromeFocus)

nsWebBrowserChromeFocus::nsWebBrowserChromeFocus()
{
  /* member initializers and constructor code */
}

nsWebBrowserChromeFocus::~nsWebBrowserChromeFocus()
{
  /* destructor code */
}

/* void focusNextElement (); */
NS_IMETHODIMP nsWebBrowserChromeFocus::FocusNextElement()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void focusPrevElement (); */
NS_IMETHODIMP nsWebBrowserChromeFocus::FocusPrevElement()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIWebBrowserChromeFocus_h__ */
