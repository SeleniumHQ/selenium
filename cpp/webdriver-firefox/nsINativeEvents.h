/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM nsINativeEvents.idl
 */

#ifndef __gen_nsINativeEvents_h__
#define __gen_nsINativeEvents_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsIArray_h__
#include "nsIArray.h"
#endif

#ifndef __gen_nsIMutableArray_h__
#include "nsIMutableArray.h"
#endif

#ifndef __gen_nsISupportsPrimitives_h__
#include "nsISupportsPrimitives.h"
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

  /* void click (in nsISupports aNode, in long x, in long y, in long button); */
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) = 0;

  /* void mousePress (in nsISupports aNode, in long x, in long y, in long button); */
  NS_SCRIPTABLE NS_IMETHOD MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) = 0;

  /* void mouseRelease (in nsISupports anode, in long x, in long y, in long button); */
  NS_SCRIPTABLE NS_IMETHOD MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button) = 0;

  /* void hasUnhandledEvents (in nsISupports aNode, out boolean hasEvents); */
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM) = 0;

  /* void imeGetAvailableEngines (out nsIArray enginesList); */
  NS_SCRIPTABLE NS_IMETHOD ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM) = 0;

  /* void imeActivateEngine (in string engine, out boolean activationSucceeded); */
  NS_SCRIPTABLE NS_IMETHOD ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM) = 0;

  /* void imeIsActivated (out boolean isActive); */
  NS_SCRIPTABLE NS_IMETHOD ImeIsActivated(PRBool *isActive NS_OUTPARAM) = 0;

  /* void imeGetActiveEngine (out AString activeEngine); */
  NS_SCRIPTABLE NS_IMETHOD ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM) = 0;

  /* void imeDeactivate (); */
  NS_SCRIPTABLE NS_IMETHOD ImeDeactivate(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsINativeEvents, NS_INATIVEEVENTS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSINATIVEEVENTS \
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value); \
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY); \
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button); \
  NS_SCRIPTABLE NS_IMETHOD MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button); \
  NS_SCRIPTABLE NS_IMETHOD MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button); \
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD ImeIsActivated(PRBool *isActive NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD ImeDeactivate(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSINATIVEEVENTS(_to) \
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value) { return _to SendKeys(aNode, value); } \
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY) { return _to MouseMove(aNode, startX, startY, endX, endY); } \
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) { return _to Click(aNode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) { return _to MousePress(aNode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button) { return _to MouseRelease(anode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM) { return _to HasUnhandledEvents(aNode, hasEvents); } \
  NS_SCRIPTABLE NS_IMETHOD ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM) { return _to ImeGetAvailableEngines(enginesList); } \
  NS_SCRIPTABLE NS_IMETHOD ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM) { return _to ImeActivateEngine(engine, activationSucceeded); } \
  NS_SCRIPTABLE NS_IMETHOD ImeIsActivated(PRBool *isActive NS_OUTPARAM) { return _to ImeIsActivated(isActive); } \
  NS_SCRIPTABLE NS_IMETHOD ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM) { return _to ImeGetActiveEngine(activeEngine); } \
  NS_SCRIPTABLE NS_IMETHOD ImeDeactivate(void) { return _to ImeDeactivate(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSINATIVEEVENTS(_to) \
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value) { return !_to ? NS_ERROR_NULL_POINTER : _to->SendKeys(aNode, value); } \
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY) { return !_to ? NS_ERROR_NULL_POINTER : _to->MouseMove(aNode, startX, startY, endX, endY); } \
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) { return !_to ? NS_ERROR_NULL_POINTER : _to->Click(aNode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) { return !_to ? NS_ERROR_NULL_POINTER : _to->MousePress(aNode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button) { return !_to ? NS_ERROR_NULL_POINTER : _to->MouseRelease(anode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->HasUnhandledEvents(aNode, hasEvents); } \
  NS_SCRIPTABLE NS_IMETHOD ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeGetAvailableEngines(enginesList); } \
  NS_SCRIPTABLE NS_IMETHOD ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeActivateEngine(engine, activationSucceeded); } \
  NS_SCRIPTABLE NS_IMETHOD ImeIsActivated(PRBool *isActive NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeIsActivated(isActive); } \
  NS_SCRIPTABLE NS_IMETHOD ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeGetActiveEngine(activeEngine); } \
  NS_SCRIPTABLE NS_IMETHOD ImeDeactivate(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeDeactivate(); } 

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

/* void click (in nsISupports aNode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeEvents::Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void mousePress (in nsISupports aNode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeEvents::MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void mouseRelease (in nsISupports anode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeEvents::MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void hasUnhandledEvents (in nsISupports aNode, out boolean hasEvents); */
NS_IMETHODIMP nsNativeEvents::HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void imeGetAvailableEngines (out nsIArray enginesList); */
NS_IMETHODIMP nsNativeEvents::ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void imeActivateEngine (in string engine, out boolean activationSucceeded); */
NS_IMETHODIMP nsNativeEvents::ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void imeIsActivated (out boolean isActive); */
NS_IMETHODIMP nsNativeEvents::ImeIsActivated(PRBool *isActive NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void imeGetActiveEngine (out AString activeEngine); */
NS_IMETHODIMP nsNativeEvents::ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void imeDeactivate (); */
NS_IMETHODIMP nsNativeEvents::ImeDeactivate()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsINativeEvents_h__ */
