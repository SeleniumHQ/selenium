/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/events/nsIDOMEvent.idl
 */

#ifndef __gen_nsIDOMEvent_h__
#define __gen_nsIDOMEvent_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIDOMEventTarget; /* forward declaration */


/* starting interface:    nsIDOMEvent */
#define NS_IDOMEVENT_IID_STR "a66b7b80-ff46-bd97-0080-5f8ae38add32"

#define NS_IDOMEVENT_IID \
  {0xa66b7b80, 0xff46, 0xbd97, \
    { 0x00, 0x80, 0x5f, 0x8a, 0xe3, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMEvent : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMEVENT_IID)

  /**
 * The nsIDOMEvent interface is the primary datatype for all events in
 * the Document Object Model.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Events/
 *
 * @status FROZEN
 */
/**
   * The current event phase is the capturing phase.
   */
  enum { CAPTURING_PHASE = 1U };

  /**
   * The event is currently being evaluated at the target EventTarget.
   */
  enum { AT_TARGET = 2U };

  /**
   * The current event phase is the bubbling phase.
   */
  enum { BUBBLING_PHASE = 3U };

  /**
   * The name of the event (case-insensitive). The name must be an XML 
   * name.
   */
  /* readonly attribute DOMString type; */
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) = 0;

  /**
   * Used to indicate the EventTarget to which the event was originally 
   * dispatched.
   */
  /* readonly attribute nsIDOMEventTarget target; */
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsIDOMEventTarget * *aTarget) = 0;

  /**
   * Used to indicate the EventTarget whose EventListeners are currently 
   * being processed. This is particularly useful during capturing and 
   * bubbling.
   */
  /* readonly attribute nsIDOMEventTarget currentTarget; */
  NS_SCRIPTABLE NS_IMETHOD GetCurrentTarget(nsIDOMEventTarget * *aCurrentTarget) = 0;

  /**
   * Used to indicate which phase of event flow is currently being 
   * evaluated.
   */
  /* readonly attribute unsigned short eventPhase; */
  NS_SCRIPTABLE NS_IMETHOD GetEventPhase(PRUint16 *aEventPhase) = 0;

  /**
   * Used to indicate whether or not an event is a bubbling event. If the 
   * event can bubble the value is true, else the value is false.
   */
  /* readonly attribute boolean bubbles; */
  NS_SCRIPTABLE NS_IMETHOD GetBubbles(PRBool *aBubbles) = 0;

  /**
   * Used to indicate whether or not an event can have its default action 
   * prevented. If the default action can be prevented the value is true, 
   * else the value is false.
   */
  /* readonly attribute boolean cancelable; */
  NS_SCRIPTABLE NS_IMETHOD GetCancelable(PRBool *aCancelable) = 0;

  /**
   * Used to specify the time (in milliseconds relative to the epoch) at 
   * which the event was created. Due to the fact that some systems may 
   * not provide this information the value of timeStamp may be not 
   * available for all events. When not available, a value of 0 will be 
   * returned. Examples of epoch time are the time of the system start or 
   * 0:0:0 UTC 1st January 1970.
   */
  /* readonly attribute DOMTimeStamp timeStamp; */
  NS_SCRIPTABLE NS_IMETHOD GetTimeStamp(DOMTimeStamp *aTimeStamp) = 0;

  /**
   * The stopPropagation method is used prevent further propagation of an 
   * event during event flow. If this method is called by any 
   * EventListener the event will cease propagating through the tree. The 
   * event will complete dispatch to all listeners on the current 
   * EventTarget before event flow stops. This method may be used during 
   * any stage of event flow.
   */
  /* void stopPropagation (); */
  NS_SCRIPTABLE NS_IMETHOD StopPropagation(void) = 0;

  /**
   * If an event is cancelable, the preventDefault method is used to 
   * signify that the event is to be canceled, meaning any default action 
   * normally taken by the implementation as a result of the event will 
   * not occur. If, during any stage of event flow, the preventDefault 
   * method is called the event is canceled. Any default action associated 
   * with the event will not occur. Calling this method for a 
   * non-cancelable event has no effect. Once preventDefault has been 
   * called it will remain in effect throughout the remainder of the 
   * event's propagation. This method may be used during any stage of 
   * event flow.
   */
  /* void preventDefault (); */
  NS_SCRIPTABLE NS_IMETHOD PreventDefault(void) = 0;

  /**
   * The initEvent method is used to initialize the value of an Event 
   * created through the DocumentEvent interface. This method may only be 
   * called before the Event has been dispatched via the dispatchEvent 
   * method, though it may be called multiple times during that phase if 
   * necessary. If called multiple times the final invocation takes 
   * precedence. If called from a subclass of Event interface only the 
   * values specified in the initEvent method are modified, all other 
   * attributes are left unchanged.
   *
   * @param   eventTypeArg Specifies the event type. This type may be 
   *                       any event type currently defined in this 
   *                       specification or a new event type.. The string 
   *                       must be an XML name.
   *                       Any new event type must not begin with any 
   *                       upper, lower, or mixed case version of the 
   *                       string "DOM". This prefix is reserved for 
   *                       future DOM event sets. It is also strongly 
   *                       recommended that third parties adding their 
   *                       own events use their own prefix to avoid 
   *                       confusion and lessen the probability of 
   *                       conflicts with other new events.
   * @param   canBubbleArg Specifies whether or not the event can bubble.
   * @param   cancelableArg Specifies whether or not the event's default 
   *                        action can be prevented.
   */
  /* void initEvent (in DOMString eventTypeArg, in boolean canBubbleArg, in boolean cancelableArg); */
  NS_SCRIPTABLE NS_IMETHOD InitEvent(const nsAString & eventTypeArg, PRBool canBubbleArg, PRBool cancelableArg) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMEvent, NS_IDOMEVENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMEVENT \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType); \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsIDOMEventTarget * *aTarget); \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentTarget(nsIDOMEventTarget * *aCurrentTarget); \
  NS_SCRIPTABLE NS_IMETHOD GetEventPhase(PRUint16 *aEventPhase); \
  NS_SCRIPTABLE NS_IMETHOD GetBubbles(PRBool *aBubbles); \
  NS_SCRIPTABLE NS_IMETHOD GetCancelable(PRBool *aCancelable); \
  NS_SCRIPTABLE NS_IMETHOD GetTimeStamp(DOMTimeStamp *aTimeStamp); \
  NS_SCRIPTABLE NS_IMETHOD StopPropagation(void); \
  NS_SCRIPTABLE NS_IMETHOD PreventDefault(void); \
  NS_SCRIPTABLE NS_IMETHOD InitEvent(const nsAString & eventTypeArg, PRBool canBubbleArg, PRBool cancelableArg); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return _to GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsIDOMEventTarget * *aTarget) { return _to GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentTarget(nsIDOMEventTarget * *aCurrentTarget) { return _to GetCurrentTarget(aCurrentTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetEventPhase(PRUint16 *aEventPhase) { return _to GetEventPhase(aEventPhase); } \
  NS_SCRIPTABLE NS_IMETHOD GetBubbles(PRBool *aBubbles) { return _to GetBubbles(aBubbles); } \
  NS_SCRIPTABLE NS_IMETHOD GetCancelable(PRBool *aCancelable) { return _to GetCancelable(aCancelable); } \
  NS_SCRIPTABLE NS_IMETHOD GetTimeStamp(DOMTimeStamp *aTimeStamp) { return _to GetTimeStamp(aTimeStamp); } \
  NS_SCRIPTABLE NS_IMETHOD StopPropagation(void) { return _to StopPropagation(); } \
  NS_SCRIPTABLE NS_IMETHOD PreventDefault(void) { return _to PreventDefault(); } \
  NS_SCRIPTABLE NS_IMETHOD InitEvent(const nsAString & eventTypeArg, PRBool canBubbleArg, PRBool cancelableArg) { return _to InitEvent(eventTypeArg, canBubbleArg, cancelableArg); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsIDOMEventTarget * *aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentTarget(nsIDOMEventTarget * *aCurrentTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCurrentTarget(aCurrentTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetEventPhase(PRUint16 *aEventPhase) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEventPhase(aEventPhase); } \
  NS_SCRIPTABLE NS_IMETHOD GetBubbles(PRBool *aBubbles) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBubbles(aBubbles); } \
  NS_SCRIPTABLE NS_IMETHOD GetCancelable(PRBool *aCancelable) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCancelable(aCancelable); } \
  NS_SCRIPTABLE NS_IMETHOD GetTimeStamp(DOMTimeStamp *aTimeStamp) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTimeStamp(aTimeStamp); } \
  NS_SCRIPTABLE NS_IMETHOD StopPropagation(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->StopPropagation(); } \
  NS_SCRIPTABLE NS_IMETHOD PreventDefault(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->PreventDefault(); } \
  NS_SCRIPTABLE NS_IMETHOD InitEvent(const nsAString & eventTypeArg, PRBool canBubbleArg, PRBool cancelableArg) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitEvent(eventTypeArg, canBubbleArg, cancelableArg); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMEvent : public nsIDOMEvent
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMEVENT

  nsDOMEvent();

private:
  ~nsDOMEvent();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMEvent, nsIDOMEvent)

nsDOMEvent::nsDOMEvent()
{
  /* member initializers and constructor code */
}

nsDOMEvent::~nsDOMEvent()
{
  /* destructor code */
}

/* readonly attribute DOMString type; */
NS_IMETHODIMP nsDOMEvent::GetType(nsAString & aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMEventTarget target; */
NS_IMETHODIMP nsDOMEvent::GetTarget(nsIDOMEventTarget * *aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMEventTarget currentTarget; */
NS_IMETHODIMP nsDOMEvent::GetCurrentTarget(nsIDOMEventTarget * *aCurrentTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned short eventPhase; */
NS_IMETHODIMP nsDOMEvent::GetEventPhase(PRUint16 *aEventPhase)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean bubbles; */
NS_IMETHODIMP nsDOMEvent::GetBubbles(PRBool *aBubbles)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean cancelable; */
NS_IMETHODIMP nsDOMEvent::GetCancelable(PRBool *aCancelable)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMTimeStamp timeStamp; */
NS_IMETHODIMP nsDOMEvent::GetTimeStamp(DOMTimeStamp *aTimeStamp)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void stopPropagation (); */
NS_IMETHODIMP nsDOMEvent::StopPropagation()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void preventDefault (); */
NS_IMETHODIMP nsDOMEvent::PreventDefault()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void initEvent (in DOMString eventTypeArg, in boolean canBubbleArg, in boolean cancelableArg); */
NS_IMETHODIMP nsDOMEvent::InitEvent(const nsAString & eventTypeArg, PRBool canBubbleArg, PRBool cancelableArg)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMEvent_h__ */
