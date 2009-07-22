/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM firefox/src/cpp/webdriver-firefox/nsINativeEvents.idl
 */

#ifndef __gen_nsINativeEvents_h__
#define __gen_nsINativeEvents_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsINativeEvents */
#define NS_INATIVEEVENTS_IID_STR "5a86850b-f376-4ae6-860d-53a441cafce4"

#define NS_INATIVEEVENTS_IID \
  {0x5a86850b, 0xf376, 0x4ae6, \
    { 0x86, 0x0d, 0x53, 0xa4, 0x41, 0xca, 0xfc, 0xe4 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsINativeEvents : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_INATIVEEVENTS_IID)

  /* void sendKeys (in nsISupports aNode, in wstring value); */
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value) = 0;

  /* void mouseMove (in nsISupports aNode, in long startX, in long startY, in long endX, in long endY); */
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY) = 0;

  /* void click (in nsISupports aNode, in long x, in long y); */
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y) = 0;

  /* void hasUnhandledEvents (in nsISupports aNode, out boolean hasEvents); */
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsINativeEvents, NS_INATIVEEVENTS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSINATIVEEVENTS \
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value); \
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY); \
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y); \
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSINATIVEEVENTS(_to) \
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value) { return _to SendKeys(aNode, value); } \
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY) { return _to MouseMove(aNode, startX, startY, endX, endY); } \
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y) { return _to Click(aNode, x, y); } \
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents) { return _to HasUnhandledEvents(aNode, hasEvents); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSINATIVEEVENTS(_to) \
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value) { return !_to ? NS_ERROR_NULL_POINTER : _to->SendKeys(aNode, value); } \
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY) { return !_to ? NS_ERROR_NULL_POINTER : _to->MouseMove(aNode, startX, startY, endX, endY); } \
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y) { return !_to ? NS_ERROR_NULL_POINTER : _to->Click(aNode, x, y); } \
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents) { return !_to ? NS_ERROR_NULL_POINTER : _to->HasUnhandledEvents(aNode, hasEvents); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsNativeEvents : public nsINativeEvents
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSINATIVEEVENTS

  nsNativeEvents();

private:
  ~nsNativeEvents();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsNativeEvents, nsINativeEvents)

nsNativeEvents::nsNativeEvents()
{
  /* member initializers and constructor code */
}

nsNativeEvents::~nsNativeEvents()
{
  /* destructor code */
}

/* void sendKeys (in nsISupports aNode, in wstring value); */
NS_IMETHODIMP nsNativeEvents::SendKeys(nsISupports *aNode, const PRUnichar *value)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void mouseMove (in nsISupports aNode, in long startX, in long startY, in long endX, in long endY); */
NS_IMETHODIMP nsNativeEvents::MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void click (in nsISupports aNode, in long x, in long y); */
NS_IMETHODIMP nsNativeEvents::Click(nsISupports *aNode, PRInt32 x, PRInt32 y)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void hasUnhandledEvents (in nsISupports aNode, out boolean hasEvents); */
NS_IMETHODIMP nsNativeEvents::HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsINativeEvents_h__ */
