/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLSelectElement.idl
 */

#ifndef __gen_nsIDOMHTMLSelectElement_h__
#define __gen_nsIDOMHTMLSelectElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

#ifndef __gen_nsIDOMHTMLOptionsCollection_h__
#include "nsIDOMHTMLOptionsCollection.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLSelectElement */
#define NS_IDOMHTMLSELECTELEMENT_IID_STR "a6cf9090-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLSELECTELEMENT_IID \
  {0xa6cf9090, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLSelectElement interface is the interface to a [X]HTML
 * select element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLSelectElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLSELECTELEMENT_IID)

  /* readonly attribute DOMString type; */
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) = 0;

  /* attribute long selectedIndex; */
  NS_SCRIPTABLE NS_IMETHOD GetSelectedIndex(PRInt32 *aSelectedIndex) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSelectedIndex(PRInt32 aSelectedIndex) = 0;

  /* attribute DOMString value; */
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) = 0;

  /* attribute unsigned long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLength(PRUint32 aLength) = 0;

  /* readonly attribute nsIDOMHTMLFormElement form; */
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm) = 0;

  /* readonly attribute nsIDOMHTMLOptionsCollection options; */
  NS_SCRIPTABLE NS_IMETHOD GetOptions(nsIDOMHTMLOptionsCollection * *aOptions) = 0;

  /* attribute boolean disabled; */
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled) = 0;

  /* attribute boolean multiple; */
  NS_SCRIPTABLE NS_IMETHOD GetMultiple(PRBool *aMultiple) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetMultiple(PRBool aMultiple) = 0;

  /* attribute DOMString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /* attribute long size; */
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *aSize) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 aSize) = 0;

  /* attribute long tabIndex; */
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex) = 0;

  /* void add (in nsIDOMHTMLElement element, in nsIDOMHTMLElement before)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD Add(nsIDOMHTMLElement *element, nsIDOMHTMLElement *before) = 0;

  /* void remove (in long index); */
  NS_SCRIPTABLE NS_IMETHOD Remove(PRInt32 index) = 0;

  /* void blur (); */
  NS_SCRIPTABLE NS_IMETHOD Blur(void) = 0;

  /* void focus (); */
  NS_SCRIPTABLE NS_IMETHOD Focus(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLSelectElement, NS_IDOMHTMLSELECTELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLSELECTELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType); \
  NS_SCRIPTABLE NS_IMETHOD GetSelectedIndex(PRInt32 *aSelectedIndex); \
  NS_SCRIPTABLE NS_IMETHOD SetSelectedIndex(PRInt32 aSelectedIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue); \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue); \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength); \
  NS_SCRIPTABLE NS_IMETHOD SetLength(PRUint32 aLength); \
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm); \
  NS_SCRIPTABLE NS_IMETHOD GetOptions(nsIDOMHTMLOptionsCollection * *aOptions); \
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled); \
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled); \
  NS_SCRIPTABLE NS_IMETHOD GetMultiple(PRBool *aMultiple); \
  NS_SCRIPTABLE NS_IMETHOD SetMultiple(PRBool aMultiple); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *aSize); \
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 aSize); \
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex); \
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex); \
  NS_SCRIPTABLE NS_IMETHOD Add(nsIDOMHTMLElement *element, nsIDOMHTMLElement *before); \
  NS_SCRIPTABLE NS_IMETHOD Remove(PRInt32 index); \
  NS_SCRIPTABLE NS_IMETHOD Blur(void); \
  NS_SCRIPTABLE NS_IMETHOD Focus(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLSELECTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return _to GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetSelectedIndex(PRInt32 *aSelectedIndex) { return _to GetSelectedIndex(aSelectedIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetSelectedIndex(PRInt32 aSelectedIndex) { return _to SetSelectedIndex(aSelectedIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return _to GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return _to SetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return _to GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD SetLength(PRUint32 aLength) { return _to SetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm) { return _to GetForm(aForm); } \
  NS_SCRIPTABLE NS_IMETHOD GetOptions(nsIDOMHTMLOptionsCollection * *aOptions) { return _to GetOptions(aOptions); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled) { return _to GetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled) { return _to SetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD GetMultiple(PRBool *aMultiple) { return _to GetMultiple(aMultiple); } \
  NS_SCRIPTABLE NS_IMETHOD SetMultiple(PRBool aMultiple) { return _to SetMultiple(aMultiple); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *aSize) { return _to GetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 aSize) { return _to SetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex) { return _to GetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex) { return _to SetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD Add(nsIDOMHTMLElement *element, nsIDOMHTMLElement *before) { return _to Add(element, before); } \
  NS_SCRIPTABLE NS_IMETHOD Remove(PRInt32 index) { return _to Remove(index); } \
  NS_SCRIPTABLE NS_IMETHOD Blur(void) { return _to Blur(); } \
  NS_SCRIPTABLE NS_IMETHOD Focus(void) { return _to Focus(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLSELECTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetSelectedIndex(PRInt32 *aSelectedIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSelectedIndex(aSelectedIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetSelectedIndex(PRInt32 aSelectedIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSelectedIndex(aSelectedIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD SetLength(PRUint32 aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetForm(aForm); } \
  NS_SCRIPTABLE NS_IMETHOD GetOptions(nsIDOMHTMLOptionsCollection * *aOptions) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOptions(aOptions); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD GetMultiple(PRBool *aMultiple) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMultiple(aMultiple); } \
  NS_SCRIPTABLE NS_IMETHOD SetMultiple(PRBool aMultiple) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMultiple(aMultiple); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *aSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 aSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSize(aSize); } \
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD Add(nsIDOMHTMLElement *element, nsIDOMHTMLElement *before) { return !_to ? NS_ERROR_NULL_POINTER : _to->Add(element, before); } \
  NS_SCRIPTABLE NS_IMETHOD Remove(PRInt32 index) { return !_to ? NS_ERROR_NULL_POINTER : _to->Remove(index); } \
  NS_SCRIPTABLE NS_IMETHOD Blur(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Blur(); } \
  NS_SCRIPTABLE NS_IMETHOD Focus(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Focus(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLSelectElement : public nsIDOMHTMLSelectElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLSELECTELEMENT

  nsDOMHTMLSelectElement();

private:
  ~nsDOMHTMLSelectElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLSelectElement, nsIDOMHTMLSelectElement)

nsDOMHTMLSelectElement::nsDOMHTMLSelectElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLSelectElement::~nsDOMHTMLSelectElement()
{
  /* destructor code */
}

/* readonly attribute DOMString type; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetType(nsAString & aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long selectedIndex; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetSelectedIndex(PRInt32 *aSelectedIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLSelectElement::SetSelectedIndex(PRInt32 aSelectedIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString value; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetValue(nsAString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLSelectElement::SetValue(const nsAString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute unsigned long length; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetLength(PRUint32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLSelectElement::SetLength(PRUint32 aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLFormElement form; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetForm(nsIDOMHTMLFormElement * *aForm)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLOptionsCollection options; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetOptions(nsIDOMHTMLOptionsCollection * *aOptions)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean disabled; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetDisabled(PRBool *aDisabled)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLSelectElement::SetDisabled(PRBool aDisabled)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean multiple; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetMultiple(PRBool *aMultiple)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLSelectElement::SetMultiple(PRBool aMultiple)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLSelectElement::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long size; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetSize(PRInt32 *aSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLSelectElement::SetSize(PRInt32 aSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long tabIndex; */
NS_IMETHODIMP nsDOMHTMLSelectElement::GetTabIndex(PRInt32 *aTabIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLSelectElement::SetTabIndex(PRInt32 aTabIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void add (in nsIDOMHTMLElement element, in nsIDOMHTMLElement before)  raises (DOMException); */
NS_IMETHODIMP nsDOMHTMLSelectElement::Add(nsIDOMHTMLElement *element, nsIDOMHTMLElement *before)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void remove (in long index); */
NS_IMETHODIMP nsDOMHTMLSelectElement::Remove(PRInt32 index)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void blur (); */
NS_IMETHODIMP nsDOMHTMLSelectElement::Blur()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void focus (); */
NS_IMETHODIMP nsDOMHTMLSelectElement::Focus()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLSelectElement_h__ */
