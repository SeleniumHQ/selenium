/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLAppletElement.idl
 */

#ifndef __gen_nsIDOMHTMLAppletElement_h__
#define __gen_nsIDOMHTMLAppletElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLAppletElement */
#define NS_IDOMHTMLAPPLETELEMENT_IID_STR "a6cf90ae-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLAPPLETELEMENT_IID \
  {0xa6cf90ae, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLAppletElement interface is the interface to a [X]HTML
 * applet element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLAppletElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLAPPLETELEMENT_IID)

  /* attribute DOMString align; */
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) = 0;

  /* attribute DOMString alt; */
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt) = 0;

  /* attribute DOMString archive; */
  NS_SCRIPTABLE NS_IMETHOD GetArchive(nsAString & aArchive) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetArchive(const nsAString & aArchive) = 0;

  /* attribute DOMString code; */
  NS_SCRIPTABLE NS_IMETHOD GetCode(nsAString & aCode) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCode(const nsAString & aCode) = 0;

  /* attribute DOMString codeBase; */
  NS_SCRIPTABLE NS_IMETHOD GetCodeBase(nsAString & aCodeBase) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCodeBase(const nsAString & aCodeBase) = 0;

  /* attribute DOMString height; */
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight) = 0;

  /* attribute long hspace; */
  NS_SCRIPTABLE NS_IMETHOD GetHspace(PRInt32 *aHspace) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHspace(PRInt32 aHspace) = 0;

  /* attribute DOMString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /* attribute DOMString object; */
  NS_SCRIPTABLE NS_IMETHOD GetObject(nsAString & aObject) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetObject(const nsAString & aObject) = 0;

  /* attribute long vspace; */
  NS_SCRIPTABLE NS_IMETHOD GetVspace(PRInt32 *aVspace) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVspace(PRInt32 aVspace) = 0;

  /* attribute DOMString width; */
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLAppletElement, NS_IDOMHTMLAPPLETELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLAPPLETELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt); \
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt); \
  NS_SCRIPTABLE NS_IMETHOD GetArchive(nsAString & aArchive); \
  NS_SCRIPTABLE NS_IMETHOD SetArchive(const nsAString & aArchive); \
  NS_SCRIPTABLE NS_IMETHOD GetCode(nsAString & aCode); \
  NS_SCRIPTABLE NS_IMETHOD SetCode(const nsAString & aCode); \
  NS_SCRIPTABLE NS_IMETHOD GetCodeBase(nsAString & aCodeBase); \
  NS_SCRIPTABLE NS_IMETHOD SetCodeBase(const nsAString & aCodeBase); \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight); \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight); \
  NS_SCRIPTABLE NS_IMETHOD GetHspace(PRInt32 *aHspace); \
  NS_SCRIPTABLE NS_IMETHOD SetHspace(PRInt32 aHspace); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetObject(nsAString & aObject); \
  NS_SCRIPTABLE NS_IMETHOD SetObject(const nsAString & aObject); \
  NS_SCRIPTABLE NS_IMETHOD GetVspace(PRInt32 *aVspace); \
  NS_SCRIPTABLE NS_IMETHOD SetVspace(PRInt32 aVspace); \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth); \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLAPPLETELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return _to GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return _to SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt) { return _to GetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt) { return _to SetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD GetArchive(nsAString & aArchive) { return _to GetArchive(aArchive); } \
  NS_SCRIPTABLE NS_IMETHOD SetArchive(const nsAString & aArchive) { return _to SetArchive(aArchive); } \
  NS_SCRIPTABLE NS_IMETHOD GetCode(nsAString & aCode) { return _to GetCode(aCode); } \
  NS_SCRIPTABLE NS_IMETHOD SetCode(const nsAString & aCode) { return _to SetCode(aCode); } \
  NS_SCRIPTABLE NS_IMETHOD GetCodeBase(nsAString & aCodeBase) { return _to GetCodeBase(aCodeBase); } \
  NS_SCRIPTABLE NS_IMETHOD SetCodeBase(const nsAString & aCodeBase) { return _to SetCodeBase(aCodeBase); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight) { return _to GetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight) { return _to SetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetHspace(PRInt32 *aHspace) { return _to GetHspace(aHspace); } \
  NS_SCRIPTABLE NS_IMETHOD SetHspace(PRInt32 aHspace) { return _to SetHspace(aHspace); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetObject(nsAString & aObject) { return _to GetObject(aObject); } \
  NS_SCRIPTABLE NS_IMETHOD SetObject(const nsAString & aObject) { return _to SetObject(aObject); } \
  NS_SCRIPTABLE NS_IMETHOD GetVspace(PRInt32 *aVspace) { return _to GetVspace(aVspace); } \
  NS_SCRIPTABLE NS_IMETHOD SetVspace(PRInt32 aVspace) { return _to SetVspace(aVspace); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return _to GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return _to SetWidth(aWidth); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLAPPLETELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD GetArchive(nsAString & aArchive) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetArchive(aArchive); } \
  NS_SCRIPTABLE NS_IMETHOD SetArchive(const nsAString & aArchive) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetArchive(aArchive); } \
  NS_SCRIPTABLE NS_IMETHOD GetCode(nsAString & aCode) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCode(aCode); } \
  NS_SCRIPTABLE NS_IMETHOD SetCode(const nsAString & aCode) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCode(aCode); } \
  NS_SCRIPTABLE NS_IMETHOD GetCodeBase(nsAString & aCodeBase) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCodeBase(aCodeBase); } \
  NS_SCRIPTABLE NS_IMETHOD SetCodeBase(const nsAString & aCodeBase) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCodeBase(aCodeBase); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(nsAString & aHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(const nsAString & aHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetHspace(PRInt32 *aHspace) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHspace(aHspace); } \
  NS_SCRIPTABLE NS_IMETHOD SetHspace(PRInt32 aHspace) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHspace(aHspace); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetObject(nsAString & aObject) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetObject(aObject); } \
  NS_SCRIPTABLE NS_IMETHOD SetObject(const nsAString & aObject) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetObject(aObject); } \
  NS_SCRIPTABLE NS_IMETHOD GetVspace(PRInt32 *aVspace) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVspace(aVspace); } \
  NS_SCRIPTABLE NS_IMETHOD SetVspace(PRInt32 aVspace) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVspace(aVspace); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(const nsAString & aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetWidth(aWidth); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLAppletElement : public nsIDOMHTMLAppletElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLAPPLETELEMENT

  nsDOMHTMLAppletElement();

private:
  ~nsDOMHTMLAppletElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLAppletElement, nsIDOMHTMLAppletElement)

nsDOMHTMLAppletElement::nsDOMHTMLAppletElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLAppletElement::~nsDOMHTMLAppletElement()
{
  /* destructor code */
}

/* attribute DOMString align; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetAlign(nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetAlign(const nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString alt; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetAlt(nsAString & aAlt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetAlt(const nsAString & aAlt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString archive; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetArchive(nsAString & aArchive)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetArchive(const nsAString & aArchive)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString code; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetCode(nsAString & aCode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetCode(const nsAString & aCode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString codeBase; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetCodeBase(nsAString & aCodeBase)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetCodeBase(const nsAString & aCodeBase)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString height; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetHeight(nsAString & aHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetHeight(const nsAString & aHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long hspace; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetHspace(PRInt32 *aHspace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetHspace(PRInt32 aHspace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString object; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetObject(nsAString & aObject)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetObject(const nsAString & aObject)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long vspace; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetVspace(PRInt32 *aVspace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetVspace(PRInt32 aVspace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString width; */
NS_IMETHODIMP nsDOMHTMLAppletElement::GetWidth(nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLAppletElement::SetWidth(const nsAString & aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLAppletElement_h__ */
