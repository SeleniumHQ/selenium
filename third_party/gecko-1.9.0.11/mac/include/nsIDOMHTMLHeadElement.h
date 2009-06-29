/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLHeadElement.idl
 */

#ifndef __gen_nsIDOMHTMLHeadElement_h__
#define __gen_nsIDOMHTMLHeadElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLHeadElement */
#define NS_IDOMHTMLHEADELEMENT_IID_STR "a6cf9087-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLHEADELEMENT_IID \
  {0xa6cf9087, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLHeadElement interface is the interface to a [X]HTML
 * head element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLHeadElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLHEADELEMENT_IID)

  /* attribute DOMString profile; */
  NS_SCRIPTABLE NS_IMETHOD GetProfile(nsAString & aProfile) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetProfile(const nsAString & aProfile) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLHeadElement, NS_IDOMHTMLHEADELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLHEADELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetProfile(nsAString & aProfile); \
  NS_SCRIPTABLE NS_IMETHOD SetProfile(const nsAString & aProfile); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLHEADELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetProfile(nsAString & aProfile) { return _to GetProfile(aProfile); } \
  NS_SCRIPTABLE NS_IMETHOD SetProfile(const nsAString & aProfile) { return _to SetProfile(aProfile); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLHEADELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetProfile(nsAString & aProfile) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetProfile(aProfile); } \
  NS_SCRIPTABLE NS_IMETHOD SetProfile(const nsAString & aProfile) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetProfile(aProfile); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLHeadElement : public nsIDOMHTMLHeadElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLHEADELEMENT

  nsDOMHTMLHeadElement();

private:
  ~nsDOMHTMLHeadElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLHeadElement, nsIDOMHTMLHeadElement)

nsDOMHTMLHeadElement::nsDOMHTMLHeadElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLHeadElement::~nsDOMHTMLHeadElement()
{
  /* destructor code */
}

/* attribute DOMString profile; */
NS_IMETHODIMP nsDOMHTMLHeadElement::GetProfile(nsAString & aProfile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLHeadElement::SetProfile(const nsAString & aProfile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLHeadElement_h__ */
