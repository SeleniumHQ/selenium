/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLAreaElement.idl
 */

#ifndef __gen_nsIDOMHTMLAreaElement_h__
#define __gen_nsIDOMHTMLAreaElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLAreaElement */
#define NS_IDOMHTMLAREAELEMENT_IID_STR "a6cf90b0-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLAREAELEMENT_IID \
  {0xa6cf90b0, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLAreaElement interface is the interface to a [X]HTML
 * area element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLAreaElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLAREAELEMENT_IID)

  /* attribute DOMString accessKey; */
  NS_SCRIPTABLE NS_IMETHOD GetAccessKey(nsAString & aAccessKey) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAccessKey(const nsAString & aAccessKey) = 0;

  /* attribute DOMString alt; */
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt) = 0;

  /* attribute DOMString coords; */
  NS_SCRIPTABLE NS_IMETHOD GetCoords(nsAString & aCoords) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCoords(const nsAString & aCoords) = 0;

  /* attribute DOMString href; */
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref) = 0;

  /* attribute boolean noHref; */
  NS_SCRIPTABLE NS_IMETHOD GetNoHref(PRBool *aNoHref) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetNoHref(PRBool aNoHref) = 0;

  /* attribute DOMString shape; */
  NS_SCRIPTABLE NS_IMETHOD GetShape(nsAString & aShape) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetShape(const nsAString & aShape) = 0;

  /* attribute long tabIndex; */
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex) = 0;

  /* attribute DOMString target; */
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLAreaElement, NS_IDOMHTMLAREAELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLAREAELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetAccessKey(nsAString & aAccessKey); \
  NS_SCRIPTABLE NS_IMETHOD SetAccessKey(const nsAString & aAccessKey); \
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt); \
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt); \
  NS_SCRIPTABLE NS_IMETHOD GetCoords(nsAString & aCoords); \
  NS_SCRIPTABLE NS_IMETHOD SetCoords(const nsAString & aCoords); \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref); \
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref); \
  NS_SCRIPTABLE NS_IMETHOD GetNoHref(PRBool *aNoHref); \
  NS_SCRIPTABLE NS_IMETHOD SetNoHref(PRBool aNoHref); \
  NS_SCRIPTABLE NS_IMETHOD GetShape(nsAString & aShape); \
  NS_SCRIPTABLE NS_IMETHOD SetShape(const nsAString & aShape); \
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex); \
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget); \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLAREAELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAccessKey(nsAString & aAccessKey) { return _to GetAccessKey(aAccessKey); } \
  NS_SCRIPTABLE NS_IMETHOD SetAccessKey(const nsAString & aAccessKey) { return _to SetAccessKey(aAccessKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt) { return _to GetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt) { return _to SetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD GetCoords(nsAString & aCoords) { return _to GetCoords(aCoords); } \
  NS_SCRIPTABLE NS_IMETHOD SetCoords(const nsAString & aCoords) { return _to SetCoords(aCoords); } \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) { return _to GetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref) { return _to SetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetNoHref(PRBool *aNoHref) { return _to GetNoHref(aNoHref); } \
  NS_SCRIPTABLE NS_IMETHOD SetNoHref(PRBool aNoHref) { return _to SetNoHref(aNoHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetShape(nsAString & aShape) { return _to GetShape(aShape); } \
  NS_SCRIPTABLE NS_IMETHOD SetShape(const nsAString & aShape) { return _to SetShape(aShape); } \
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex) { return _to GetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex) { return _to SetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return _to GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) { return _to SetTarget(aTarget); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLAREAELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAccessKey(nsAString & aAccessKey) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAccessKey(aAccessKey); } \
  NS_SCRIPTABLE NS_IMETHOD SetAccessKey(const nsAString & aAccessKey) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAccessKey(aAccessKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD GetCoords(nsAString & aCoords) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCoords(aCoords); } \
  NS_SCRIPTABLE NS_IMETHOD SetCoords(const nsAString & aCoords) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCoords(aCoords); } \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetNoHref(PRBool *aNoHref) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNoHref(aNoHref); } \
  NS_SCRIPTABLE NS_IMETHOD SetNoHref(PRBool aNoHref) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNoHref(aNoHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetShape(nsAString & aShape) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetShape(aShape); } \
  NS_SCRIPTABLE NS_IMETHOD SetShape(const nsAString & aShape) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetShape(aShape); } \
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTarget(aTarget); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLAreaElement : public nsIDOMHTMLAreaElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLAREAELEMENT

  nsDOMHTMLAreaElement();

private:
  ~nsDOMHTMLAreaElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLAreaElement, nsIDOMHTMLAreaElement)

nsDOMHTMLAreaElement::nsDOMHTMLAreaElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLAreaElement::~nsDOMHTMLAreaElement()
{
  /* destructor code */
}

/* attribute DOMString accessKey; */
NS_IMETHODIMP nsDOMHTMLAreaElement::GetAccessKey(nsAString & aAccessKey)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAreaElement::SetAccessKey(const nsAString & aAccessKey)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString alt; */
NS_IMETHODIMP nsDOMHTMLAreaElement::GetAlt(nsAString & aAlt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAreaElement::SetAlt(const nsAString & aAlt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString coords; */
NS_IMETHODIMP nsDOMHTMLAreaElement::GetCoords(nsAString & aCoords)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAreaElement::SetCoords(const nsAString & aCoords)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString href; */
NS_IMETHODIMP nsDOMHTMLAreaElement::GetHref(nsAString & aHref)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAreaElement::SetHref(const nsAString & aHref)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean noHref; */
NS_IMETHODIMP nsDOMHTMLAreaElement::GetNoHref(PRBool *aNoHref)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAreaElement::SetNoHref(PRBool aNoHref)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString shape; */
NS_IMETHODIMP nsDOMHTMLAreaElement::GetShape(nsAString & aShape)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAreaElement::SetShape(const nsAString & aShape)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long tabIndex; */
NS_IMETHODIMP nsDOMHTMLAreaElement::GetTabIndex(PRInt32 *aTabIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAreaElement::SetTabIndex(PRInt32 aTabIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString target; */
NS_IMETHODIMP nsDOMHTMLAreaElement::GetTarget(nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAreaElement::SetTarget(const nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLAreaElement_h__ */
