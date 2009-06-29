/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLMetaElement.idl
 */

#ifndef __gen_nsIDOMHTMLMetaElement_h__
#define __gen_nsIDOMHTMLMetaElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLMetaElement */
#define NS_IDOMHTMLMETAELEMENT_IID_STR "a6cf908a-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLMETAELEMENT_IID \
  {0xa6cf908a, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLMetaElement interface is the interface to a [X]HTML
 * meta element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLMetaElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLMETAELEMENT_IID)

  /* attribute DOMString content; */
  NS_SCRIPTABLE NS_IMETHOD GetContent(nsAString & aContent) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetContent(const nsAString & aContent) = 0;

  /* attribute DOMString httpEquiv; */
  NS_SCRIPTABLE NS_IMETHOD GetHttpEquiv(nsAString & aHttpEquiv) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHttpEquiv(const nsAString & aHttpEquiv) = 0;

  /* attribute DOMString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /* attribute DOMString scheme; */
  NS_SCRIPTABLE NS_IMETHOD GetScheme(nsAString & aScheme) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetScheme(const nsAString & aScheme) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLMetaElement, NS_IDOMHTMLMETAELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLMETAELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetContent(nsAString & aContent); \
  NS_SCRIPTABLE NS_IMETHOD SetContent(const nsAString & aContent); \
  NS_SCRIPTABLE NS_IMETHOD GetHttpEquiv(nsAString & aHttpEquiv); \
  NS_SCRIPTABLE NS_IMETHOD SetHttpEquiv(const nsAString & aHttpEquiv); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetScheme(nsAString & aScheme); \
  NS_SCRIPTABLE NS_IMETHOD SetScheme(const nsAString & aScheme); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLMETAELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetContent(nsAString & aContent) { return _to GetContent(aContent); } \
  NS_SCRIPTABLE NS_IMETHOD SetContent(const nsAString & aContent) { return _to SetContent(aContent); } \
  NS_SCRIPTABLE NS_IMETHOD GetHttpEquiv(nsAString & aHttpEquiv) { return _to GetHttpEquiv(aHttpEquiv); } \
  NS_SCRIPTABLE NS_IMETHOD SetHttpEquiv(const nsAString & aHttpEquiv) { return _to SetHttpEquiv(aHttpEquiv); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetScheme(nsAString & aScheme) { return _to GetScheme(aScheme); } \
  NS_SCRIPTABLE NS_IMETHOD SetScheme(const nsAString & aScheme) { return _to SetScheme(aScheme); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLMETAELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetContent(nsAString & aContent) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContent(aContent); } \
  NS_SCRIPTABLE NS_IMETHOD SetContent(const nsAString & aContent) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetContent(aContent); } \
  NS_SCRIPTABLE NS_IMETHOD GetHttpEquiv(nsAString & aHttpEquiv) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHttpEquiv(aHttpEquiv); } \
  NS_SCRIPTABLE NS_IMETHOD SetHttpEquiv(const nsAString & aHttpEquiv) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHttpEquiv(aHttpEquiv); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetScheme(nsAString & aScheme) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScheme(aScheme); } \
  NS_SCRIPTABLE NS_IMETHOD SetScheme(const nsAString & aScheme) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetScheme(aScheme); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLMetaElement : public nsIDOMHTMLMetaElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLMETAELEMENT

  nsDOMHTMLMetaElement();

private:
  ~nsDOMHTMLMetaElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLMetaElement, nsIDOMHTMLMetaElement)

nsDOMHTMLMetaElement::nsDOMHTMLMetaElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLMetaElement::~nsDOMHTMLMetaElement()
{
  /* destructor code */
}

/* attribute DOMString content; */
NS_IMETHODIMP nsDOMHTMLMetaElement::GetContent(nsAString & aContent)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLMetaElement::SetContent(const nsAString & aContent)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString httpEquiv; */
NS_IMETHODIMP nsDOMHTMLMetaElement::GetHttpEquiv(nsAString & aHttpEquiv)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLMetaElement::SetHttpEquiv(const nsAString & aHttpEquiv)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMHTMLMetaElement::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLMetaElement::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString scheme; */
NS_IMETHODIMP nsDOMHTMLMetaElement::GetScheme(nsAString & aScheme)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLMetaElement::SetScheme(const nsAString & aScheme)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLMetaElement_h__ */
