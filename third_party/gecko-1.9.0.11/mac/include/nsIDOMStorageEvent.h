/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/storage/nsIDOMStorageEvent.idl
 */

#ifndef __gen_nsIDOMStorageEvent_h__
#define __gen_nsIDOMStorageEvent_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

#ifndef __gen_nsIDOMEvent_h__
#include "nsIDOMEvent.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMStorageEvent */
#define NS_IDOMSTORAGEEVENT_IID_STR "fc540c28-8edd-4b7a-9c30-8638289b7a7d"

#define NS_IDOMSTORAGEEVENT_IID \
  {0xfc540c28, 0x8edd, 0x4b7a, \
    { 0x9c, 0x30, 0x86, 0x38, 0x28, 0x9b, 0x7a, 0x7d }}

/**
 * Interface for a client side storage. See
 * http://www.whatwg.org/specs/web-apps/current-work/#scs-client-side
 * for more information.
 *
 * Event sent to a window when a storage area changes.
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMStorageEvent : public nsIDOMEvent {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMSTORAGEEVENT_IID)

  /**
   * Domain of the storage area which changed, or #session for
   * session storage.
   */
  /* readonly attribute DOMString domain; */
  NS_SCRIPTABLE NS_IMETHOD GetDomain(nsAString & aDomain) = 0;

  /**
   * Initialize a storage event.
   */
  /* void initStorageEvent (in DOMString typeArg, in boolean canBubbleArg, in boolean cancelableArg, in DOMString domainArg); */
  NS_SCRIPTABLE NS_IMETHOD InitStorageEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg) = 0;

  /**
   * Initialize a storage event.
   */
  /* void initStorageEventNS (in DOMString namespaceURIArg, in DOMString typeArg, in boolean canBubbleArg, in boolean cancelableArg, in DOMString domainArg); */
  NS_SCRIPTABLE NS_IMETHOD InitStorageEventNS(const nsAString & namespaceURIArg, const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMStorageEvent, NS_IDOMSTORAGEEVENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMSTORAGEEVENT \
  NS_SCRIPTABLE NS_IMETHOD GetDomain(nsAString & aDomain); \
  NS_SCRIPTABLE NS_IMETHOD InitStorageEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg); \
  NS_SCRIPTABLE NS_IMETHOD InitStorageEventNS(const nsAString & namespaceURIArg, const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMSTORAGEEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDomain(nsAString & aDomain) { return _to GetDomain(aDomain); } \
  NS_SCRIPTABLE NS_IMETHOD InitStorageEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg) { return _to InitStorageEvent(typeArg, canBubbleArg, cancelableArg, domainArg); } \
  NS_SCRIPTABLE NS_IMETHOD InitStorageEventNS(const nsAString & namespaceURIArg, const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg) { return _to InitStorageEventNS(namespaceURIArg, typeArg, canBubbleArg, cancelableArg, domainArg); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMSTORAGEEVENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDomain(nsAString & aDomain) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDomain(aDomain); } \
  NS_SCRIPTABLE NS_IMETHOD InitStorageEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitStorageEvent(typeArg, canBubbleArg, cancelableArg, domainArg); } \
  NS_SCRIPTABLE NS_IMETHOD InitStorageEventNS(const nsAString & namespaceURIArg, const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitStorageEventNS(namespaceURIArg, typeArg, canBubbleArg, cancelableArg, domainArg); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMStorageEvent : public nsIDOMStorageEvent
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMSTORAGEEVENT

  nsDOMStorageEvent();

private:
  ~nsDOMStorageEvent();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMStorageEvent, nsIDOMStorageEvent)

nsDOMStorageEvent::nsDOMStorageEvent()
{
  /* member initializers and constructor code */
}

nsDOMStorageEvent::~nsDOMStorageEvent()
{
  /* destructor code */
}

/* readonly attribute DOMString domain; */
NS_IMETHODIMP nsDOMStorageEvent::GetDomain(nsAString & aDomain)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void initStorageEvent (in DOMString typeArg, in boolean canBubbleArg, in boolean cancelableArg, in DOMString domainArg); */
NS_IMETHODIMP nsDOMStorageEvent::InitStorageEvent(const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void initStorageEventNS (in DOMString namespaceURIArg, in DOMString typeArg, in boolean canBubbleArg, in boolean cancelableArg, in DOMString domainArg); */
NS_IMETHODIMP nsDOMStorageEvent::InitStorageEventNS(const nsAString & namespaceURIArg, const nsAString & typeArg, PRBool canBubbleArg, PRBool cancelableArg, const nsAString & domainArg)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMStorageEvent_h__ */
