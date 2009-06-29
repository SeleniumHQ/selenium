/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLTableCellElement.idl
 */

#ifndef __gen_nsIDOMHTMLTableCellElement_h__
#define __gen_nsIDOMHTMLTableCellElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLTableCellElement */
#define NS_IDOMHTMLTABLECELLELEMENT_IID_STR "a6cf90b7-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLTABLECELLELEMENT_IID \
  {0xa6cf90b7, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLTableCellElement interface is the interface to a
 * [X]HTML td element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLTableCellElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLTABLECELLELEMENT_IID)

  /* readonly attribute long cellIndex; */
  NS_SCRIPTABLE NS_IMETHOD GetCellIndex(PRInt32 *aCellIndex) = 0;

  /* attribute DOMString abbr; */
  NS_SCRIPTABLE NS_IMETHOD GetAbbr(nsAString & aAbbr) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAbbr(const nsAString & aAbbr) = 0;

  /* attribute DOMString align; */
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) = 0;

  /* attribute DOMString axis; */
  NS_SCRIPTABLE NS_IMETHOD GetAxis(nsAString & aAxis) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAxis(const nsAString & aAxis) = 0;

  /* attribute DOMString bgColor; */
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) = 0;

  /* attribute DOMString ch; */
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) = 0;

  /* attribute DOMString chOff; */
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) = 0;

  /* attribute long colSpan; */
  NS_SCRIPTABLE NS_IMETHOD GetColSpan(PRInt32 *aColSpan) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetColSpan(PRInt32 aColSpan) = 0;

  /* attribute DOMString headers; */
  NS_SCRIPTABLE NS_IMETHOD GetHeaders(nsAString & aHeaders) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHeaders(const nsAString & aHeaders) = 0;

  /* attribute DOMString height; */
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight) = 0;

  /* attribute boolean noWrap; */
  NS_SCRIPTABLE NS_IMETHOD GetNoWrap(PRBool *aNoWrap) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetNoWrap(PRBool aNoWrap) = 0;

  /* attribute long rowSpan; */
  NS_SCRIPTABLE NS_IMETHOD GetRowSpan(PRInt32 *aRowSpan) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetRowSpan(PRInt32 aRowSpan) = 0;

  /* attribute DOMString scope; */
  NS_SCRIPTABLE NS_IMETHOD GetScope(nsAString & aScope) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetScope(const nsAString & aScope) = 0;

  /* attribute DOMString vAlign; */
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) = 0;

  /* attribute DOMString width; */
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLTableCellElement, NS_IDOMHTMLTABLECELLELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLTABLECELLELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetCellIndex(PRInt32 *aCellIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetAbbr(nsAString & aAbbr); \
  NS_SCRIPTABLE NS_IMETHOD SetAbbr(const nsAString & aAbbr); \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetAxis(nsAString & aAxis); \
  NS_SCRIPTABLE NS_IMETHOD SetAxis(const nsAString & aAxis); \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor); \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor); \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh); \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh); \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff); \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff); \
  NS_SCRIPTABLE NS_IMETHOD GetColSpan(PRInt32 *aColSpan); \
  NS_SCRIPTABLE NS_IMETHOD SetColSpan(PRInt32 aColSpan); \
  NS_SCRIPTABLE NS_IMETHOD GetHeaders(nsAString & aHeaders); \
  NS_SCRIPTABLE NS_IMETHOD SetHeaders(const nsAString & aHeaders); \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight); \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight); \
  NS_SCRIPTABLE NS_IMETHOD GetNoWrap(PRBool *aNoWrap); \
  NS_SCRIPTABLE NS_IMETHOD SetNoWrap(PRBool aNoWrap); \
  NS_SCRIPTABLE NS_IMETHOD GetRowSpan(PRInt32 *aRowSpan); \
  NS_SCRIPTABLE NS_IMETHOD SetRowSpan(PRInt32 aRowSpan); \
  NS_SCRIPTABLE NS_IMETHOD GetScope(nsAString & aScope); \
  NS_SCRIPTABLE NS_IMETHOD SetScope(const nsAString & aScope); \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth); \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLTABLECELLELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCellIndex(PRInt32 *aCellIndex) { return _to GetCellIndex(aCellIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetAbbr(nsAString & aAbbr) { return _to GetAbbr(aAbbr); } \
  NS_SCRIPTABLE NS_IMETHOD SetAbbr(const nsAString & aAbbr) { return _to SetAbbr(aAbbr); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return _to GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return _to SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetAxis(nsAString & aAxis) { return _to GetAxis(aAxis); } \
  NS_SCRIPTABLE NS_IMETHOD SetAxis(const nsAString & aAxis) { return _to SetAxis(aAxis); } \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) { return _to GetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) { return _to SetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) { return _to GetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) { return _to SetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) { return _to GetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) { return _to SetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD GetColSpan(PRInt32 *aColSpan) { return _to GetColSpan(aColSpan); } \
  NS_SCRIPTABLE NS_IMETHOD SetColSpan(PRInt32 aColSpan) { return _to SetColSpan(aColSpan); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeaders(nsAString & aHeaders) { return _to GetHeaders(aHeaders); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeaders(const nsAString & aHeaders) { return _to SetHeaders(aHeaders); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight) { return _to GetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight) { return _to SetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetNoWrap(PRBool *aNoWrap) { return _to GetNoWrap(aNoWrap); } \
  NS_SCRIPTABLE NS_IMETHOD SetNoWrap(PRBool aNoWrap) { return _to SetNoWrap(aNoWrap); } \
  NS_SCRIPTABLE NS_IMETHOD GetRowSpan(PRInt32 *aRowSpan) { return _to GetRowSpan(aRowSpan); } \
  NS_SCRIPTABLE NS_IMETHOD SetRowSpan(PRInt32 aRowSpan) { return _to SetRowSpan(aRowSpan); } \
  NS_SCRIPTABLE NS_IMETHOD GetScope(nsAString & aScope) { return _to GetScope(aScope); } \
  NS_SCRIPTABLE NS_IMETHOD SetScope(const nsAString & aScope) { return _to SetScope(aScope); } \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) { return _to GetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) { return _to SetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return _to GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return _to SetWidth(aWidth); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLTABLECELLELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCellIndex(PRInt32 *aCellIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCellIndex(aCellIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetAbbr(nsAString & aAbbr) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAbbr(aAbbr); } \
  NS_SCRIPTABLE NS_IMETHOD SetAbbr(const nsAString & aAbbr) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAbbr(aAbbr); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetAxis(nsAString & aAxis) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAxis(aAxis); } \
  NS_SCRIPTABLE NS_IMETHOD SetAxis(const nsAString & aAxis) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAxis(aAxis); } \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD GetColSpan(PRInt32 *aColSpan) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetColSpan(aColSpan); } \
  NS_SCRIPTABLE NS_IMETHOD SetColSpan(PRInt32 aColSpan) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetColSpan(aColSpan); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeaders(nsAString & aHeaders) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHeaders(aHeaders); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeaders(const nsAString & aHeaders) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHeaders(aHeaders); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetNoWrap(PRBool *aNoWrap) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNoWrap(aNoWrap); } \
  NS_SCRIPTABLE NS_IMETHOD SetNoWrap(PRBool aNoWrap) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNoWrap(aNoWrap); } \
  NS_SCRIPTABLE NS_IMETHOD GetRowSpan(PRInt32 *aRowSpan) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRowSpan(aRowSpan); } \
  NS_SCRIPTABLE NS_IMETHOD SetRowSpan(PRInt32 aRowSpan) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRowSpan(aRowSpan); } \
  NS_SCRIPTABLE NS_IMETHOD GetScope(nsAString & aScope) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScope(aScope); } \
  NS_SCRIPTABLE NS_IMETHOD SetScope(const nsAString & aScope) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetScope(aScope); } \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetWidth(aWidth); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLTableCellElement : public nsIDOMHTMLTableCellElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLTABLECELLELEMENT

  nsDOMHTMLTableCellElement();

