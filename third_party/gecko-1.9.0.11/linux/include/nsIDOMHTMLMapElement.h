/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLMapElement.idl
 */

#ifndef __gen_nsIDOMHTMLMapElement_h__
#define __gen_nsIDOMHTMLMapElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLMapElement */
#define NS_IDOMHTMLMAPELEMENT_IID_STR "a6cf90af-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLMAPELEMENT_IID \
  {0xa6cf90af, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLMapElement interface is the interface to a [X]HTML
 * map element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLMapElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLMAPELEMENT_IID)

  /* readonly attribute nsIDOMHTMLCollection areas; */
  NS_SCRIPTABLE NS_IMETHOD GetAreas(nsIDOMHTMLCollection * *aAreas) = 0;

  /* attribute DOMString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLMapElement, NS_IDOMHTMLMAPELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLMAPELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetAreas(nsIDOMHTMLCollection * *aAreas); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLMAPELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAreas(nsIDOMHTMLCollection * *aAreas) { return _to GetAreas(aAreas); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLMAPELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetAreas(nsIDOMHTMLCollection * *aAreas) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAreas(aAreas); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLMapElement : public nsIDOMHTMLMapElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLMAPELEMENT

  nsDOMHTMLMapElement();

private:
  ~nsDOMHTMLMapElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLMapElement, nsIDOMHTMLMapElement)

nsDOMHTMLMapElement::nsDOMHTMLMapElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLMapElement::~nsDOMHTMLMapElement()
{
  /* destructor code */
}

/* readonly attribute nsIDOMHTMLCollection areas; */
NS_IMETHODIMP nsDOMHTMLMapElement::GetAreas(nsIDOMHTMLCollection * *aAreas)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMHTMLMapElement::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLMapElement::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLMapElement_h__ */
