/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLHtmlElement.idl
 */

#ifndef __gen_nsIDOMHTMLHtmlElement_h__
#define __gen_nsIDOMHTMLHtmlElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLHtmlElement */
#define NS_IDOMHTMLHTMLELEMENT_IID_STR "a6cf9086-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLHTMLELEMENT_IID \
  {0xa6cf9086, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLHtmlElement interface is the interface to a [X]HTML
 * html element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLHtmlElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLHTMLELEMENT_IID)

  /* attribute DOMString version; */
  NS_SCRIPTABLE NS_IMETHOD GetVersion(nsAString & aVersion) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVersion(const nsAString & aVersion) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLHtmlElement, NS_IDOMHTMLHTMLELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLHTMLELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetVersion(nsAString & aVersion); \
  NS_SCRIPTABLE NS_IMETHOD SetVersion(const nsAString & aVersion); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLHTMLELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetVersion(nsAString & aVersion) { return _to GetVersion(aVersion); } \
  NS_SCRIPTABLE NS_IMETHOD SetVersion(const nsAString & aVersion) { return _to SetVersion(aVersion); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLHTMLELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetVersion(nsAString & aVersion) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVersion(aVersion); } \
  NS_SCRIPTABLE NS_IMETHOD SetVersion(const nsAString & aVersion) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVersion(aVersion); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLHtmlElement : public nsIDOMHTMLHtmlElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLHTMLELEMENT

  nsDOMHTMLHtmlElement();

private:
  ~nsDOMHTMLHtmlElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLHtmlElement, nsIDOMHTMLHtmlElement)

nsDOMHTMLHtmlElement::nsDOMHTMLHtmlElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLHtmlElement::~nsDOMHTMLHtmlElement()
{
  /* destructor code */
}

/* attribute DOMString version; */
NS_IMETHODIMP nsDOMHTMLHtmlElement::GetVersion(nsAString & aVersion)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLHtmlElement::SetVersion(const nsAString & aVersion)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLHtmlElement_h__ */
