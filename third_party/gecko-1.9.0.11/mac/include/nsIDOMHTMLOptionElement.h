/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLOptionElement.idl
 */

#ifndef __gen_nsIDOMHTMLOptionElement_h__
#define __gen_nsIDOMHTMLOptionElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLOptionElement */
#define NS_IDOMHTMLOPTIONELEMENT_IID_STR "a6cf9092-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLOPTIONELEMENT_IID \
  {0xa6cf9092, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLOptionElement interface is the interface to a [X]HTML
 * option element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLOptionElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLOPTIONELEMENT_IID)

  /* readonly attribute nsIDOMHTMLFormElement form; */
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm) = 0;

  /* attribute boolean defaultSelected; */
  NS_SCRIPTABLE NS_IMETHOD GetDefaultSelected(PRBool *aDefaultSelected) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDefaultSelected(PRBool aDefaultSelected) = 0;

  /* readonly attribute DOMString text; */
  NS_SCRIPTABLE NS_IMETHOD GetText(nsAString & aText) = 0;

  /* readonly attribute long index; */
  NS_SCRIPTABLE NS_IMETHOD GetIndex(PRInt32 *aIndex) = 0;

  /* attribute boolean disabled; */
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled) = 0;

  /* attribute DOMString label; */
  NS_SCRIPTABLE NS_IMETHOD GetLabel(nsAString & aLabel) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLabel(const nsAString & aLabel) = 0;

  /* attribute boolean selected; */
  NS_SCRIPTABLE NS_IMETHOD GetSelected(PRBool *aSelected) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSelected(PRBool aSelected) = 0;

  /* attribute DOMString value; */
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLOptionElement, NS_IDOMHTMLOPTIONELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLOPTIONELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm); \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultSelected(PRBool *aDefaultSelected); \
  NS_SCRIPTABLE NS_IMETHOD SetDefaultSelected(PRBool aDefaultSelected); \
  NS_SCRIPTABLE NS_IMETHOD GetText(nsAString & aText); \
  NS_SCRIPTABLE NS_IMETHOD GetIndex(PRInt32 *aIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled); \
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled); \
  NS_SCRIPTABLE NS_IMETHOD GetLabel(nsAString & aLabel); \
  NS_SCRIPTABLE NS_IMETHOD SetLabel(const nsAString & aLabel); \
  NS_SCRIPTABLE NS_IMETHOD GetSelected(PRBool *aSelected); \
  NS_SCRIPTABLE NS_IMETHOD SetSelected(PRBool aSelected); \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue); \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLOPTIONELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm) { return _to GetForm(aForm); } \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultSelected(PRBool *aDefaultSelected) { return _to GetDefaultSelected(aDefaultSelected); } \
  NS_SCRIPTABLE NS_IMETHOD SetDefaultSelected(PRBool aDefaultSelected) { return _to SetDefaultSelected(aDefaultSelected); } \
  NS_SCRIPTABLE NS_IMETHOD GetText(nsAString & aText) { return _to GetText(aText); } \
  NS_SCRIPTABLE NS_IMETHOD GetIndex(PRInt32 *aIndex) { return _to GetIndex(aIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled) { return _to GetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled) { return _to SetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD GetLabel(nsAString & aLabel) { return _to GetLabel(aLabel); } \
  NS_SCRIPTABLE NS_IMETHOD SetLabel(const nsAString & aLabel) { return _to SetLabel(aLabel); } \
  NS_SCRIPTABLE NS_IMETHOD GetSelected(PRBool *aSelected) { return _to GetSelected(aSelected); } \
  NS_SCRIPTABLE NS_IMETHOD SetSelected(PRBool aSelected) { return _to SetSelected(aSelected); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return _to GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return _to SetValue(aValue); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLOPTIONELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetForm(aForm); } \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultSelected(PRBool *aDefaultSelected) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDefaultSelected(aDefaultSelected); } \
  NS_SCRIPTABLE NS_IMETHOD SetDefaultSelected(PRBool aDefaultSelected) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDefaultSelected(aDefaultSelected); } \
  NS_SCRIPTABLE NS_IMETHOD GetText(nsAString & aText) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetText(aText); } \
  NS_SCRIPTABLE NS_IMETHOD GetIndex(PRInt32 *aIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIndex(aIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD GetLabel(nsAString & aLabel) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLabel(aLabel); } \
  NS_SCRIPTABLE NS_IMETHOD SetLabel(const nsAString & aLabel) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLabel(aLabel); } \
  NS_SCRIPTABLE NS_IMETHOD GetSelected(PRBool *aSelected) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSelected(aSelected); } \
  NS_SCRIPTABLE NS_IMETHOD SetSelected(PRBool aSelected) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSelected(aSelected); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetValue(aValue); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLOptionElement : public nsIDOMHTMLOptionElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLOPTIONELEMENT

  nsDOMHTMLOptionElement();

private:
  ~nsDOMHTMLOptionElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLOptionElement, nsIDOMHTMLOptionElement)

nsDOMHTMLOptionElement::nsDOMHTMLOptionElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLOptionElement::~nsDOMHTMLOptionElement()
{
  /* destructor code */
}

/* readonly attribute nsIDOMHTMLFormElement form; */
NS_IMETHODIMP nsDOMHTMLOptionElement::GetForm(nsIDOMHTMLFormElement * *aForm)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean defaultSelected; */
NS_IMETHODIMP nsDOMHTMLOptionElement::GetDefaultSelected(PRBool *aDefaultSelected)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLOptionElement::SetDefaultSelected(PRBool aDefaultSelected)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString text; */
NS_IMETHODIMP nsDOMHTMLOptionElement::GetText(nsAString & aText)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long index; */
NS_IMETHODIMP nsDOMHTMLOptionElement::GetIndex(PRInt32 *aIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean disabled; */
NS_IMETHODIMP nsDOMHTMLOptionElement::GetDisabled(PRBool *aDisabled)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLOptionElement::SetDisabled(PRBool aDisabled)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString label; */
NS_IMETHODIMP nsDOMHTMLOptionElement::GetLabel(nsAString & aLabel)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLOptionElement::SetLabel(const nsAString & aLabel)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean selected; */
NS_IMETHODIMP nsDOMHTMLOptionElement::GetSelected(PRBool *aSelected)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLOptionElement::SetSelected(PRBool aSelected)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString value; */
NS_IMETHODIMP nsDOMHTMLOptionElement::GetValue(nsAString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLOptionElement::SetValue(const nsAString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLOptionElement_h__ */
