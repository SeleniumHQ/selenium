/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/events/nsIDOM3EventTarget.idl
 */

#ifndef __gen_nsIDOM3EventTarget_h__
#define __gen_nsIDOM3EventTarget_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOM3EventTarget */
#define NS_IDOM3EVENTTARGET_IID_STR "3e9c01a7-de97-4c3b-8294-b4bd9d7056d1"

#define NS_IDOM3EVENTTARGET_IID \
  {0x3e9c01a7, 0xde97, 0x4c3b, \
    { 0x82, 0x94, 0xb4, 0xbd, 0x9d, 0x70, 0x56, 0xd1 }}

/**
 * The nsIDOMEventTarget interface is the interface implemented by all
 * event targets in the Document Object Model.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-3-Events/
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOM3EventTarget : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOM3EVENTTARGET_IID)

  /* void addGroupedEventListener (in DOMString type, in nsIDOMEventListener listener, in boolean useCapture, in nsIDOMEventGroup evtGroup); */
  NS_SCRIPTABLE NS_IMETHOD AddGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup) = 0;

  /* void removeGroupedEventListener (in DOMString type, in nsIDOMEventListener listener, in boolean useCapture, in nsIDOMEventGroup evtGroup); */
  NS_SCRIPTABLE NS_IMETHOD RemoveGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup) = 0;

  /* boolean canTrigger (in DOMString type); */
  NS_SCRIPTABLE NS_IMETHOD CanTrigger(const nsAString & type, PRBool *_retval) = 0;

  /* boolean isRegisteredHere (in DOMString type); */
  NS_SCRIPTABLE NS_IMETHOD IsRegisteredHere(const nsAString & type, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOM3EventTarget, NS_IDOM3EVENTTARGET_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOM3EVENTTARGET \
  NS_SCRIPTABLE NS_IMETHOD AddGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup); \
  NS_SCRIPTABLE NS_IMETHOD RemoveGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup); \
  NS_SCRIPTABLE NS_IMETHOD CanTrigger(const nsAString & type, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsRegisteredHere(const nsAString & type, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOM3EVENTTARGET(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup) { return _to AddGroupedEventListener(type, listener, useCapture, evtGroup); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup) { return _to RemoveGroupedEventListener(type, listener, useCapture, evtGroup); } \
  NS_SCRIPTABLE NS_IMETHOD CanTrigger(const nsAString & type, PRBool *_retval) { return _to CanTrigger(type, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsRegisteredHere(const nsAString & type, PRBool *_retval) { return _to IsRegisteredHere(type, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOM3EVENTTARGET(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddGroupedEventListener(type, listener, useCapture, evtGroup); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveGroupedEventListener(type, listener, useCapture, evtGroup); } \
  NS_SCRIPTABLE NS_IMETHOD CanTrigger(const nsAString & type, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CanTrigger(type, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsRegisteredHere(const nsAString & type, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsRegisteredHere(type, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOM3EventTarget : public nsIDOM3EventTarget
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOM3EVENTTARGET

  nsDOM3EventTarget();

private:
  ~nsDOM3EventTarget();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOM3EventTarget, nsIDOM3EventTarget)

nsDOM3EventTarget::nsDOM3EventTarget()
{
  /* member initializers and constructor code */
}

nsDOM3EventTarget::~nsDOM3EventTarget()
{
  /* destructor code */
}

/* void addGroupedEventListener (in DOMString type, in nsIDOMEventListener listener, in boolean useCapture, in nsIDOMEventGroup evtGroup); */
NS_IMETHODIMP nsDOM3EventTarget::AddGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeGroupedEventListener (in DOMString type, in nsIDOMEventListener listener, in boolean useCapture, in nsIDOMEventGroup evtGroup); */
NS_IMETHODIMP nsDOM3EventTarget::RemoveGroupedEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture, nsIDOMEventGroup *evtGroup)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean canTrigger (in DOMString type); */
NS_IMETHODIMP nsDOM3EventTarget::CanTrigger(const nsAString & type, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isRegisteredHere (in DOMString type); */
NS_IMETHODIMP nsDOM3EventTarget::IsRegisteredHere(const nsAString & type, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOM3EventTarget_h__ */
