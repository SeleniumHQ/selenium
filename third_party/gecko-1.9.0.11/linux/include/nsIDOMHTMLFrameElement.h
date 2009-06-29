/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLFrameElement.idl
 */

#ifndef __gen_nsIDOMHTMLFrameElement_h__
#define __gen_nsIDOMHTMLFrameElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLFrameElement */
#define NS_IDOMHTMLFRAMEELEMENT_IID_STR "a6cf90b9-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLFRAMEELEMENT_IID \
  {0xa6cf90b9, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLFrameElement interface is the interface to a [X]HTML
 * frame element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLFrameElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLFRAMEELEMENT_IID)

  /* attribute DOMString frameBorder; */
  NS_SCRIPTABLE NS_IMETHOD GetFrameBorder(nsAString & aFrameBorder) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFrameBorder(const nsAString & aFrameBorder) = 0;

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

  /* attribute boolean noResize; */
  NS_SCRIPTABLE NS_IMETHOD GetNoResize(PRBool *aNoResize) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetNoResize(PRBool aNoResize) = 0;

  /* attribute DOMString scrolling; */
  NS_SCRIPTABLE NS_IMETHOD GetScrolling(nsAString & aScrolling) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetScrolling(const nsAString & aScrolling) = 0;

  /* attribute DOMString src; */
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc) = 0;

  /* readonly attribute nsIDOMDocument contentDocument; */
  NS_SCRIPTABLE NS_IMETHOD GetContentDocument(nsIDOMDocument * *aContentDocument) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLFrameElement, NS_IDOMHTMLFRAMEELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLFRAMEELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetFrameBorder(nsAString & aFrameBorder); \
  NS_SCRIPTABLE NS_IMETHOD SetFrameBorder(const nsAString & aFrameBorder); \
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc); \
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc); \
  NS_SCRIPTABLE NS_IMETHOD GetMarginHeight(nsAString & aMarginHeight); \
  NS_SCRIPTABLE NS_IMETHOD SetMarginHeight(const nsAString & aMarginHeight); \
  NS_SCRIPTABLE NS_IMETHOD GetMarginWidth(nsAString & aMarginWidth); \
  NS_SCRIPTABLE NS_IMETHOD SetMarginWidth(const nsAString & aMarginWidth); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetNoResize(PRBool *aNoResize); \
  NS_SCRIPTABLE NS_IMETHOD SetNoResize(PRBool aNoResize); \
  NS_SCRIPTABLE NS_IMETHOD GetScrolling(nsAString & aScrolling); \
  NS_SCRIPTABLE NS_IMETHOD SetScrolling(const nsAString & aScrolling); \
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc); \
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc); \
  NS_SCRIPTABLE NS_IMETHOD GetContentDocument(nsIDOMDocument * *aContentDocument); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLFRAMEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetFrameBorder(nsAString & aFrameBorder) { return _to GetFrameBorder(aFrameBorder); } \
  NS_SCRIPTABLE NS_IMETHOD SetFrameBorder(const nsAString & aFrameBorder) { return _to SetFrameBorder(aFrameBorder); } \
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc) { return _to GetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc) { return _to SetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD GetMarginHeight(nsAString & aMarginHeight) { return _to GetMarginHeight(aMarginHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetMarginHeight(const nsAString & aMarginHeight) { return _to SetMarginHeight(aMarginHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetMarginWidth(nsAString & aMarginWidth) { return _to GetMarginWidth(aMarginWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetMarginWidth(const nsAString & aMarginWidth) { return _to SetMarginWidth(aMarginWidth); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetNoResize(PRBool *aNoResize) { return _to GetNoResize(aNoResize); } \
  NS_SCRIPTABLE NS_IMETHOD SetNoResize(PRBool aNoResize) { return _to SetNoResize(aNoResize); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrolling(nsAString & aScrolling) { return _to GetScrolling(aScrolling); } \
  NS_SCRIPTABLE NS_IMETHOD SetScrolling(const nsAString & aScrolling) { return _to SetScrolling(aScrolling); } \
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc) { return _to GetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc) { return _to SetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentDocument(nsIDOMDocument * *aContentDocument) { return _to GetContentDocument(aContentDocument); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLFRAMEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetFrameBorder(nsAString & aFrameBorder) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFrameBorder(aFrameBorder); } \
  NS_SCRIPTABLE NS_IMETHOD SetFrameBorder(const nsAString & aFrameBorder) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFrameBorder(aFrameBorder); } \
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD GetMarginHeight(nsAString & aMarginHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMarginHeight(aMarginHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetMarginHeight(const nsAString & aMarginHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMarginHeight(aMarginHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetMarginWidth(nsAString & aMarginWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMarginWidth(aMarginWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetMarginWidth(const nsAString & aMarginWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMarginWidth(aMarginWidth); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetNoResize(PRBool *aNoResize) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNoResize(aNoResize); } \
  NS_SCRIPTABLE NS_IMETHOD SetNoResize(PRBool aNoResize) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNoResize(aNoResize); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrolling(nsAString & aScrolling) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScrolling(aScrolling); } \
  NS_SCRIPTABLE NS_IMETHOD SetScrolling(const nsAString & aScrolling) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetScrolling(aScrolling); } \
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD GetContentDocument(nsIDOMDocument * *aContentDocument) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContentDocument(aContentDocument); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLFrameElement : public nsIDOMHTMLFrameElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLFRAMEELEMENT

  nsDOMHTMLFrameElement();

private:
  ~nsDOMHTMLFrameElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLFrameElement, nsIDOMHTMLFrameElement)

nsDOMHTMLFrameElement::nsDOMHTMLFrameElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLFrameElement::~nsDOMHTMLFrameElement()
{
  /* destructor code */
}

/* attribute DOMString frameBorder; */
NS_IMETHODIMP nsDOMHTMLFrameElement::GetFrameBorder(nsAString & aFrameBorder)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFrameElement::SetFrameBorder(const nsAString & aFrameBorder)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString longDesc; */
NS_IMETHODIMP nsDOMHTMLFrameElement::GetLongDesc(nsAString & aLongDesc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFrameElement::SetLongDesc(const nsAString & aLongDesc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString marginHeight; */
NS_IMETHODIMP nsDOMHTMLFrameElement::GetMarginHeight(nsAString & aMarginHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFrameElement::SetMarginHeight(const nsAString & aMarginHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString marginWidth; */
NS_IMETHODIMP nsDOMHTMLFrameElement::GetMarginWidth(nsAString & aMarginWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFrameElement::SetMarginWidth(const nsAString & aMarginWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMHTMLFrameElement::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFrameElement::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean noResize; */
NS_IMETHODIMP nsDOMHTMLFrameElement::GetNoResize(PRBool *aNoResize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFrameElement::SetNoResize(PRBool aNoResize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString scrolling; */
NS_IMETHODIMP nsDOMHTMLFrameElement::GetScrolling(nsAString & aScrolling)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFrameElement::SetScrolling(const nsAString & aScrolling)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString src; */
NS_IMETHODIMP nsDOMHTMLFrameElement::GetSrc(nsAString & aSrc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFrameElement::SetSrc(const nsAString & aSrc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMDocument contentDocument; */
NS_IMETHODIMP nsDOMHTMLFrameElement::GetContentDocument(nsIDOMDocument * *aContentDocument)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLFrameElement_h__ */
