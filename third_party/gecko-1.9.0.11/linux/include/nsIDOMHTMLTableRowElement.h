/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLTableRowElement.idl
 */

#ifndef __gen_nsIDOMHTMLTableRowElement_h__
#define __gen_nsIDOMHTMLTableRowElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLTableRowElement */
#define NS_IDOMHTMLTABLEROWELEMENT_IID_STR "a6cf90b6-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLTABLEROWELEMENT_IID \
  {0xa6cf90b6, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLTableRowElement interface is the interface to a
 * [X]HTML tr element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLTableRowElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLTABLEROWELEMENT_IID)

  /* readonly attribute long rowIndex; */
  NS_SCRIPTABLE NS_IMETHOD GetRowIndex(PRInt32 *aRowIndex) = 0;

  /* readonly attribute long sectionRowIndex; */
  NS_SCRIPTABLE NS_IMETHOD GetSectionRowIndex(PRInt32 *aSectionRowIndex) = 0;

  /* readonly attribute nsIDOMHTMLCollection cells; */
  NS_SCRIPTABLE NS_IMETHOD GetCells(nsIDOMHTMLCollection * *aCells) = 0;

  /* attribute DOMString align; */
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) = 0;

  /* attribute DOMString bgColor; */
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) = 0;

  /* attribute DOMString ch; */
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) = 0;

  /* attribute DOMString chOff; */
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) = 0;

  /* attribute DOMString vAlign; */
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) = 0;

  /* nsIDOMHTMLElement insertCell (in long index)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD InsertCell(PRInt32 index, nsIDOMHTMLElement **_retval) = 0;

  /* void deleteCell (in long index)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD DeleteCell(PRInt32 index) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLTableRowElement, NS_IDOMHTMLTABLEROWELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLTABLEROWELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetRowIndex(PRInt32 *aRowIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetSectionRowIndex(PRInt32 *aSectionRowIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetCells(nsIDOMHTMLCollection * *aCells); \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor); \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor); \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh); \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh); \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff); \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff); \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign); \
  NS_SCRIPTABLE NS_IMETHOD InsertCell(PRInt32 index, nsIDOMHTMLElement **_retval); \
  NS_SCRIPTABLE NS_IMETHOD DeleteCell(PRInt32 index); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLTABLEROWELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetRowIndex(PRInt32 *aRowIndex) { return _to GetRowIndex(aRowIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetSectionRowIndex(PRInt32 *aSectionRowIndex) { return _to GetSectionRowIndex(aSectionRowIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetCells(nsIDOMHTMLCollection * *aCells) { return _to GetCells(aCells); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return _to GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return _to SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) { return _to GetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) { return _to SetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) { return _to GetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) { return _to SetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) { return _to GetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) { return _to SetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) { return _to GetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) { return _to SetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD InsertCell(PRInt32 index, nsIDOMHTMLElement **_retval) { return _to InsertCell(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteCell(PRInt32 index) { return _to DeleteCell(index); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLTABLEROWELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetRowIndex(PRInt32 *aRowIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRowIndex(aRowIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetSectionRowIndex(PRInt32 *aSectionRowIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSectionRowIndex(aSectionRowIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetCells(nsIDOMHTMLCollection * *aCells) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCells(aCells); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD InsertCell(PRInt32 index, nsIDOMHTMLElement **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->InsertCell(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteCell(PRInt32 index) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteCell(index); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLTableRowElement : public nsIDOMHTMLTableRowElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLTABLEROWELEMENT

  nsDOMHTMLTableRowElement();

private:
  ~nsDOMHTMLTableRowElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLTableRowElement, nsIDOMHTMLTableRowElement)

nsDOMHTMLTableRowElement::nsDOMHTMLTableRowElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLTableRowElement::~nsDOMHTMLTableRowElement()
{
  /* destructor code */
}

/* readonly attribute long rowIndex; */
NS_IMETHODIMP nsDOMHTMLTableRowElement::GetRowIndex(PRInt32 *aRowIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long sectionRowIndex; */
NS_IMETHODIMP nsDOMHTMLTableRowElement::GetSectionRowIndex(PRInt32 *aSectionRowIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLCollection cells; */
NS_IMETHODIMP nsDOMHTMLTableRowElement::GetCells(nsIDOMHTMLCollection * *aCells)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString align; */
NS_IMETHODIMP nsDOMHTMLTableRowElement::GetAlign(nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableRowElement::SetAlign(const nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString bgColor; */
NS_IMETHODIMP nsDOMHTMLTableRowElement::GetBgColor(nsAString & aBgColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableRowElement::SetBgColor(const nsAString & aBgColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString ch; */
NS_IMETHODIMP nsDOMHTMLTableRowElement::GetCh(nsAString & aCh)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableRowElement::SetCh(const nsAString & aCh)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString chOff; */
NS_IMETHODIMP nsDOMHTMLTableRowElement::GetChOff(nsAString & aChOff)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableRowElement::SetChOff(const nsAString & aChOff)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString vAlign; */
NS_IMETHODIMP nsDOMHTMLTableRowElement::GetVAlign(nsAString & aVAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableRowElement::SetVAlign(const nsAString & aVAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMHTMLElement insertCell (in long index)  raises (DOMException); */
NS_IMETHODIMP nsDOMHTMLTableRowElement::InsertCell(PRInt32 index, nsIDOMHTMLElement **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteCell (in long index)  raises (DOMException); */
NS_IMETHODIMP nsDOMHTMLTableRowElement::DeleteCell(PRInt32 index)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLTableRowElement_h__ */
