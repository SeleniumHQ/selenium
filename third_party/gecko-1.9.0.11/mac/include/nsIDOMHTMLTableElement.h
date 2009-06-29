/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLTableElement.idl
 */

#ifndef __gen_nsIDOMHTMLTableElement_h__
#define __gen_nsIDOMHTMLTableElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLTableElement */
#define NS_IDOMHTMLTABLEELEMENT_IID_STR "a6cf90b2-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLTABLEELEMENT_IID \
  {0xa6cf90b2, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLTableElement interface is the interface to a [X]HTML
 * table element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLTableElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLTABLEELEMENT_IID)

  /* attribute nsIDOMHTMLTableCaptionElement caption; */
  NS_SCRIPTABLE NS_IMETHOD GetCaption(nsIDOMHTMLTableCaptionElement * *aCaption) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCaption(nsIDOMHTMLTableCaptionElement * aCaption) = 0;

  /* attribute nsIDOMHTMLTableSectionElement tHead; */
  NS_SCRIPTABLE NS_IMETHOD GetTHead(nsIDOMHTMLTableSectionElement * *aTHead) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTHead(nsIDOMHTMLTableSectionElement * aTHead) = 0;

  /* attribute nsIDOMHTMLTableSectionElement tFoot; */
  NS_SCRIPTABLE NS_IMETHOD GetTFoot(nsIDOMHTMLTableSectionElement * *aTFoot) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTFoot(nsIDOMHTMLTableSectionElement * aTFoot) = 0;

  /* readonly attribute nsIDOMHTMLCollection rows; */
  NS_SCRIPTABLE NS_IMETHOD GetRows(nsIDOMHTMLCollection * *aRows) = 0;

  /* readonly attribute nsIDOMHTMLCollection tBodies; */
  NS_SCRIPTABLE NS_IMETHOD GetTBodies(nsIDOMHTMLCollection * *aTBodies) = 0;

  /* attribute DOMString align; */
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) = 0;

  /* attribute DOMString bgColor; */
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) = 0;

  /* attribute DOMString border; */
  NS_SCRIPTABLE NS_IMETHOD GetBorder(nsAString & aBorder) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetBorder(const nsAString & aBorder) = 0;

  /* attribute DOMString cellPadding; */
  NS_SCRIPTABLE NS_IMETHOD GetCellPadding(nsAString & aCellPadding) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCellPadding(const nsAString & aCellPadding) = 0;

  /* attribute DOMString cellSpacing; */
  NS_SCRIPTABLE NS_IMETHOD GetCellSpacing(nsAString & aCellSpacing) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCellSpacing(const nsAString & aCellSpacing) = 0;

  /* attribute DOMString frame; */
  NS_SCRIPTABLE NS_IMETHOD GetFrame(nsAString & aFrame) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFrame(const nsAString & aFrame) = 0;

  /* attribute DOMString rules; */
  NS_SCRIPTABLE NS_IMETHOD GetRules(nsAString & aRules) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetRules(const nsAString & aRules) = 0;

  /* attribute DOMString summary; */
  NS_SCRIPTABLE NS_IMETHOD GetSummary(nsAString & aSummary) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSummary(const nsAString & aSummary) = 0;

  /* attribute DOMString width; */
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) = 0;

  /* nsIDOMHTMLElement createTHead (); */
  NS_SCRIPTABLE NS_IMETHOD CreateTHead(nsIDOMHTMLElement **_retval) = 0;

  /* void deleteTHead (); */
  NS_SCRIPTABLE NS_IMETHOD DeleteTHead(void) = 0;

  /* nsIDOMHTMLElement createTFoot (); */
  NS_SCRIPTABLE NS_IMETHOD CreateTFoot(nsIDOMHTMLElement **_retval) = 0;

  /* void deleteTFoot (); */
  NS_SCRIPTABLE NS_IMETHOD DeleteTFoot(void) = 0;

  /* nsIDOMHTMLElement createCaption (); */
  NS_SCRIPTABLE NS_IMETHOD CreateCaption(nsIDOMHTMLElement **_retval) = 0;

  /* void deleteCaption (); */
  NS_SCRIPTABLE NS_IMETHOD DeleteCaption(void) = 0;

  /* nsIDOMHTMLElement insertRow (in long index)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval) = 0;

  /* void deleteRow (in long index)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD DeleteRow(PRInt32 index) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLTableElement, NS_IDOMHTMLTABLEELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLTABLEELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetCaption(nsIDOMHTMLTableCaptionElement * *aCaption); \
  NS_SCRIPTABLE NS_IMETHOD SetCaption(nsIDOMHTMLTableCaptionElement * aCaption); \
  NS_SCRIPTABLE NS_IMETHOD GetTHead(nsIDOMHTMLTableSectionElement * *aTHead); \
  NS_SCRIPTABLE NS_IMETHOD SetTHead(nsIDOMHTMLTableSectionElement * aTHead); \
  NS_SCRIPTABLE NS_IMETHOD GetTFoot(nsIDOMHTMLTableSectionElement * *aTFoot); \
  NS_SCRIPTABLE NS_IMETHOD SetTFoot(nsIDOMHTMLTableSectionElement * aTFoot); \
  NS_SCRIPTABLE NS_IMETHOD GetRows(nsIDOMHTMLCollection * *aRows); \
  NS_SCRIPTABLE NS_IMETHOD GetTBodies(nsIDOMHTMLCollection * *aTBodies); \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor); \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor); \
  NS_SCRIPTABLE NS_IMETHOD GetBorder(nsAString & aBorder); \
  NS_SCRIPTABLE NS_IMETHOD SetBorder(const nsAString & aBorder); \
  NS_SCRIPTABLE NS_IMETHOD GetCellPadding(nsAString & aCellPadding); \
  NS_SCRIPTABLE NS_IMETHOD SetCellPadding(const nsAString & aCellPadding); \
  NS_SCRIPTABLE NS_IMETHOD GetCellSpacing(nsAString & aCellSpacing); \
  NS_SCRIPTABLE NS_IMETHOD SetCellSpacing(const nsAString & aCellSpacing); \
  NS_SCRIPTABLE NS_IMETHOD GetFrame(nsAString & aFrame); \
  NS_SCRIPTABLE NS_IMETHOD SetFrame(const nsAString & aFrame); \
  NS_SCRIPTABLE NS_IMETHOD GetRules(nsAString & aRules); \
  NS_SCRIPTABLE NS_IMETHOD SetRules(const nsAString & aRules); \
  NS_SCRIPTABLE NS_IMETHOD GetSummary(nsAString & aSummary); \
  NS_SCRIPTABLE NS_IMETHOD SetSummary(const nsAString & aSummary); \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth); \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth); \
  NS_SCRIPTABLE NS_IMETHOD CreateTHead(nsIDOMHTMLElement **_retval); \
  NS_SCRIPTABLE NS_IMETHOD DeleteTHead(void); \
  NS_SCRIPTABLE NS_IMETHOD CreateTFoot(nsIDOMHTMLElement **_retval); \
  NS_SCRIPTABLE NS_IMETHOD DeleteTFoot(void); \
  NS_SCRIPTABLE NS_IMETHOD CreateCaption(nsIDOMHTMLElement **_retval); \
  NS_SCRIPTABLE NS_IMETHOD DeleteCaption(void); \
  NS_SCRIPTABLE NS_IMETHOD InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval); \
  NS_SCRIPTABLE NS_IMETHOD DeleteRow(PRInt32 index); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLTABLEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCaption(nsIDOMHTMLTableCaptionElement * *aCaption) { return _to GetCaption(aCaption); } \
  NS_SCRIPTABLE NS_IMETHOD SetCaption(nsIDOMHTMLTableCaptionElement * aCaption) { return _to SetCaption(aCaption); } \
  NS_SCRIPTABLE NS_IMETHOD GetTHead(nsIDOMHTMLTableSectionElement * *aTHead) { return _to GetTHead(aTHead); } \
  NS_SCRIPTABLE NS_IMETHOD SetTHead(nsIDOMHTMLTableSectionElement * aTHead) { return _to SetTHead(aTHead); } \
  NS_SCRIPTABLE NS_IMETHOD GetTFoot(nsIDOMHTMLTableSectionElement * *aTFoot) { return _to GetTFoot(aTFoot); } \
  NS_SCRIPTABLE NS_IMETHOD SetTFoot(nsIDOMHTMLTableSectionElement * aTFoot) { return _to SetTFoot(aTFoot); } \
  NS_SCRIPTABLE NS_IMETHOD GetRows(nsIDOMHTMLCollection * *aRows) { return _to GetRows(aRows); } \
  NS_SCRIPTABLE NS_IMETHOD GetTBodies(nsIDOMHTMLCollection * *aTBodies) { return _to GetTBodies(aTBodies); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return _to GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return _to SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) { return _to GetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) { return _to SetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetBorder(nsAString & aBorder) { return _to GetBorder(aBorder); } \
  NS_SCRIPTABLE NS_IMETHOD SetBorder(const nsAString & aBorder) { return _to SetBorder(aBorder); } \
  NS_SCRIPTABLE NS_IMETHOD GetCellPadding(nsAString & aCellPadding) { return _to GetCellPadding(aCellPadding); } \
  NS_SCRIPTABLE NS_IMETHOD SetCellPadding(const nsAString & aCellPadding) { return _to SetCellPadding(aCellPadding); } \
  NS_SCRIPTABLE NS_IMETHOD GetCellSpacing(nsAString & aCellSpacing) { return _to GetCellSpacing(aCellSpacing); } \
  NS_SCRIPTABLE NS_IMETHOD SetCellSpacing(const nsAString & aCellSpacing) { return _to SetCellSpacing(aCellSpacing); } \
  NS_SCRIPTABLE NS_IMETHOD GetFrame(nsAString & aFrame) { return _to GetFrame(aFrame); } \
  NS_SCRIPTABLE NS_IMETHOD SetFrame(const nsAString & aFrame) { return _to SetFrame(aFrame); } \
  NS_SCRIPTABLE NS_IMETHOD GetRules(nsAString & aRules) { return _to GetRules(aRules); } \
  NS_SCRIPTABLE NS_IMETHOD SetRules(const nsAString & aRules) { return _to SetRules(aRules); } \
  NS_SCRIPTABLE NS_IMETHOD GetSummary(nsAString & aSummary) { return _to GetSummary(aSummary); } \
  NS_SCRIPTABLE NS_IMETHOD SetSummary(const nsAString & aSummary) { return _to SetSummary(aSummary); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return _to GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return _to SetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD CreateTHead(nsIDOMHTMLElement **_retval) { return _to CreateTHead(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteTHead(void) { return _to DeleteTHead(); } \
  NS_SCRIPTABLE NS_IMETHOD CreateTFoot(nsIDOMHTMLElement **_retval) { return _to CreateTFoot(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteTFoot(void) { return _to DeleteTFoot(); } \
  NS_SCRIPTABLE NS_IMETHOD CreateCaption(nsIDOMHTMLElement **_retval) { return _to CreateCaption(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteCaption(void) { return _to DeleteCaption(); } \
  NS_SCRIPTABLE NS_IMETHOD InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval) { return _to InsertRow(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteRow(PRInt32 index) { return _to DeleteRow(index); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLTABLEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCaption(nsIDOMHTMLTableCaptionElement * *aCaption) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCaption(aCaption); } \
  NS_SCRIPTABLE NS_IMETHOD SetCaption(nsIDOMHTMLTableCaptionElement * aCaption) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCaption(aCaption); } \
  NS_SCRIPTABLE NS_IMETHOD GetTHead(nsIDOMHTMLTableSectionElement * *aTHead) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTHead(aTHead); } \
  NS_SCRIPTABLE NS_IMETHOD SetTHead(nsIDOMHTMLTableSectionElement * aTHead) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTHead(aTHead); } \
  NS_SCRIPTABLE NS_IMETHOD GetTFoot(nsIDOMHTMLTableSectionElement * *aTFoot) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTFoot(aTFoot); } \
  NS_SCRIPTABLE NS_IMETHOD SetTFoot(nsIDOMHTMLTableSectionElement * aTFoot) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTFoot(aTFoot); } \
  NS_SCRIPTABLE NS_IMETHOD GetRows(nsIDOMHTMLCollection * *aRows) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRows(aRows); } \
  NS_SCRIPTABLE NS_IMETHOD GetTBodies(nsIDOMHTMLCollection * *aTBodies) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTBodies(aTBodies); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetBorder(nsAString & aBorder) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBorder(aBorder); } \
  NS_SCRIPTABLE NS_IMETHOD SetBorder(const nsAString & aBorder) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBorder(aBorder); } \
  NS_SCRIPTABLE NS_IMETHOD GetCellPadding(nsAString & aCellPadding) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCellPadding(aCellPadding); } \
  NS_SCRIPTABLE NS_IMETHOD SetCellPadding(const nsAString & aCellPadding) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCellPadding(aCellPadding); } \
  NS_SCRIPTABLE NS_IMETHOD GetCellSpacing(nsAString & aCellSpacing) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCellSpacing(aCellSpacing); } \
  NS_SCRIPTABLE NS_IMETHOD SetCellSpacing(const nsAString & aCellSpacing) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCellSpacing(aCellSpacing); } \
  NS_SCRIPTABLE NS_IMETHOD GetFrame(nsAString & aFrame) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFrame(aFrame); } \
  NS_SCRIPTABLE NS_IMETHOD SetFrame(const nsAString & aFrame) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFrame(aFrame); } \
  NS_SCRIPTABLE NS_IMETHOD GetRules(nsAString & aRules) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRules(aRules); } \
  NS_SCRIPTABLE NS_IMETHOD SetRules(const nsAString & aRules) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRules(aRules); } \
  NS_SCRIPTABLE NS_IMETHOD GetSummary(nsAString & aSummary) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSummary(aSummary); } \
  NS_SCRIPTABLE NS_IMETHOD SetSummary(const nsAString & aSummary) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSummary(aSummary); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD CreateTHead(nsIDOMHTMLElement **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateTHead(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteTHead(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteTHead(); } \
  NS_SCRIPTABLE NS_IMETHOD CreateTFoot(nsIDOMHTMLElement **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateTFoot(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteTFoot(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteTFoot(); } \
  NS_SCRIPTABLE NS_IMETHOD CreateCaption(nsIDOMHTMLElement **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateCaption(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteCaption(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteCaption(); } \
  NS_SCRIPTABLE NS_IMETHOD InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->InsertRow(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteRow(PRInt32 index) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteRow(index); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLTableElement : public nsIDOMHTMLTableElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLTABLEELEMENT

  nsDOMHTMLTableElement();

private:
  ~nsDOMHTMLTableElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLTableElement, nsIDOMHTMLTableElement)

nsDOMHTMLTableElement::nsDOMHTMLTableElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLTableElement::~nsDOMHTMLTableElement()
{
  /* destructor code */
}

