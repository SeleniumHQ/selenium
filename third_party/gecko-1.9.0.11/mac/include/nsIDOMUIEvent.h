/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/events/nsIDOMUIEvent.idl
 */

#ifndef __gen_nsIDOMUIEvent_h__
#define __gen_nsIDOMUIEvent_h__


#ifndef __gen_nsIDOMEvent_h__
#include "nsIDOMEvent.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMUIEvent */
#define NS_IDOMUIEVENT_IID_STR "a6cf90c3-15b3-11d2-932e-00805f8add32"

#define NS_IDOMUIEVENT_IID \
  {0xa6cf90c3, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMUIEvent interface is the datatype for all UI events in the
 * Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Events/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMUIEvent : public nsIDOMEvent {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMUIEVENT_IID)

  /* readonly attribute nsIDOMAbstractView view; */
  NS_SCRIPTABLE NS_IMETHOD GetView(nsIDOMAbstractView * *aView) = 0;

  /* readonly attribute long detail; */
  NS_SCRIPTABLE NS_IMETHOD GetDetail(PRInt32 *aDetail) = 0;

  /* void initUIEvent (in DOMString typeArg, in boolean canBubbleArg, in boolean cancelableArg, in nsIDOMAbstractView viewArg, in long detailArg); */
  NS_SCRIPTABLE NS_IMETHOD InitUIEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMUIEvent, NS_IDOMUIEVENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMUIEVENT \
  NS_SCRIPTABLE NS_IMETHOD GetView(nsIDOMAbstractView * *aView); \
  NS_SCRIPTABLE NS_IMETHOD GetDetail(PRInt32 *aDetail); \
  NS_SCRIPTABLE NS_IMETHOD InitUIEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMUIEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetView(nsIDOMAbstractView * *aView) { return _to GetView(aView); } \
  NS_SCRIPTABLE NS_IMETHOD GetDetail(PRInt32 *aDetail) { return _to GetDetail(aDetail); } \
  NS_SCRIPTABLE NS_IMETHOD InitUIEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg) { return _to InitUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg, detailArg); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMUIEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetView(nsIDOMAbstractView * *aView) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetView(aView); } \
  NS_SCRIPTABLE NS_IMETHOD GetDetail(PRInt32 *aDetail) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDetail(aDetail); } \
  NS_SCRIPTABLE NS_IMETHOD InitUIEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg, detailArg); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMUIEvent : public nsIDOMUIEvent
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMUIEVENT

  nsDOMUIEvent();

private:
  ~nsDOMUIEvent();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMUIEvent, nsIDOMUIEvent)

nsDOMUIEvent::nsDOMUIEvent()
{
  /* member initializers and constructor code */
}

nsDOMUIEvent::~nsDOMUIEvent()
{
  /* destructor code */
}

/* readonly attribute nsIDOMAbstractView view; */
NS_IMETHODIMP nsDOMUIEvent::GetView(nsIDOMAbstractView * *aView)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long detail; */
NS_IMETHODIMP nsDOMUIEvent::GetDetail(PRInt32 *aDetail)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void initUIEvent (in DOMString typeArg, in boolean canBubbleArg, in boolean cancelableArg, in nsIDOMAbstractView viewArg, in long detailArg); */
NS_IMETHODIMP nsDOMUIEvent::InitUIEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMUIEvent_h__ */
