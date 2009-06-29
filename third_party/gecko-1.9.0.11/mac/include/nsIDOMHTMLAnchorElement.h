/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLAnchorElement.idl
 */

#ifndef __gen_nsIDOMHTMLAnchorElement_h__
#define __gen_nsIDOMHTMLAnchorElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLAnchorElement */
#define NS_IDOMHTMLANCHORELEMENT_IID_STR "a6cf90aa-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLANCHORELEMENT_IID \
  {0xa6cf90aa, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLAnchorElement interface is the interface to a [X]HTML
 * a element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLAnchorElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLANCHORELEMENT_IID)

  /* attribute DOMString accessKey; */
  NS_SCRIPTABLE NS_IMETHOD GetAccessKey(nsAString & aAccessKey) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAccessKey(const nsAString & aAccessKey) = 0;

  /* attribute DOMString charset; */
  NS_SCRIPTABLE NS_IMETHOD GetCharset(nsAString & aCharset) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCharset(const nsAString & aCharset) = 0;

  /* attribute DOMString coords; */
  NS_SCRIPTABLE NS_IMETHOD GetCoords(nsAString & aCoords) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCoords(const nsAString & aCoords) = 0;

  /* attribute DOMString href; */
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref) = 0;

  /* attribute DOMString hreflang; */
  NS_SCRIPTABLE NS_IMETHOD GetHreflang(nsAString & aHreflang) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHreflang(const nsAString & aHreflang) = 0;

  /* attribute DOMString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /* attribute DOMString rel; */
  NS_SCRIPTABLE NS_IMETHOD GetRel(nsAString & aRel) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetRel(const nsAString & aRel) = 0;

  /* attribute DOMString rev; */
  NS_SCRIPTABLE NS_IMETHOD GetRev(nsAString & aRev) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetRev(const nsAString & aRev) = 0;

  /* attribute DOMString shape; */
  NS_SCRIPTABLE NS_IMETHOD GetShape(nsAString & aShape) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetShape(const nsAString & aShape) = 0;

  /* attribute long tabIndex; */
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex) = 0;

  /* attribute DOMString target; */
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) = 0;

  /* attribute DOMString type; */
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType) = 0;

  /* void blur (); */
  NS_SCRIPTABLE NS_IMETHOD Blur(void) = 0;

  /* void focus (); */
  NS_SCRIPTABLE NS_IMETHOD Focus(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLAnchorElement, NS_IDOMHTMLANCHORELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLANCHORELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetAccessKey(nsAString & aAccessKey); \
  NS_SCRIPTABLE NS_IMETHOD SetAccessKey(const nsAString & aAccessKey); \
  NS_SCRIPTABLE NS_IMETHOD GetCharset(nsAString & aCharset); \
  NS_SCRIPTABLE NS_IMETHOD SetCharset(const nsAString & aCharset); \
  NS_SCRIPTABLE NS_IMETHOD GetCoords(nsAString & aCoords); \
  NS_SCRIPTABLE NS_IMETHOD SetCoords(const nsAString & aCoords); \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref); \
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref); \
  NS_SCRIPTABLE NS_IMETHOD GetHreflang(nsAString & aHreflang); \
  NS_SCRIPTABLE NS_IMETHOD SetHreflang(const nsAString & aHreflang); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetRel(nsAString & aRel); \
  NS_SCRIPTABLE NS_IMETHOD SetRel(const nsAString & aRel); \
  NS_SCRIPTABLE NS_IMETHOD GetRev(nsAString & aRev); \
  NS_SCRIPTABLE NS_IMETHOD SetRev(const nsAString & aRev); \
  NS_SCRIPTABLE NS_IMETHOD GetShape(nsAString & aShape); \
  NS_SCRIPTABLE NS_IMETHOD SetShape(const nsAString & aShape); \
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex); \
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget); \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget); \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType); \
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType); \
  NS_SCRIPTABLE NS_IMETHOD Blur(void); \
  NS_SCRIPTABLE NS_IMETHOD Focus(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLANCHORELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAccessKey(nsAString & aAccessKey) { return _to GetAccessKey(aAccessKey); } \
  NS_SCRIPTABLE NS_IMETHOD SetAccessKey(const nsAString & aAccessKey) { return _to SetAccessKey(aAccessKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetCharset(nsAString & aCharset) { return _to GetCharset(aCharset); } \
  NS_SCRIPTABLE NS_IMETHOD SetCharset(const nsAString & aCharset) { return _to SetCharset(aCharset); } \
  NS_SCRIPTABLE NS_IMETHOD GetCoords(nsAString & aCoords) { return _to GetCoords(aCoords); } \
  NS_SCRIPTABLE NS_IMETHOD SetCoords(const nsAString & aCoords) { return _to SetCoords(aCoords); } \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) { return _to GetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref) { return _to SetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetHreflang(nsAString & aHreflang) { return _to GetHreflang(aHreflang); } \
  NS_SCRIPTABLE NS_IMETHOD SetHreflang(const nsAString & aHreflang) { return _to SetHreflang(aHreflang); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetRel(nsAString & aRel) { return _to GetRel(aRel); } \
  NS_SCRIPTABLE NS_IMETHOD SetRel(const nsAString & aRel) { return _to SetRel(aRel); } \
  NS_SCRIPTABLE NS_IMETHOD GetRev(nsAString & aRev) { return _to GetRev(aRev); } \
  NS_SCRIPTABLE NS_IMETHOD SetRev(const nsAString & aRev) { return _to SetRev(aRev); } \
  NS_SCRIPTABLE NS_IMETHOD GetShape(nsAString & aShape) { return _to GetShape(aShape); } \
  NS_SCRIPTABLE NS_IMETHOD SetShape(const nsAString & aShape) { return _to SetShape(aShape); } \
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex) { return _to GetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex) { return _to SetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return _to GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) { return _to SetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return _to GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType) { return _to SetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD Blur(void) { return _to Blur(); } \
  NS_SCRIPTABLE NS_IMETHOD Focus(void) { return _to Focus(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLANCHORELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAccessKey(nsAString & aAccessKey) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAccessKey(aAccessKey); } \
  NS_SCRIPTABLE NS_IMETHOD SetAccessKey(const nsAString & aAccessKey) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAccessKey(aAccessKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetCharset(nsAString & aCharset) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCharset(aCharset); } \
  NS_SCRIPTABLE NS_IMETHOD SetCharset(const nsAString & aCharset) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCharset(aCharset); } \
  NS_SCRIPTABLE NS_IMETHOD GetCoords(nsAString & aCoords) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCoords(aCoords); } \
  NS_SCRIPTABLE NS_IMETHOD SetCoords(const nsAString & aCoords) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCoords(aCoords); } \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD SetHref(const nsAString & aHref) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetHreflang(nsAString & aHreflang) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHreflang(aHreflang); } \
  NS_SCRIPTABLE NS_IMETHOD SetHreflang(const nsAString & aHreflang) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHreflang(aHreflang); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetRel(nsAString & aRel) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRel(aRel); } \
  NS_SCRIPTABLE NS_IMETHOD SetRel(const nsAString & aRel) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRel(aRel); } \
  NS_SCRIPTABLE NS_IMETHOD GetRev(nsAString & aRev) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRev(aRev); } \
  NS_SCRIPTABLE NS_IMETHOD SetRev(const nsAString & aRev) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRev(aRev); } \
  NS_SCRIPTABLE NS_IMETHOD GetShape(nsAString & aShape) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetShape(aShape); } \
  NS_SCRIPTABLE NS_IMETHOD SetShape(const nsAString & aShape) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetShape(aShape); } \
  NS_SCRIPTABLE NS_IMETHOD GetTabIndex(PRInt32 *aTabIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetTabIndex(PRInt32 aTabIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTabIndex(aTabIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD Blur(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Blur(); } \
  NS_SCRIPTABLE NS_IMETHOD Focus(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Focus(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLAnchorElement : public nsIDOMHTMLAnchorElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLANCHORELEMENT

  nsDOMHTMLAnchorElement();

private:
  ~nsDOMHTMLAnchorElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLAnchorElement, nsIDOMHTMLAnchorElement)

nsDOMHTMLAnchorElement::nsDOMHTMLAnchorElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLAnchorElement::~nsDOMHTMLAnchorElement()
{
  /* destructor code */
}

/* attribute DOMString accessKey; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetAccessKey(nsAString & aAccessKey)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetAccessKey(const nsAString & aAccessKey)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString charset; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetCharset(nsAString & aCharset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetCharset(const nsAString & aCharset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString coords; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetCoords(nsAString & aCoords)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetCoords(const nsAString & aCoords)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString href; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetHref(nsAString & aHref)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetHref(const nsAString & aHref)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString hreflang; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetHreflang(nsAString & aHreflang)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetHreflang(const nsAString & aHreflang)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString rel; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetRel(nsAString & aRel)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetRel(const nsAString & aRel)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString rev; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetRev(nsAString & aRev)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetRev(const nsAString & aRev)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString shape; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetShape(nsAString & aShape)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetShape(const nsAString & aShape)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long tabIndex; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetTabIndex(PRInt32 *aTabIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetTabIndex(PRInt32 aTabIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString target; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetTarget(nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetTarget(const nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString type; */
NS_IMETHODIMP nsDOMHTMLAnchorElement::GetType(nsAString & aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAnchorElement::SetType(const nsAString & aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void blur (); */
NS_IMETHODIMP nsDOMHTMLAnchorElement::Blur()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void focus (); */
NS_IMETHODIMP nsDOMHTMLAnchorElement::Focus()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLAnchorElement_h__ */
