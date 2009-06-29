/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/events/nsIDOMCustomEvent.idl
 */

#ifndef __gen_nsIDOMCustomEvent_h__
#define __gen_nsIDOMCustomEvent_h__


#ifndef __gen_nsIDOMEvent_h__
#include "nsIDOMEvent.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMCustomEvent */
#define NS_IDOMCUSTOMEVENT_IID_STR "55c7af7b-1a64-40bf-87eb-2c2cbee0491b"

#define NS_IDOMCUSTOMEVENT_IID \
  {0x55c7af7b, 0x1a64, 0x40bf, \
    { 0x87, 0xeb, 0x2c, 0x2c, 0xbe, 0xe0, 0x49, 0x1b }}

/**
 * The nsIDOMEventTarget interface is the interface implemented by all
 * event targets in the Document Object Model.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-3-Events/
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMCustomEvent : public nsIDOMEvent {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMCUSTOMEVENT_IID)

  /* void setCurrentTarget (in nsIDOMNode target); */
  NS_SCRIPTABLE NS_IMETHOD SetCurrentTarget(nsIDOMNode *target) = 0;

  /* void setEventPhase (in unsigned short phase); */
  NS_SCRIPTABLE NS_IMETHOD SetEventPhase(PRUint16 phase) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMCustomEvent, NS_IDOMCUSTOMEVENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMCUSTOMEVENT \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentTarget(nsIDOMNode *target); \
  NS_SCRIPTABLE NS_IMETHOD SetEventPhase(PRUint16 phase); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMCUSTOMEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentTarget(nsIDOMNode *target) { return _to SetCurrentTarget(target); } \
  NS_SCRIPTABLE NS_IMETHOD SetEventPhase(PRUint16 phase) { return _to SetEventPhase(phase); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMCUSTOMEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentTarget(nsIDOMNode *target) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCurrentTarget(target); } \
  NS_SCRIPTABLE NS_IMETHOD SetEventPhase(PRUint16 phase) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetEventPhase(phase); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMCustomEvent : public nsIDOMCustomEvent
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMCUSTOMEVENT

  nsDOMCustomEvent();

private:
  ~nsDOMCustomEvent();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMCustomEvent, nsIDOMCustomEvent)

nsDOMCustomEvent::nsDOMCustomEvent()
{
  /* member initializers and constructor code */
}

nsDOMCustomEvent::~nsDOMCustomEvent()
{
  /* destructor code */
}

/* void setCurrentTarget (in nsIDOMNode target); */
NS_IMETHODIMP nsDOMCustomEvent::SetCurrentTarget(nsIDOMNode *target)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setEventPhase (in unsigned short phase); */
NS_IMETHODIMP nsDOMCustomEvent::SetEventPhase(PRUint16 phase)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMCustomEvent_h__ */
