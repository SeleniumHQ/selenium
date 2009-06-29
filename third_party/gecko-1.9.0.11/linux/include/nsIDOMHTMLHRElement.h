/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLHRElement.idl
 */

#ifndef __gen_nsIDOMHTMLHRElement_h__
#define __gen_nsIDOMHTMLHRElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLHRElement */
#define NS_IDOMHTMLHRELEMENT_IID_STR "a6cf90a8-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLHRELEMENT_IID \
  {0xa6cf90a8, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLHRElement interface is the interface to a [X]HTML hr
 * element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLHRElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLHRELEMENT_IID)

  /* attribute DOMString align; */
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) = 0;

  /* attribute boolean noShade; */
  NS_SCRIPTABLE NS_IMETHOD GetNoShade(PRBool *aNoShade) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetNoShade(PRBool aNoShade) = 0;

  /* attribute DOMString size; */
  NS_SCRIPTABLE NS_IMETHOD GetSize(nsAString & aSize) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSize(const nsAString & aSize) = 0;

  /* attribute DOMString width; */
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLHRElement, NS_IDOMHTMLHRELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLHRELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetNoShade(PRBool *aNoShade); \
  NS_SCRIPTABLE NS_IMETHOD SetNoShade(PRBool aNoShade); \
  NS_SCRIPTABLE NS_IMETHOD GetSize(nsAString & aSize); \
  NS_SCRIPTABLE NS_IMETHOD SetSize(const nsAString & aSize); \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth); \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLHRELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return _to GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return _to SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetNoShade(PRBool *aNoShade) { return _to GetNoShade(aNoShade); } \
  NS_SCRIPTABLE NS_IMETHOD SetNoShade(PRBool aNoShade) { return _to SetNoShade(aNoShade); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(nsAString & aSize) { return _to GetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(const nsAString & aSize) { return _to SetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return _to GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return _to SetWidth(aWidth); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLHRELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetNoShade(PRBool *aNoShade) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNoShade(aNoShade); } \
  NS_SCRIPTABLE NS_IMETHOD SetNoShade(PRBool aNoShade) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNoShade(aNoShade); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(nsAString & aSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(const nsAString & aSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetWidth(aWidth); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLHRElement : public nsIDOMHTMLHRElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLHRELEMENT

  nsDOMHTMLHRElement();

private:
  ~nsDOMHTMLHRElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLHRElement, nsIDOMHTMLHRElement)

nsDOMHTMLHRElement::nsDOMHTMLHRElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLHRElement::~nsDOMHTMLHRElement()
{
  /* destructor code */
}

/* attribute DOMString align; */
NS_IMETHODIMP nsDOMHTMLHRElement::GetAlign(nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLHRElement::SetAlign(const nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean noShade; */
NS_IMETHODIMP nsDOMHTMLHRElement::GetNoShade(PRBool *aNoShade)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLHRElement::SetNoShade(PRBool aNoShade)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString size; */
NS_IMETHODIMP nsDOMHTMLHRElement::GetSize(nsAString & aSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLHRElement::SetSize(const nsAString & aSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString width; */
NS_IMETHODIMP nsDOMHTMLHRElement::GetWidth(nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLHRElement::SetWidth(const nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLHRElement_h__ */
