/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLBRElement.idl
 */

#ifndef __gen_nsIDOMHTMLBRElement_h__
#define __gen_nsIDOMHTMLBRElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLBRElement */
#define NS_IDOMHTMLBRELEMENT_IID_STR "a6cf90a5-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLBRELEMENT_IID \
  {0xa6cf90a5, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLBRElement interface is the interface to a [X]HTML br
 * element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLBRElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLBRELEMENT_IID)

  /* attribute DOMString clear; */
  NS_SCRIPTABLE NS_IMETHOD GetClear(nsAString & aClear) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetClear(const nsAString & aClear) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLBRElement, NS_IDOMHTMLBRELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLBRELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetClear(nsAString & aClear); \
  NS_SCRIPTABLE NS_IMETHOD SetClear(const nsAString & aClear); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLBRELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetClear(nsAString & aClear) { return _to GetClear(aClear); } \
  NS_SCRIPTABLE NS_IMETHOD SetClear(const nsAString & aClear) { return _to SetClear(aClear); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLBRELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetClear(nsAString & aClear) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClear(aClear); } \
  NS_SCRIPTABLE NS_IMETHOD SetClear(const nsAString & aClear) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetClear(aClear); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLBRElement : public nsIDOMHTMLBRElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLBRELEMENT

  nsDOMHTMLBRElement();

private:
  ~nsDOMHTMLBRElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLBRElement, nsIDOMHTMLBRElement)

nsDOMHTMLBRElement::nsDOMHTMLBRElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLBRElement::~nsDOMHTMLBRElement()
{
  /* destructor code */
}

/* attribute DOMString clear; */
NS_IMETHODIMP nsDOMHTMLBRElement::GetClear(nsAString & aClear)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBRElement::SetClear(const nsAString & aClear)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLBRElement_h__ */
