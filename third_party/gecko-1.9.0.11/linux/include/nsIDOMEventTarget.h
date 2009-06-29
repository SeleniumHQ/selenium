/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/events/nsIDOMEventTarget.idl
 */

#ifndef __gen_nsIDOMEventTarget_h__
#define __gen_nsIDOMEventTarget_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMEventTarget */
#define NS_IDOMEVENTTARGET_IID_STR "1c773b30-d1cf-11d2-bd95-00805f8ae3f4"

#define NS_IDOMEVENTTARGET_IID \
  {0x1c773b30, 0xd1cf, 0x11d2, \
    { 0xbd, 0x95, 0x00, 0x80, 0x5f, 0x8a, 0xe3, 0xf4 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMEventTarget : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMEVENTTARGET_IID)

  /**
 * The nsIDOMEventTarget interface is the interface implemented by all
 * event targets in the Document Object Model.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Events/
 *
 * @status FROZEN
 */
/**
   * This method allows the registration of event listeners on the event target.
   * If an EventListener is added to an EventTarget while it is processing an
   * event, it will not be triggered by the current actions but may be 
   * triggered during a later stage of event flow, such as the bubbling phase.
   * 
   * If multiple identical EventListeners are registered on the same 
   * EventTarget with the same parameters the duplicate instances are 
   * discarded. They do not cause the EventListener to be called twice 
   * and since they are discarded they do not need to be removed with the 
   * removeEventListener method.
   *
   * @param   type The event type for which the user is registering
   * @param   listener The listener parameter takes an interface 
   *                   implemented by the user which contains the methods 
   *                   to be called when the event occurs.
   * @param   useCapture If true, useCapture indicates that the user 
   *                     wishes to initiate capture. After initiating 
   *                     capture, all events of the specified type will be 
   *                     dispatched to the registered EventListener before 
   *                     being dispatched to any EventTargets beneath them 
   *                     in the tree. Events which are bubbling upward 
   *                     through the tree will not trigger an 
   *                     EventListener designated to use capture.
   */
  /* void addEventListener (in DOMString type, in nsIDOMEventListener listener, in boolean useCapture); */
  NS_SCRIPTABLE NS_IMETHOD AddEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture) = 0;

  /**
   * This method allows the removal of event listeners from the event 
   * target. If an EventListener is removed from an EventTarget while it 
   * is processing an event, it will not be triggered by the current actions. 
   * EventListeners can never be invoked after being removed.
   * Calling removeEventListener with arguments which do not identify any 
   * currently registered EventListener on the EventTarget has no effect.
   *
   * @param   type Specifies the event type of the EventListener being 
   *               removed.
   * @param   listener The EventListener parameter indicates the 
   *                   EventListener to be removed.
   * @param   useCapture Specifies whether the EventListener being 
   *                     removed was registered as a capturing listener or 
   *                     not. If a listener was registered twice, one with 
   *                     capture and one without, each must be removed 
   *                     separately. Removal of a capturing listener does 
   *                     not affect a non-capturing version of the same 
   *                     listener, and vice versa.
   */
  /* void removeEventListener (in DOMString type, in nsIDOMEventListener listener, in boolean useCapture); */
  NS_SCRIPTABLE NS_IMETHOD RemoveEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture) = 0;

  /**
   * This method allows the dispatch of events into the implementations 
   * event model. Events dispatched in this manner will have the same 
   * capturing and bubbling behavior as events dispatched directly by the 
   * implementation. The target of the event is the EventTarget on which 
   * dispatchEvent is called.
   *
   * @param   evt Specifies the event type, behavior, and contextual 
   *              information to be used in processing the event.
   * @return  Indicates whether any of the listeners which handled the 
   *          event called preventDefault. If preventDefault was called 
   *          the value is false, else the value is true.
   * @throws  UNSPECIFIED_EVENT_TYPE_ERR: Raised if the Event's type was 
   *              not specified by initializing the event before 
   *              dispatchEvent was called. Specification of the Event's 
   *              type as null or an empty string will also trigger this 
   *              exception.
   */
  /* boolean dispatchEvent (in nsIDOMEvent evt)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD DispatchEvent(nsIDOMEvent *evt, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMEventTarget, NS_IDOMEVENTTARGET_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMEVENTTARGET \
  NS_SCRIPTABLE NS_IMETHOD AddEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture); \
  NS_SCRIPTABLE NS_IMETHOD RemoveEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture); \
  NS_SCRIPTABLE NS_IMETHOD DispatchEvent(nsIDOMEvent *evt, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMEVENTTARGET(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture) { return _to AddEventListener(type, listener, useCapture); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture) { return _to RemoveEventListener(type, listener, useCapture); } \
  NS_SCRIPTABLE NS_IMETHOD DispatchEvent(nsIDOMEvent *evt, PRBool *_retval) { return _to DispatchEvent(evt, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMEVENTTARGET(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddEventListener(type, listener, useCapture); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveEventListener(type, listener, useCapture); } \
  NS_SCRIPTABLE NS_IMETHOD DispatchEvent(nsIDOMEvent *evt, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->DispatchEvent(evt, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMEventTarget : public nsIDOMEventTarget
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMEVENTTARGET

  nsDOMEventTarget();

private:
  ~nsDOMEventTarget();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMEventTarget, nsIDOMEventTarget)

nsDOMEventTarget::nsDOMEventTarget()
{
  /* member initializers and constructor code */
}

nsDOMEventTarget::~nsDOMEventTarget()
{
  /* destructor code */
}

/* void addEventListener (in DOMString type, in nsIDOMEventListener listener, in boolean useCapture); */
NS_IMETHODIMP nsDOMEventTarget::AddEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeEventListener (in DOMString type, in nsIDOMEventListener listener, in boolean useCapture); */
NS_IMETHODIMP nsDOMEventTarget::RemoveEventListener(const nsAString & type, nsIDOMEventListener *listener, PRBool useCapture)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean dispatchEvent (in nsIDOMEvent evt)  raises (DOMException); */
NS_IMETHODIMP nsDOMEventTarget::DispatchEvent(nsIDOMEvent *evt, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMEventTarget_h__ */
