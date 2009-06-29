/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/events/nsIDOMDocumentEvent.idl
 */

#ifndef __gen_nsIDOMDocumentEvent_h__
#define __gen_nsIDOMDocumentEvent_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMDocumentEvent */
#define NS_IDOMDOCUMENTEVENT_IID_STR "46b91d66-28e2-11d4-ab1e-0010830123b4"

#define NS_IDOMDOCUMENTEVENT_IID \
  {0x46b91d66, 0x28e2, 0x11d4, \
    { 0xab, 0x1e, 0x00, 0x10, 0x83, 0x01, 0x23, 0xb4 }}

/**
 * The nsIDOMDocumentEvent interface is the interface to the event
 * factory method on a DOM document object.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Events/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMDocumentEvent : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMDOCUMENTEVENT_IID)

  /* nsIDOMEvent createEvent (in DOMString eventType)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateEvent(const nsAString & eventType, nsIDOMEvent **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMDocumentEvent, NS_IDOMDOCUMENTEVENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMDOCUMENTEVENT \
  NS_SCRIPTABLE NS_IMETHOD CreateEvent(const nsAString & eventType, nsIDOMEvent **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMDOCUMENTEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateEvent(const nsAString & eventType, nsIDOMEvent **_retval) { return _to CreateEvent(eventType, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMDOCUMENTEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateEvent(const nsAString & eventType, nsIDOMEvent **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateEvent(eventType, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMDocumentEvent : public nsIDOMDocumentEvent
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMDOCUMENTEVENT

  nsDOMDocumentEvent();

private:
  ~nsDOMDocumentEvent();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMDocumentEvent, nsIDOMDocumentEvent)

nsDOMDocumentEvent::nsDOMDocumentEvent()
{
  /* member initializers and constructor code */
}

nsDOMDocumentEvent::~nsDOMDocumentEvent()
{
  /* destructor code */
}

/* nsIDOMEvent createEvent (in DOMString eventType)  raises (DOMException); */
NS_IMETHODIMP nsDOMDocumentEvent::CreateEvent(const nsAString & eventType, nsIDOMEvent **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMDocumentEvent_h__ */