/* attribute nsIDOMHTMLTableCaptionElement caption; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetCaption(nsIDOMHTMLTableCaptionElement * *aCaption)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetCaption(nsIDOMHTMLTableCaptionElement * aCaption)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDOMHTMLTableSectionElement tHead; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetTHead(nsIDOMHTMLTableSectionElement * *aTHead)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetTHead(nsIDOMHTMLTableSectionElement * aTHead)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDOMHTMLTableSectionElement tFoot; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetTFoot(nsIDOMHTMLTableSectionElement * *aTFoot)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetTFoot(nsIDOMHTMLTableSectionElement * aTFoot)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLCollection rows; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetRows(nsIDOMHTMLCollection * *aRows)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLCollection tBodies; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetTBodies(nsIDOMHTMLCollection * *aTBodies)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString align; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetAlign(nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetAlign(const nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString bgColor; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetBgColor(nsAString & aBgColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetBgColor(const nsAString & aBgColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString border; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetBorder(nsAString & aBorder)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetBorder(const nsAString & aBorder)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString cellPadding; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetCellPadding(nsAString & aCellPadding)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetCellPadding(const nsAString & aCellPadding)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString cellSpacing; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetCellSpacing(nsAString & aCellSpacing)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetCellSpacing(const nsAString & aCellSpacing)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString frame; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetFrame(nsAString & aFrame)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetFrame(const nsAString & aFrame)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString rules; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetRules(nsAString & aRules)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetRules(const nsAString & aRules)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString summary; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetSummary(nsAString & aSummary)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetSummary(const nsAString & aSummary)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString width; */
NS_IMETHODIMP nsDOMHTMLTableElement::GetWidth(nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableElement::SetWidth(const nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMHTMLElement createTHead (); */
NS_IMETHODIMP nsDOMHTMLTableElement::CreateTHead(nsIDOMHTMLElement **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteTHead (); */
NS_IMETHODIMP nsDOMHTMLTableElement::DeleteTHead()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMHTMLElement createTFoot (); */
NS_IMETHODIMP nsDOMHTMLTableElement::CreateTFoot(nsIDOMHTMLElement **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteTFoot (); */
NS_IMETHODIMP nsDOMHTMLTableElement::DeleteTFoot()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMHTMLElement createCaption (); */
NS_IMETHODIMP nsDOMHTMLTableElement::CreateCaption(nsIDOMHTMLElement **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteCaption (); */
NS_IMETHODIMP nsDOMHTMLTableElement::DeleteCaption()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMHTMLElement insertRow (in long index)  raises (DOMException); */
NS_IMETHODIMP nsDOMHTMLTableElement::InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteRow (in long index)  raises (DOMException); */
NS_IMETHODIMP nsDOMHTMLTableElement::DeleteRow(PRInt32 index)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLTableElement_h__ */
