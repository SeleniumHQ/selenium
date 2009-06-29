/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/events/nsIDOM3DocumentEvent.idl
 */

#ifndef __gen_nsIDOM3DocumentEvent_h__
#define __gen_nsIDOM3DocumentEvent_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOM3DocumentEvent */
#define NS_IDOM3DOCUMENTEVENT_IID_STR "090ecc19-b7cb-4f47-ae47-ed68d4926249"

#define NS_IDOM3DOCUMENTEVENT_IID \
  {0x090ecc19, 0xb7cb, 0x4f47, \
    { 0xae, 0x47, 0xed, 0x68, 0xd4, 0x92, 0x62, 0x49 }}

/**
 * The nsIDOMDocumentEvent interface is the interface to the event
 * factory method on a DOM document object.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-3-Events/
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOM3DocumentEvent : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOM3DOCUMENTEVENT_IID)

  /* nsIDOMEventGroup createEventGroup (); */
  NS_SCRIPTABLE NS_IMETHOD CreateEventGroup(nsIDOMEventGroup **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOM3DocumentEvent, NS_IDOM3DOCUMENTEVENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOM3DOCUMENTEVENT \
  NS_SCRIPTABLE NS_IMETHOD CreateEventGroup(nsIDOMEventGroup **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOM3DOCUMENTEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateEventGroup(nsIDOMEventGroup **_retval) { return _to CreateEventGroup(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOM3DOCUMENTEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateEventGroup(nsIDOMEventGroup **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateEventGroup(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOM3DocumentEvent : public nsIDOM3DocumentEvent
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOM3DOCUMENTEVENT

  nsDOM3DocumentEvent();

private:
  ~nsDOM3DocumentEvent();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOM3DocumentEvent, nsIDOM3DocumentEvent)

nsDOM3DocumentEvent::nsDOM3DocumentEvent()
{
  /* member initializers and constructor code */
}

nsDOM3DocumentEvent::~nsDOM3DocumentEvent()
{
  /* destructor code */
}

/* nsIDOMEventGroup createEventGroup (); */
NS_IMETHODIMP nsDOM3DocumentEvent::CreateEventGroup(nsIDOMEventGroup **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOM3DocumentEvent_h__ */
