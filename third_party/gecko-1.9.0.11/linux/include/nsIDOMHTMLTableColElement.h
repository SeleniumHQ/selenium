/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLTableColElement.idl
 */

#ifndef __gen_nsIDOMHTMLTableColElement_h__
#define __gen_nsIDOMHTMLTableColElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLTableColElement */
#define NS_IDOMHTMLTABLECOLELEMENT_IID_STR "a6cf90b4-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLTABLECOLELEMENT_IID \
  {0xa6cf90b4, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLTableColElement interface is the interface to a
 * [X]HTML col element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLTableColElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLTABLECOLELEMENT_IID)

  /* attribute DOMString align; */
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) = 0;

  /* attribute DOMString ch; */
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) = 0;

  /* attribute DOMString chOff; */
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) = 0;

  /* attribute long span; */
  NS_SCRIPTABLE NS_IMETHOD GetSpan(PRInt32 *aSpan) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSpan(PRInt32 aSpan) = 0;

  /* attribute DOMString vAlign; */
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) = 0;

  /* attribute DOMString width; */
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLTableColElement, NS_IDOMHTMLTABLECOLELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLTABLECOLELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh); \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh); \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff); \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff); \
  NS_SCRIPTABLE NS_IMETHOD GetSpan(PRInt32 *aSpan); \
  NS_SCRIPTABLE NS_IMETHOD SetSpan(PRInt32 aSpan); \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth); \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLTABLECOLELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return _to GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return _to SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) { return _to GetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) { return _to SetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) { return _to GetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) { return _to SetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD GetSpan(PRInt32 *aSpan) { return _to GetSpan(aSpan); } \
  NS_SCRIPTABLE NS_IMETHOD SetSpan(PRInt32 aSpan) { return _to SetSpan(aSpan); } \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) { return _to GetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) { return _to SetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return _to GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return _to SetWidth(aWidth); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLTABLECOLELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD GetSpan(PRInt32 *aSpan) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSpan(aSpan); } \
  NS_SCRIPTABLE NS_IMETHOD SetSpan(PRInt32 aSpan) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSpan(aSpan); } \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetWidth(aWidth); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLTableColElement : public nsIDOMHTMLTableColElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLTABLECOLELEMENT

  nsDOMHTMLTableColElement();

private:
  ~nsDOMHTMLTableColElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLTableColElement, nsIDOMHTMLTableColElement)

nsDOMHTMLTableColElement::nsDOMHTMLTableColElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLTableColElement::~nsDOMHTMLTableColElement()
{
  /* destructor code */
}

/* attribute DOMString align; */
NS_IMETHODIMP nsDOMHTMLTableColElement::GetAlign(nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableColElement::SetAlign(const nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString ch; */
NS_IMETHODIMP nsDOMHTMLTableColElement::GetCh(nsAString & aCh)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableColElement::SetCh(const nsAString & aCh)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString chOff; */
NS_IMETHODIMP nsDOMHTMLTableColElement::GetChOff(nsAString & aChOff)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableColElement::SetChOff(const nsAString & aChOff)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long span; */
NS_IMETHODIMP nsDOMHTMLTableColElement::GetSpan(PRInt32 *aSpan)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableColElement::SetSpan(PRInt32 aSpan)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString vAlign; */
NS_IMETHODIMP nsDOMHTMLTableColElement::GetVAlign(nsAString & aVAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableColElement::SetVAlign(const nsAString & aVAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString width; */
NS_IMETHODIMP nsDOMHTMLTableColElement::GetWidth(nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableColElement::SetWidth(const nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLTableColElement_h__ */
