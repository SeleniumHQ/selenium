/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLBaseElement.idl
 */

#ifndef __gen_nsIDOMHTMLBaseElement_h__
#define __gen_nsIDOMHTMLBaseElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLBaseElement */
#define NS_IDOMHTMLBASEELEMENT_IID_STR "a6cf908b-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLBASEELEMENT_IID \
  {0xa6cf908b, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLBaseElement interface is the interface to a [X]HTML
 * base element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLBaseElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLBASEELEMENT_IID)

  /* attribute DOMString href; */
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref) = 0;

  /* attribute DOMString target; */
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLBaseElement, NS_IDOMHTMLBASEELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLBASEELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref); \
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref); \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget); \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLBASEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) { return _to GetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref) { return _to SetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return _to GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) { return _to SetTarget(aTarget); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLBASEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTarget(aTarget); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLBaseElement : public nsIDOMHTMLBaseElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLBASEELEMENT

  nsDOMHTMLBaseElement();

private:
  ~nsDOMHTMLBaseElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLBaseElement, nsIDOMHTMLBaseElement)

nsDOMHTMLBaseElement::nsDOMHTMLBaseElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLBaseElement::~nsDOMHTMLBaseElement()
{
  /* destructor code */
}

/* attribute DOMString href; */
NS_IMETHODIMP nsDOMHTMLBaseElement::GetHref(nsAString & aHref)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBaseElement::SetHref(const nsAString & aHref)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString target; */
NS_IMETHODIMP nsDOMHTMLBaseElement::GetTarget(nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBaseElement::SetTarget(const nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLBaseElement_h__ */
