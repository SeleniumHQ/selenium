/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLFontElement.idl
 */

#ifndef __gen_nsIDOMHTMLFontElement_h__
#define __gen_nsIDOMHTMLFontElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLFontElement */
#define NS_IDOMHTMLFONTELEMENT_IID_STR "a6cf90a7-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLFONTELEMENT_IID \
  {0xa6cf90a7, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLFontElement interface is the interface to a [X]HTML
 * font element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLFontElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLFONTELEMENT_IID)

  /* attribute DOMString color; */
  NS_SCRIPTABLE NS_IMETHOD GetColor(nsAString & aColor) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetColor(const nsAString & aColor) = 0;

  /* attribute DOMString face; */
  NS_SCRIPTABLE NS_IMETHOD GetFace(nsAString & aFace) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFace(const nsAString & aFace) = 0;

  /* attribute DOMString size; */
  NS_SCRIPTABLE NS_IMETHOD GetSize(nsAString & aSize) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSize(const nsAString & aSize) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLFontElement, NS_IDOMHTMLFONTELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLFONTELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetColor(nsAString & aColor); \
  NS_SCRIPTABLE NS_IMETHOD SetColor(const nsAString & aColor); \
  NS_SCRIPTABLE NS_IMETHOD GetFace(nsAString & aFace); \
  NS_SCRIPTABLE NS_IMETHOD SetFace(const nsAString & aFace); \
  NS_SCRIPTABLE NS_IMETHOD GetSize(nsAString & aSize); \
  NS_SCRIPTABLE NS_IMETHOD SetSize(const nsAString & aSize); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLFONTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetColor(nsAString & aColor) { return _to GetColor(aColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetColor(const nsAString & aColor) { return _to SetColor(aColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetFace(nsAString & aFace) { return _to GetFace(aFace); } \
  NS_SCRIPTABLE NS_IMETHOD SetFace(const nsAString & aFace) { return _to SetFace(aFace); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(nsAString & aSize) { return _to GetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(const nsAString & aSize) { return _to SetSize(aSize); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLFONTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetColor(nsAString & aColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetColor(aColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetColor(const nsAString & aColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetColor(aColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetFace(nsAString & aFace) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFace(aFace); } \
  NS_SCRIPTABLE NS_IMETHOD SetFace(const nsAString & aFace) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFace(aFace); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(nsAString & aSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(const nsAString & aSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSize(aSize); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLFontElement : public nsIDOMHTMLFontElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLFONTELEMENT

  nsDOMHTMLFontElement();

private:
  ~nsDOMHTMLFontElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLFontElement, nsIDOMHTMLFontElement)

nsDOMHTMLFontElement::nsDOMHTMLFontElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLFontElement::~nsDOMHTMLFontElement()
{
  /* destructor code */
}

/* attribute DOMString color; */
NS_IMETHODIMP nsDOMHTMLFontElement::GetColor(nsAString & aColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFontElement::SetColor(const nsAString & aColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString face; */
NS_IMETHODIMP nsDOMHTMLFontElement::GetFace(nsAString & aFace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFontElement::SetFace(const nsAString & aFace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString size; */
NS_IMETHODIMP nsDOMHTMLFontElement::GetSize(nsAString & aSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFontElement::SetSize(const nsAString & aSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLFontElement_h__ */