private:
  ~nsDOMHTMLTableCellElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLTableCellElement, nsIDOMHTMLTableCellElement)

nsDOMHTMLTableCellElement::nsDOMHTMLTableCellElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLTableCellElement::~nsDOMHTMLTableCellElement()
{
  /* destructor code */
}

/* readonly attribute long cellIndex; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetCellIndex(PRInt32 *aCellIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString abbr; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetAbbr(nsAString & aAbbr)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetAbbr(const nsAString & aAbbr)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString align; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetAlign(nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetAlign(const nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString axis; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetAxis(nsAString & aAxis)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetAxis(const nsAString & aAxis)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString bgColor; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetBgColor(nsAString & aBgColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetBgColor(const nsAString & aBgColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString ch; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetCh(nsAString & aCh)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetCh(const nsAString & aCh)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString chOff; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetChOff(nsAString & aChOff)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetChOff(const nsAString & aChOff)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long colSpan; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetColSpan(PRInt32 *aColSpan)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetColSpan(PRInt32 aColSpan)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString headers; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetHeaders(nsAString & aHeaders)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetHeaders(const nsAString & aHeaders)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString height; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetHeight(nsAString & aHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetHeight(const nsAString & aHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean noWrap; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetNoWrap(PRBool *aNoWrap)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetNoWrap(PRBool aNoWrap)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long rowSpan; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetRowSpan(PRInt32 *aRowSpan)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetRowSpan(PRInt32 aRowSpan)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString scope; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetScope(nsAString & aScope)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetScope(const nsAString & aScope)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString vAlign; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetVAlign(nsAString & aVAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetVAlign(const nsAString & aVAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString width; */
NS_IMETHODIMP nsDOMHTMLTableCellElement::GetWidth(nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableCellElement::SetWidth(const nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLTableCellElement_h__ */
