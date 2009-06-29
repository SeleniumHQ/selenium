/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLElement.idl
 */

#ifndef __gen_nsIDOMHTMLElement_h__
#define __gen_nsIDOMHTMLElement_h__


#ifndef __gen_nsIDOMElement_h__
#include "nsIDOMElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLElement */
#define NS_IDOMHTMLELEMENT_IID_STR "a6cf9085-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLELEMENT_IID \
  {0xa6cf9085, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLElement : public nsIDOMElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLELEMENT_IID)

  /**
 * The nsIDOMHTMLElement interface is the primary [X]HTML element
 * interface. It represents a single [X]HTML element in the document
 * tree.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
  /* attribute DOMString id; */
  NS_SCRIPTABLE NS_IMETHOD GetId(nsAString & aId) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetId(const nsAString & aId) = 0;

  /* attribute DOMString title; */
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) = 0;

  /* attribute DOMString lang; */
  NS_SCRIPTABLE NS_IMETHOD GetLang(nsAString & aLang) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLang(const nsAString & aLang) = 0;

  /* attribute DOMString dir; */
  NS_SCRIPTABLE NS_IMETHOD GetDir(nsAString & aDir) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDir(const nsAString & aDir) = 0;

  /* attribute DOMString className; */
  NS_SCRIPTABLE NS_IMETHOD GetClassName(nsAString & aClassName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetClassName(const nsAString & aClassName) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLElement, NS_IDOMHTMLELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetId(nsAString & aId); \
  NS_SCRIPTABLE NS_IMETHOD SetId(const nsAString & aId); \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD GetLang(nsAString & aLang); \
  NS_SCRIPTABLE NS_IMETHOD SetLang(const nsAString & aLang); \
  NS_SCRIPTABLE NS_IMETHOD GetDir(nsAString & aDir); \
  NS_SCRIPTABLE NS_IMETHOD SetDir(const nsAString & aDir); \
  NS_SCRIPTABLE NS_IMETHOD GetClassName(nsAString & aClassName); \
  NS_SCRIPTABLE NS_IMETHOD SetClassName(const nsAString & aClassName); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetId(nsAString & aId) { return _to GetId(aId); } \
  NS_SCRIPTABLE NS_IMETHOD SetId(const nsAString & aId) { return _to SetId(aId); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return _to GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return _to SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetLang(nsAString & aLang) { return _to GetLang(aLang); } \
  NS_SCRIPTABLE NS_IMETHOD SetLang(const nsAString & aLang) { return _to SetLang(aLang); } \
  NS_SCRIPTABLE NS_IMETHOD GetDir(nsAString & aDir) { return _to GetDir(aDir); } \
  NS_SCRIPTABLE NS_IMETHOD SetDir(const nsAString & aDir) { return _to SetDir(aDir); } \
  NS_SCRIPTABLE NS_IMETHOD GetClassName(nsAString & aClassName) { return _to GetClassName(aClassName); } \
  NS_SCRIPTABLE NS_IMETHOD SetClassName(const nsAString & aClassName) { return _to SetClassName(aClassName); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetId(nsAString & aId) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetId(aId); } \
  NS_SCRIPTABLE NS_IMETHOD SetId(const nsAString & aId) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetId(aId); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetLang(nsAString & aLang) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLang(aLang); } \
  NS_SCRIPTABLE NS_IMETHOD SetLang(const nsAString & aLang) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLang(aLang); } \
  NS_SCRIPTABLE NS_IMETHOD GetDir(nsAString & aDir) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDir(aDir); } \
  NS_SCRIPTABLE NS_IMETHOD SetDir(const nsAString & aDir) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDir(aDir); } \
  NS_SCRIPTABLE NS_IMETHOD GetClassName(nsAString & aClassName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClassName(aClassName); } \
  NS_SCRIPTABLE NS_IMETHOD SetClassName(const nsAString & aClassName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetClassName(aClassName); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLElement : public nsIDOMHTMLElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLELEMENT

  nsDOMHTMLElement();

private:
  ~nsDOMHTMLElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLElement, nsIDOMHTMLElement)

nsDOMHTMLElement::nsDOMHTMLElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLElement::~nsDOMHTMLElement()
{
  /* destructor code */
}

/* attribute DOMString id; */
NS_IMETHODIMP nsDOMHTMLElement::GetId(nsAString & aId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLElement::SetId(const nsAString & aId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString title; */
NS_IMETHODIMP nsDOMHTMLElement::GetTitle(nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLElement::SetTitle(const nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString lang; */
NS_IMETHODIMP nsDOMHTMLElement::GetLang(nsAString & aLang)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLElement::SetLang(const nsAString & aLang)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString dir; */
NS_IMETHODIMP nsDOMHTMLElement::GetDir(nsAString & aDir)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLElement::SetDir(const nsAString & aDir)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString className; */
NS_IMETHODIMP nsDOMHTMLElement::GetClassName(nsAString & aClassName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLElement::SetClassName(const nsAString & aClassName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLElement_h__ */
