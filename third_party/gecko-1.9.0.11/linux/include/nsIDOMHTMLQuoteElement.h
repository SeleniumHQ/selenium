/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLQuoteElement.idl
 */

#ifndef __gen_nsIDOMHTMLQuoteElement_h__
#define __gen_nsIDOMHTMLQuoteElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLQuoteElement */
#define NS_IDOMHTMLQUOTEELEMENT_IID_STR "a6cf90a3-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLQUOTEELEMENT_IID \
  {0xa6cf90a3, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLQuoteElement interface is the interface to a [X]HTML
 * q element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLQuoteElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLQUOTEELEMENT_IID)

  /* attribute DOMString cite; */
  NS_SCRIPTABLE NS_IMETHOD GetCite(nsAString & aCite) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCite(const nsAString & aCite) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLQuoteElement, NS_IDOMHTMLQUOTEELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLQUOTEELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetCite(nsAString & aCite); \
  NS_SCRIPTABLE NS_IMETHOD SetCite(const nsAString & aCite); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLQUOTEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCite(nsAString & aCite) { return _to GetCite(aCite); } \
  NS_SCRIPTABLE NS_IMETHOD SetCite(const nsAString & aCite) { return _to SetCite(aCite); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLQUOTEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCite(nsAString & aCite) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCite(aCite); } \
  NS_SCRIPTABLE NS_IMETHOD SetCite(const nsAString & aCite) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCite(aCite); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLQuoteElement : public nsIDOMHTMLQuoteElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLQUOTEELEMENT

  nsDOMHTMLQuoteElement();

private:
  ~nsDOMHTMLQuoteElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLQuoteElement, nsIDOMHTMLQuoteElement)

nsDOMHTMLQuoteElement::nsDOMHTMLQuoteElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLQuoteElement::~nsDOMHTMLQuoteElement()
{
  /* destructor code */
}

/* attribute DOMString cite; */
NS_IMETHODIMP nsDOMHTMLQuoteElement::GetCite(nsAString & aCite)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLQuoteElement::SetCite(const nsAString & aCite)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLQuoteElement_h__ */
