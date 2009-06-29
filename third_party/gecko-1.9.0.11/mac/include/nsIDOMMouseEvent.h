/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/events/nsIDOMMouseEvent.idl
 */

#ifndef __gen_nsIDOMMouseEvent_h__
#define __gen_nsIDOMMouseEvent_h__


#ifndef __gen_nsIDOMUIEvent_h__
#include "nsIDOMUIEvent.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMMouseEvent */
#define NS_IDOMMOUSEEVENT_IID_STR "ff751edc-8b02-aae7-0010-8301838a3123"

#define NS_IDOMMOUSEEVENT_IID \
  {0xff751edc, 0x8b02, 0xaae7, \
    { 0x00, 0x10, 0x83, 0x01, 0x83, 0x8a, 0x31, 0x23 }}

/**
 * The nsIDOMMouseEvent interface is the datatype for all mouse events
 * in the Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Events/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMMouseEvent : public nsIDOMUIEvent {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMMOUSEEVENT_IID)

  /* readonly attribute long screenX; */
  NS_SCRIPTABLE NS_IMETHOD GetScreenX(PRInt32 *aScreenX) = 0;

  /* readonly attribute long screenY; */
  NS_SCRIPTABLE NS_IMETHOD GetScreenY(PRInt32 *aScreenY) = 0;

  /* readonly attribute long clientX; */
  NS_SCRIPTABLE NS_IMETHOD GetClientX(PRInt32 *aClientX) = 0;

  /* readonly attribute long clientY; */
  NS_SCRIPTABLE NS_IMETHOD GetClientY(PRInt32 *aClientY) = 0;

  /* readonly attribute boolean ctrlKey; */
  NS_SCRIPTABLE NS_IMETHOD GetCtrlKey(PRBool *aCtrlKey) = 0;

  /* readonly attribute boolean shiftKey; */
  NS_SCRIPTABLE NS_IMETHOD GetShiftKey(PRBool *aShiftKey) = 0;

  /* readonly attribute boolean altKey; */
  NS_SCRIPTABLE NS_IMETHOD GetAltKey(PRBool *aAltKey) = 0;

  /* readonly attribute boolean metaKey; */
  NS_SCRIPTABLE NS_IMETHOD GetMetaKey(PRBool *aMetaKey) = 0;

  /* readonly attribute unsigned short button; */
  NS_SCRIPTABLE NS_IMETHOD GetButton(PRUint16 *aButton) = 0;

  /* readonly attribute nsIDOMEventTarget relatedTarget; */
  NS_SCRIPTABLE NS_IMETHOD GetRelatedTarget(nsIDOMEventTarget * *aRelatedTarget) = 0;

  /* void initMouseEvent (in DOMString typeArg, in boolean canBubbleArg, in boolean cancelableArg, in nsIDOMAbstractView viewArg, in long detailArg, in long screenXArg, in long screenYArg, in long clientXArg, in long clientYArg, in boolean ctrlKeyArg, in boolean altKeyArg, in boolean shiftKeyArg, in boolean metaKeyArg, in unsigned short buttonArg, in nsIDOMEventTarget relatedTargetArg); */
  NS_SCRIPTABLE NS_IMETHOD InitMouseEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg, PRInt32 screenXArg, PRInt32 screenYArg, PRInt32 clientXArg, PRInt32 clientYArg, PRBool ctrlKeyArg, PRBool altKeyArg, PRBool shiftKeyArg, PRBool metaKeyArg, PRUint16 buttonArg, nsIDOMEventTarget *relatedTargetArg) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMMouseEvent, NS_IDOMMOUSEEVENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMMOUSEEVENT \
  NS_SCRIPTABLE NS_IMETHOD GetScreenX(PRInt32 *aScreenX); \
  NS_SCRIPTABLE NS_IMETHOD GetScreenY(PRInt32 *aScreenY); \
  NS_SCRIPTABLE NS_IMETHOD GetClientX(PRInt32 *aClientX); \
  NS_SCRIPTABLE NS_IMETHOD GetClientY(PRInt32 *aClientY); \
  NS_SCRIPTABLE NS_IMETHOD GetCtrlKey(PRBool *aCtrlKey); \
  NS_SCRIPTABLE NS_IMETHOD GetShiftKey(PRBool *aShiftKey); \
  NS_SCRIPTABLE NS_IMETHOD GetAltKey(PRBool *aAltKey); \
  NS_SCRIPTABLE NS_IMETHOD GetMetaKey(PRBool *aMetaKey); \
  NS_SCRIPTABLE NS_IMETHOD GetButton(PRUint16 *aButton); \
  NS_SCRIPTABLE NS_IMETHOD GetRelatedTarget(nsIDOMEventTarget * *aRelatedTarget); \
  NS_SCRIPTABLE NS_IMETHOD InitMouseEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg, PRInt32 screenXArg, PRInt32 screenYArg, PRInt32 clientXArg, PRInt32 clientYArg, PRBool ctrlKeyArg, PRBool altKeyArg, PRBool shiftKeyArg, PRBool metaKeyArg, PRUint16 buttonArg, nsIDOMEventTarget *relatedTargetArg); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMMOUSEEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetScreenX(PRInt32 *aScreenX) { return _to GetScreenX(aScreenX); } \
  NS_SCRIPTABLE NS_IMETHOD GetScreenY(PRInt32 *aScreenY) { return _to GetScreenY(aScreenY); } \
  NS_SCRIPTABLE NS_IMETHOD GetClientX(PRInt32 *aClientX) { return _to GetClientX(aClientX); } \
  NS_SCRIPTABLE NS_IMETHOD GetClientY(PRInt32 *aClientY) { return _to GetClientY(aClientY); } \
  NS_SCRIPTABLE NS_IMETHOD GetCtrlKey(PRBool *aCtrlKey) { return _to GetCtrlKey(aCtrlKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetShiftKey(PRBool *aShiftKey) { return _to GetShiftKey(aShiftKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetAltKey(PRBool *aAltKey) { return _to GetAltKey(aAltKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetMetaKey(PRBool *aMetaKey) { return _to GetMetaKey(aMetaKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetButton(PRUint16 *aButton) { return _to GetButton(aButton); } \
  NS_SCRIPTABLE NS_IMETHOD GetRelatedTarget(nsIDOMEventTarget * *aRelatedTarget) { return _to GetRelatedTarget(aRelatedTarget); } \
  NS_SCRIPTABLE NS_IMETHOD InitMouseEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg, PRInt32 screenXArg, PRInt32 screenYArg, PRInt32 clientXArg, PRInt32 clientYArg, PRBool ctrlKeyArg, PRBool altKeyArg, PRBool shiftKeyArg, PRBool metaKeyArg, PRUint16 buttonArg, nsIDOMEventTarget *relatedTargetArg) { return _to InitMouseEvent(typeArg, canBubbleArg, cancelableArg, viewArg, detailArg, screenXArg, screenYArg, clientXArg, clientYArg, ctrlKeyArg, altKeyArg, shiftKeyArg, metaKeyArg, buttonArg, relatedTargetArg); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMMOUSEEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetScreenX(PRInt32 *aScreenX) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScreenX(aScreenX); } \
  NS_SCRIPTABLE NS_IMETHOD GetScreenY(PRInt32 *aScreenY) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScreenY(aScreenY); } \
  NS_SCRIPTABLE NS_IMETHOD GetClientX(PRInt32 *aClientX) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClientX(aClientX); } \
  NS_SCRIPTABLE NS_IMETHOD GetClientY(PRInt32 *aClientY) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClientY(aClientY); } \
  NS_SCRIPTABLE NS_IMETHOD GetCtrlKey(PRBool *aCtrlKey) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCtrlKey(aCtrlKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetShiftKey(PRBool *aShiftKey) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetShiftKey(aShiftKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetAltKey(PRBool *aAltKey) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAltKey(aAltKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetMetaKey(PRBool *aMetaKey) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMetaKey(aMetaKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetButton(PRUint16 *aButton) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetButton(aButton); } \
  NS_SCRIPTABLE NS_IMETHOD GetRelatedTarget(nsIDOMEventTarget * *aRelatedTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRelatedTarget(aRelatedTarget); } \
  NS_SCRIPTABLE NS_IMETHOD InitMouseEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg, PRInt32 screenXArg, PRInt32 screenYArg, PRInt32 clientXArg, PRInt32 clientYArg, PRBool ctrlKeyArg, PRBool altKeyArg, PRBool shiftKeyArg, PRBool metaKeyArg, PRUint16 buttonArg, nsIDOMEventTarget *relatedTargetArg) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitMouseEvent(typeArg, canBubbleArg, cancelableArg, viewArg, detailArg, screenXArg, screenYArg, clientXArg, clientYArg, ctrlKeyArg, altKeyArg, shiftKeyArg, metaKeyArg, buttonArg, relatedTargetArg); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMMouseEvent : public nsIDOMMouseEvent
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMMOUSEEVENT

  nsDOMMouseEvent();

private:
  ~nsDOMMouseEvent();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMMouseEvent, nsIDOMMouseEvent)

nsDOMMouseEvent::nsDOMMouseEvent()
{
  /* member initializers and constructor code */
}

nsDOMMouseEvent::~nsDOMMouseEvent()
{
  /* destructor code */
}

/* readonly attribute long screenX; */
NS_IMETHODIMP nsDOMMouseEvent::GetScreenX(PRInt32 *aScreenX)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long screenY; */
NS_IMETHODIMP nsDOMMouseEvent::GetScreenY(PRInt32 *aScreenY)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long clientX; */
NS_IMETHODIMP nsDOMMouseEvent::GetClientX(PRInt32 *aClientX)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long clientY; */
NS_IMETHODIMP nsDOMMouseEvent::GetClientY(PRInt32 *aClientY)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean ctrlKey; */
NS_IMETHODIMP nsDOMMouseEvent::GetCtrlKey(PRBool *aCtrlKey)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean shiftKey; */
NS_IMETHODIMP nsDOMMouseEvent::GetShiftKey(PRBool *aShiftKey)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean altKey; */
NS_IMETHODIMP nsDOMMouseEvent::GetAltKey(PRBool *aAltKey)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean metaKey; */
NS_IMETHODIMP nsDOMMouseEvent::GetMetaKey(PRBool *aMetaKey)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned short button; */
NS_IMETHODIMP nsDOMMouseEvent::GetButton(PRUint16 *aButton)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMEventTarget relatedTarget; */
NS_IMETHODIMP nsDOMMouseEvent::GetRelatedTarget(nsIDOMEventTarget * *aRelatedTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void initMouseEvent (in DOMString typeArg, in boolean canBubbleArg, in boolean cancelableArg, in nsIDOMAbstractView viewArg, in long detailArg, in long screenXArg, in long screenYArg, in long clientXArg, in long clientYArg, in boolean ctrlKeyArg, in boolean altKeyArg, in boolean shiftKeyArg, in boolean metaKeyArg, in unsigned short buttonArg, in nsIDOMEventTarget relatedTargetArg); */
NS_IMETHODIMP nsDOMMouseEvent::InitMouseEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, nsIDOMAbstractView *viewArg, PRInt32 detailArg, PRInt32 screenXArg, PRInt32 screenYArg, PRInt32 clientXArg, PRInt32 clientYArg, PRBool ctrlKeyArg, PRBool altKeyArg, PRBool shiftKeyArg, PRBool metaKeyArg, PRUint16 buttonArg, nsIDOMEventTarget *relatedTargetArg)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMMouseEvent_h__ */
