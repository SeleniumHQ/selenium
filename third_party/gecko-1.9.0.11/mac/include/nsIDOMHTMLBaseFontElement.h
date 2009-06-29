/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLBaseFontElement.idl
 */

#ifndef __gen_nsIDOMHTMLBaseFontElement_h__
#define __gen_nsIDOMHTMLBaseFontElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLBaseFontElement */
#define NS_IDOMHTMLBASEFONTELEMENT_IID_STR "a6cf90a6-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLBASEFONTELEMENT_IID \
  {0xa6cf90a6, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLBaseFontElement interface is the interface to a
 * [X]HTML basefont element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLBaseFontElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLBASEFONTELEMENT_IID)

  /* attribute DOMString color; */
  NS_SCRIPTABLE NS_IMETHOD GetColor(nsAString & aColor) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetColor(const nsAString & aColor) = 0;

  /* attribute DOMString face; */
  NS_SCRIPTABLE NS_IMETHOD GetFace(nsAString & aFace) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFace(const nsAString & aFace) = 0;

  /* attribute long size; */
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *aSize) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 aSize) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLBaseFontElement, NS_IDOMHTMLBASEFONTELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLBASEFONTELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetColor(nsAString & aColor); \
  NS_SCRIPTABLE NS_IMETHOD SetColor(const nsAString & aColor); \
  NS_SCRIPTABLE NS_IMETHOD GetFace(nsAString & aFace); \
  NS_SCRIPTABLE NS_IMETHOD SetFace(const nsAString & aFace); \
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *aSize); \
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 aSize); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLBASEFONTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetColor(nsAString & aColor) { return _to GetColor(aColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetColor(const nsAString & aColor) { return _to SetColor(aColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetFace(nsAString & aFace) { return _to GetFace(aFace); } \
  NS_SCRIPTABLE NS_IMETHOD SetFace(const nsAString & aFace) { return _to SetFace(aFace); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *aSize) { return _to GetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 aSize) { return _to SetSize(aSize); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLBASEFONTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetColor(nsAString & aColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetColor(aColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetColor(const nsAString & aColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetColor(aColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetFace(nsAString & aFace) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFace(aFace); } \
  NS_SCRIPTABLE NS_IMETHOD SetFace(const nsAString & aFace) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFace(aFace); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *aSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 aSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSize(aSize); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLBaseFontElement : public nsIDOMHTMLBaseFontElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLBASEFONTELEMENT

  nsDOMHTMLBaseFontElement();

private:
  ~nsDOMHTMLBaseFontElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLBaseFontElement, nsIDOMHTMLBaseFontElement)

nsDOMHTMLBaseFontElement::nsDOMHTMLBaseFontElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLBaseFontElement::~nsDOMHTMLBaseFontElement()
{
  /* destructor code */
}

/* attribute DOMString color; */
NS_IMETHODIMP nsDOMHTMLBaseFontElement::GetColor(nsAString & aColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBaseFontElement::SetColor(const nsAString & aColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString face; */
NS_IMETHODIMP nsDOMHTMLBaseFontElement::GetFace(nsAString & aFace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBaseFontElement::SetFace(const nsAString & aFace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long size; */
NS_IMETHODIMP nsDOMHTMLBaseFontElement::GetSize(PRInt32 *aSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBaseFontElement::SetSize(PRInt32 aSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLBaseFontElement_h__ */
