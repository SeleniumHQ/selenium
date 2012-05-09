/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM cpp/webdriver-firefox/nsINativeEvents.idl
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

  /* void hasUnhandledEvents (in nsISupports aNode, out boolean hasEvents); */
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM) = 0;

  /* void notifyOfSwitchToWindow (in long windowId); */
  NS_SCRIPTABLE NS_IMETHOD NotifyOfSwitchToWindow(PRInt32 windowId) = 0;

  /* void notifyOfCloseWindow (in long windowId); */
  NS_SCRIPTABLE NS_IMETHOD NotifyOfCloseWindow(PRInt32 windowId) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsINativeEvents, NS_INATIVEEVENTS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSINATIVEEVENTS \
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD NotifyOfSwitchToWindow(PRInt32 windowId); \
  NS_SCRIPTABLE NS_IMETHOD NotifyOfCloseWindow(PRInt32 windowId); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSINATIVEEVENTS(_to) \
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM) { return _to HasUnhandledEvents(aNode, hasEvents); } \
  NS_SCRIPTABLE NS_IMETHOD NotifyOfSwitchToWindow(PRInt32 windowId) { return _to NotifyOfSwitchToWindow(windowId); } \
  NS_SCRIPTABLE NS_IMETHOD NotifyOfCloseWindow(PRInt32 windowId) { return _to NotifyOfCloseWindow(windowId); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSINATIVEEVENTS(_to) \
  NS_SCRIPTABLE NS_IMETHOD HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->HasUnhandledEvents(aNode, hasEvents); } \
  NS_SCRIPTABLE NS_IMETHOD NotifyOfSwitchToWindow(PRInt32 windowId) { return !_to ? NS_ERROR_NULL_POINTER : _to->NotifyOfSwitchToWindow(windowId); } \
  NS_SCRIPTABLE NS_IMETHOD NotifyOfCloseWindow(PRInt32 windowId) { return !_to ? NS_ERROR_NULL_POINTER : _to->NotifyOfCloseWindow(windowId); } 

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

/* void hasUnhandledEvents (in nsISupports aNode, out boolean hasEvents); */
NS_IMETHODIMP nsNativeEvents::HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void notifyOfSwitchToWindow (in long windowId); */
NS_IMETHODIMP nsNativeEvents::NotifyOfSwitchToWindow(PRInt32 windowId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void notifyOfCloseWindow (in long windowId); */
NS_IMETHODIMP nsNativeEvents::NotifyOfCloseWindow(PRInt32 windowId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsINativeEvents_h__ */
