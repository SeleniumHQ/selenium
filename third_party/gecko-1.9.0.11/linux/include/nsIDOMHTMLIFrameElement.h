/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLIFrameElement.idl
 */

#ifndef __gen_nsIDOMHTMLIFrameElement_h__
#define __gen_nsIDOMHTMLIFrameElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLIFrameElement */
#define NS_IDOMHTMLIFRAMEELEMENT_IID_STR "a6cf90ba-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLIFRAMEELEMENT_IID \
  {0xa6cf90ba, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLIFrameElement interface is the interface to a [X]HTML
 * iframe element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLIFrameElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLIFRAMEELEMENT_IID)

  /* attribute DOMString align; */
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) = 0;

  /* attribute DOMString frameBorder; */
  NS_SCRIPTABLE NS_IMETHOD GetFrameBorder(nsAString & aFrameBorder) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFrameBorder(const nsAString & aFrameBorder) = 0;

  /* attribute DOMString height; */
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight) = 0;

  /* attribute DOMString longDesc; */
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc) = 0;

  /* attribute DOMString marginHeight; */
  NS_SCRIPTABLE NS_IMETHOD GetMarginHeight(nsAString & aMarginHeight) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetMarginHeight(const nsAString & aMarginHeight) = 0;

  /* attribute DOMString marginWidth; */
  NS_SCRIPTABLE NS_IMETHOD GetMarginWidth(nsAString & aMarginWidth) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetMarginWidth(const nsAString & aMarginWidth) = 0;

  /* attribute DOMString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /* attribute DOMString scrolling; */
  NS_SCRIPTABLE NS_IMETHOD GetScrolling(nsAString & aScrolling) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetScrolling(const nsAString & aScrolling) = 0;

  /* attribute DOMString src; */
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc) = 0;

  /* attribute DOMString width; */
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) = 0;

  /* readonly attribute nsIDOMDocument contentDocument; */
  NS_SCRIPTABLE NS_IMETHOD GetContentDocument(nsIDOMDocument * *aContentDocument) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLIFrameElement, NS_IDOMHTMLIFRAMEELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLIFRAMEELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetFrameBorder(nsAString & aFrameBorder); \
  NS_SCRIPTABLE NS_IMETHOD SetFrameBorder(const nsAString & aFrameBorder); \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight); \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight); \
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc); \
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc); \
  NS_SCRIPTABLE NS_IMETHOD GetMarginHeight(nsAString & aMarginHeight); \
  NS_SCRIPTABLE NS_IMETHOD SetMarginHeight(const nsAString & aMarginHeight); \
  NS_SCRIPTABLE NS_IMETHOD GetMarginWidth(nsAString & aMarginWidth); \
  NS_SCRIPTABLE NS_IMETHOD SetMarginWidth(const nsAString & aMarginWidth); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetScrolling(nsAString & aScrolling); \
  NS_SCRIPTABLE NS_IMETHOD SetScrolling(const nsAString & aScrolling); \
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc); \
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc); \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth); \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth); \
  NS_SCRIPTABLE NS_IMETHOD GetContentDocument(nsIDOMDocument * *aContentDocument); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLIFRAMEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return _to GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return _to SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetFrameBorder(nsAString & aFrameBorder) { return _to GetFrameBorder(aFrameBorder); } \
  NS_SCRIPTABLE NS_IMETHOD SetFrameBorder(const nsAString & aFrameBorder) { return _to SetFrameBorder(aFrameBorder); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight) { return _to GetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight) { return _to SetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc) { return _to GetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc) { return _to SetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD GetMarginHeight(nsAString & aMarginHeight) { return _to GetMarginHeight(aMarginHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetMarginHeight(const nsAString & aMarginHeight) { return _to SetMarginHeight(aMarginHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetMarginWidth(nsAString & aMarginWidth) { return _to GetMarginWidth(aMarginWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetMarginWidth(const nsAString & aMarginWidth) { return _to SetMarginWidth(aMarginWidth); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrolling(nsAString & aScrolling) { return _to GetScrolling(aScrolling); } \
  NS_SCRIPTABLE NS_IMETHOD SetScrolling(const nsAString & aScrolling) { return _to SetScrolling(aScrolling); } \
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc) { return _to GetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc) { return _to SetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return _to GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return _to SetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentDocument(nsIDOMDocument * *aContentDocument) { return _to GetContentDocument(aContentDocument); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLIFRAMEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetFrameBorder(nsAString & aFrameBorder) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFrameBorder(aFrameBorder); } \
  NS_SCRIPTABLE NS_IMETHOD SetFrameBorder(const nsAString & aFrameBorder) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFrameBorder(aFrameBorder); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD GetMarginHeight(nsAString & aMarginHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMarginHeight(aMarginHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetMarginHeight(const nsAString & aMarginHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMarginHeight(aMarginHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetMarginWidth(nsAString & aMarginWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMarginWidth(aMarginWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetMarginWidth(const nsAString & aMarginWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMarginWidth(aMarginWidth); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrolling(nsAString & aScrolling) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScrolling(aScrolling); } \
  NS_SCRIPTABLE NS_IMETHOD SetScrolling(const nsAString & aScrolling) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetScrolling(aScrolling); } \
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentDocument(nsIDOMDocument * *aContentDocument) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContentDocument(aContentDocument); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLIFrameElement : public nsIDOMHTMLIFrameElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLIFRAMEELEMENT

  nsDOMHTMLIFrameElement();

private:
  ~nsDOMHTMLIFrameElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLIFrameElement, nsIDOMHTMLIFrameElement)

nsDOMHTMLIFrameElement::nsDOMHTMLIFrameElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLIFrameElement::~nsDOMHTMLIFrameElement()
{
  /* destructor code */
}

/* attribute DOMString align; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetAlign(nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetAlign(const nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString frameBorder; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetFrameBorder(nsAString & aFrameBorder)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetFrameBorder(const nsAString & aFrameBorder)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString height; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetHeight(nsAString & aHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetHeight(const nsAString & aHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString longDesc; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetLongDesc(nsAString & aLongDesc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetLongDesc(const nsAString & aLongDesc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString marginHeight; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetMarginHeight(nsAString & aMarginHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetMarginHeight(const nsAString & aMarginHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString marginWidth; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetMarginWidth(nsAString & aMarginWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetMarginWidth(const nsAString & aMarginWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString scrolling; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetScrolling(nsAString & aScrolling)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetScrolling(const nsAString & aScrolling)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString src; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetSrc(nsAString & aSrc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetSrc(const nsAString & aSrc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString width; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetWidth(nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIFrameElement::SetWidth(const nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMDocument contentDocument; */
NS_IMETHODIMP nsDOMHTMLIFrameElement::GetContentDocument(nsIDOMDocument * *aContentDocument)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLIFrameElement_h__ */
