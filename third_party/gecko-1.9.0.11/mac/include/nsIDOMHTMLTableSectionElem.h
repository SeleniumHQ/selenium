/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLTableSectionElem.idl
 */

#ifndef __gen_nsIDOMHTMLTableSectionElem_h__
#define __gen_nsIDOMHTMLTableSectionElem_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLTableSectionElement */
#define NS_IDOMHTMLTABLESECTIONELEMENT_IID_STR "a6cf90b5-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLTABLESECTIONELEMENT_IID \
  {0xa6cf90b5, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLTableSectionElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLTABLESECTIONELEMENT_IID)

  /**
 * The nsIDOMHTMLTableSectionElement interface is the interface to a
 * [X]HTML thead, tbody, and tfoot element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
  /* attribute DOMString align; */
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) = 0;

  /* attribute DOMString ch; */
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) = 0;

  /* attribute DOMString chOff; */
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) = 0;

  /* attribute DOMString vAlign; */
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) = 0;

  /* readonly attribute nsIDOMHTMLCollection rows; */
  NS_SCRIPTABLE NS_IMETHOD GetRows(nsIDOMHTMLCollection * *aRows) = 0;

  /* nsIDOMHTMLElement insertRow (in long index)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval) = 0;

  /* void deleteRow (in long index)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD DeleteRow(PRInt32 index) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLTableSectionElement, NS_IDOMHTMLTABLESECTIONELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLTABLESECTIONELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh); \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh); \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff); \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff); \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetRows(nsIDOMHTMLCollection * *aRows); \
  NS_SCRIPTABLE NS_IMETHOD InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval); \
  NS_SCRIPTABLE NS_IMETHOD DeleteRow(PRInt32 index); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLTABLESECTIONELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return _to GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return _to SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) { return _to GetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) { return _to SetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) { return _to GetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) { return _to SetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) { return _to GetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) { return _to SetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetRows(nsIDOMHTMLCollection * *aRows) { return _to GetRows(aRows); } \
  NS_SCRIPTABLE NS_IMETHOD InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval) { return _to InsertRow(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteRow(PRInt32 index) { return _to DeleteRow(index); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLTABLESECTIONELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetCh(nsAString & aCh) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD SetCh(const nsAString & aCh) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCh(aCh); } \
  NS_SCRIPTABLE NS_IMETHOD GetChOff(nsAString & aChOff) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD SetChOff(const nsAString & aChOff) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetChOff(aChOff); } \
  NS_SCRIPTABLE NS_IMETHOD GetVAlign(nsAString & aVAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetVAlign(const nsAString & aVAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVAlign(aVAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetRows(nsIDOMHTMLCollection * *aRows) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRows(aRows); } \
  NS_SCRIPTABLE NS_IMETHOD InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->InsertRow(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteRow(PRInt32 index) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteRow(index); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLTableSectionElement : public nsIDOMHTMLTableSectionElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLTABLESECTIONELEMENT

  nsDOMHTMLTableSectionElement();

private:
  ~nsDOMHTMLTableSectionElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLTableSectionElement, nsIDOMHTMLTableSectionElement)

nsDOMHTMLTableSectionElement::nsDOMHTMLTableSectionElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLTableSectionElement::~nsDOMHTMLTableSectionElement()
{
  /* destructor code */
}

/* attribute DOMString align; */
NS_IMETHODIMP nsDOMHTMLTableSectionElement::GetAlign(nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableSectionElement::SetAlign(const nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString ch; */
NS_IMETHODIMP nsDOMHTMLTableSectionElement::GetCh(nsAString & aCh)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableSectionElement::SetCh(const nsAString & aCh)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString chOff; */
NS_IMETHODIMP nsDOMHTMLTableSectionElement::GetChOff(nsAString & aChOff)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableSectionElement::SetChOff(const nsAString & aChOff)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString vAlign; */
NS_IMETHODIMP nsDOMHTMLTableSectionElement::GetVAlign(nsAString & aVAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLTableSectionElement::SetVAlign(const nsAString & aVAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLCollection rows; */
NS_IMETHODIMP nsDOMHTMLTableSectionElement::GetRows(nsIDOMHTMLCollection * *aRows)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMHTMLElement insertRow (in long index)  raises (DOMException); */
NS_IMETHODIMP nsDOMHTMLTableSectionElement::InsertRow(PRInt32 index, nsIDOMHTMLElement **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteRow (in long index)  raises (DOMException); */
NS_IMETHODIMP nsDOMHTMLTableSectionElement::DeleteRow(PRInt32 index)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLTableSectionElem_h__ */
