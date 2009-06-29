/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/embedding/browser/webBrowser/nsIWebBrowserFocus.idl
 */

#ifndef __gen_nsIWebBrowserFocus_h__
#define __gen_nsIWebBrowserFocus_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIDOMWindow; /* forward declaration */

class nsIDOMElement; /* forward declaration */


/* starting interface:    nsIWebBrowserFocus */
#define NS_IWEBBROWSERFOCUS_IID_STR "9c5d3c58-1dd1-11b2-a1c9-f3699284657a"

#define NS_IWEBBROWSERFOCUS_IID \
  {0x9c5d3c58, 0x1dd1, 0x11b2, \
    { 0xa1, 0xc9, 0xf3, 0x69, 0x92, 0x84, 0x65, 0x7a }}

/**
 * nsIWebBrowserFocus
 * Interface that embedders use for controlling and interacting
 * with the browser focus management. The embedded browser can be focused by
 * clicking in it or tabbing into it. If the browser is currently focused and
 * the embedding application's top level window is disabled, deactivate() must
 * be called, and activate() called again when the top level window is
 * reactivated for the browser's focus memory to work correctly.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebBrowserFocus : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBBROWSERFOCUS_IID)

  /**
   * MANDATORY
   * activate() is a mandatory call that must be made to the browser
   * when the embedding application's window is activated *and* the 
   * browser area was the last thing in focus.  This method can also be called
   * if the embedding application wishes to give the browser area focus,
   * without affecting the currently focused element within the browser.
   *
   * @note
   * If you fail to make this call, mozilla focus memory will not work
   * correctly.
   */
  /* void activate (); */
  NS_SCRIPTABLE NS_IMETHOD Activate(void) = 0;

  /**
   * MANDATORY
   * deactivate() is a mandatory call that must be made to the browser
   * when the embedding application's window is deactivated *and* the
   * browser area was the last thing in focus.  On non-windows platforms,
   * deactivate() should also be called when focus moves from the browser
   * to the embedding chrome.
   *
   * @note
   * If you fail to make this call, mozilla focus memory will not work
   * correctly.
   */
  /* void deactivate (); */
  NS_SCRIPTABLE NS_IMETHOD Deactivate(void) = 0;

  /**
   * Give the first element focus within mozilla
   * (i.e. TAB was pressed and focus should enter mozilla)
   */
  /* void setFocusAtFirstElement (); */
  NS_SCRIPTABLE NS_IMETHOD SetFocusAtFirstElement(void) = 0;

  /**
   * Give the last element focus within mozilla
   * (i.e. SHIFT-TAB was pressed and focus should enter mozilla)
   */
  /* void setFocusAtLastElement (); */
  NS_SCRIPTABLE NS_IMETHOD SetFocusAtLastElement(void) = 0;

  /**
   * The currently focused nsDOMWindow when the browser is active,
   * or the last focused nsDOMWindow when the browser is inactive.
   */
  /* attribute nsIDOMWindow focusedWindow; */
  NS_SCRIPTABLE NS_IMETHOD GetFocusedWindow(nsIDOMWindow * *aFocusedWindow) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFocusedWindow(nsIDOMWindow * aFocusedWindow) = 0;

  /**
   * The currently focused nsDOMElement when the browser is active,
   * or the last focused nsDOMElement when the browser is inactive.
   */
  /* attribute nsIDOMElement focusedElement; */
  NS_SCRIPTABLE NS_IMETHOD GetFocusedElement(nsIDOMElement * *aFocusedElement) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFocusedElement(nsIDOMElement * aFocusedElement) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebBrowserFocus, NS_IWEBBROWSERFOCUS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBBROWSERFOCUS \
  NS_SCRIPTABLE NS_IMETHOD Activate(void); \
  NS_SCRIPTABLE NS_IMETHOD Deactivate(void); \
  NS_SCRIPTABLE NS_IMETHOD SetFocusAtFirstElement(void); \
  NS_SCRIPTABLE NS_IMETHOD SetFocusAtLastElement(void); \
  NS_SCRIPTABLE NS_IMETHOD GetFocusedWindow(nsIDOMWindow * *aFocusedWindow); \
  NS_SCRIPTABLE NS_IMETHOD SetFocusedWindow(nsIDOMWindow * aFocusedWindow); \
  NS_SCRIPTABLE NS_IMETHOD GetFocusedElement(nsIDOMElement * *aFocusedElement); \
  NS_SCRIPTABLE NS_IMETHOD SetFocusedElement(nsIDOMElement * aFocusedElement); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBBROWSERFOCUS(_to) \
  NS_SCRIPTABLE NS_IMETHOD Activate(void) { return _to Activate(); } \
  NS_SCRIPTABLE NS_IMETHOD Deactivate(void) { return _to Deactivate(); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocusAtFirstElement(void) { return _to SetFocusAtFirstElement(); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocusAtLastElement(void) { return _to SetFocusAtLastElement(); } \
  NS_SCRIPTABLE NS_IMETHOD GetFocusedWindow(nsIDOMWindow * *aFocusedWindow) { return _to GetFocusedWindow(aFocusedWindow); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocusedWindow(nsIDOMWindow * aFocusedWindow) { return _to SetFocusedWindow(aFocusedWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetFocusedElement(nsIDOMElement * *aFocusedElement) { return _to GetFocusedElement(aFocusedElement); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocusedElement(nsIDOMElement * aFocusedElement) { return _to SetFocusedElement(aFocusedElement); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBBROWSERFOCUS(_to) \
  NS_SCRIPTABLE NS_IMETHOD Activate(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Activate(); } \
  NS_SCRIPTABLE NS_IMETHOD Deactivate(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Deactivate(); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocusAtFirstElement(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFocusAtFirstElement(); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocusAtLastElement(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFocusAtLastElement(); } \
  NS_SCRIPTABLE NS_IMETHOD GetFocusedWindow(nsIDOMWindow * *aFocusedWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFocusedWindow(aFocusedWindow); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocusedWindow(nsIDOMWindow * aFocusedWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFocusedWindow(aFocusedWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetFocusedElement(nsIDOMElement * *aFocusedElement) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFocusedElement(aFocusedElement); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocusedElement(nsIDOMElement * aFocusedElement) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFocusedElement(aFocusedElement); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebBrowserFocus : public nsIWebBrowserFocus
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBBROWSERFOCUS

  nsWebBrowserFocus();

private:
  ~nsWebBrowserFocus();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebBrowserFocus, nsIWebBrowserFocus)

nsWebBrowserFocus::nsWebBrowserFocus()
{
  /* member initializers and constructor code */
}

nsWebBrowserFocus::~nsWebBrowserFocus()
{
  /* destructor code */
}

/* void activate (); */
NS_IMETHODIMP nsWebBrowserFocus::Activate()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deactivate (); */
NS_IMETHODIMP nsWebBrowserFocus::Deactivate()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setFocusAtFirstElement (); */
NS_IMETHODIMP nsWebBrowserFocus::SetFocusAtFirstElement()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setFocusAtLastElement (); */
NS_IMETHODIMP nsWebBrowserFocus::SetFocusAtLastElement()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDOMWindow focusedWindow; */
NS_IMETHODIMP nsWebBrowserFocus::GetFocusedWindow(nsIDOMWindow * *aFocusedWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFocus::SetFocusedWindow(nsIDOMWindow * aFocusedWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDOMElement focusedElement; */
NS_IMETHODIMP nsWebBrowserFocus::GetFocusedElement(nsIDOMElement * *aFocusedElement)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFocus::SetFocusedElement(nsIDOMElement * aFocusedElement)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIWebBrowserFocus_h__ */
