/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLFormElement.idl
 */

#ifndef __gen_nsIDOMHTMLFormElement_h__
#define __gen_nsIDOMHTMLFormElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLFormElement */
#define NS_IDOMHTMLFORMELEMENT_IID_STR "a6cf908f-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLFORMELEMENT_IID \
  {0xa6cf908f, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLFormElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLFORMELEMENT_IID)

  /**
 * The nsIDOMHTMLFormElement interface is the interface to a [X]HTML
 * form element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
  /* readonly attribute nsIDOMHTMLCollection elements; */
  NS_SCRIPTABLE NS_IMETHOD GetElements(nsIDOMHTMLCollection * *aElements) = 0;

  /* readonly attribute long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRInt32 *aLength) = 0;

  /* attribute DOMString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /* attribute DOMString acceptCharset; */
  NS_SCRIPTABLE NS_IMETHOD GetAcceptCharset(nsAString & aAcceptCharset) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAcceptCharset(const nsAString & aAcceptCharset) = 0;

  /* attribute DOMString action; */
  NS_SCRIPTABLE NS_IMETHOD GetAction(nsAString & aAction) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAction(const nsAString & aAction) = 0;

  /* attribute DOMString enctype; */
  NS_SCRIPTABLE NS_IMETHOD GetEnctype(nsAString & aEnctype) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetEnctype(const nsAString & aEnctype) = 0;

  /* attribute DOMString method; */
  NS_SCRIPTABLE NS_IMETHOD GetMethod(nsAString & aMethod) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetMethod(const nsAString & aMethod) = 0;

  /* attribute DOMString target; */
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) = 0;

  /* void submit (); */
  NS_SCRIPTABLE NS_IMETHOD Submit(void) = 0;

  /* void reset (); */
  NS_SCRIPTABLE NS_IMETHOD Reset(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLFormElement, NS_IDOMHTMLFORMELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLFORMELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetElements(nsIDOMHTMLCollection * *aElements); \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRInt32 *aLength); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetAcceptCharset(nsAString & aAcceptCharset); \
  NS_SCRIPTABLE NS_IMETHOD SetAcceptCharset(const nsAString & aAcceptCharset); \
  NS_SCRIPTABLE NS_IMETHOD GetAction(nsAString & aAction); \
  NS_SCRIPTABLE NS_IMETHOD SetAction(const nsAString & aAction); \
  NS_SCRIPTABLE NS_IMETHOD GetEnctype(nsAString & aEnctype); \
  NS_SCRIPTABLE NS_IMETHOD SetEnctype(const nsAString & aEnctype); \
  NS_SCRIPTABLE NS_IMETHOD GetMethod(nsAString & aMethod); \
  NS_SCRIPTABLE NS_IMETHOD SetMethod(const nsAString & aMethod); \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget); \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget); \
  NS_SCRIPTABLE NS_IMETHOD Submit(void); \
  NS_SCRIPTABLE NS_IMETHOD Reset(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLFORMELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetElements(nsIDOMHTMLCollection * *aElements) { return _to GetElements(aElements); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRInt32 *aLength) { return _to GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetAcceptCharset(nsAString & aAcceptCharset) { return _to GetAcceptCharset(aAcceptCharset); } \
  NS_SCRIPTABLE NS_IMETHOD SetAcceptCharset(const nsAString & aAcceptCharset) { return _to SetAcceptCharset(aAcceptCharset); } \
  NS_SCRIPTABLE NS_IMETHOD GetAction(nsAString & aAction) { return _to GetAction(aAction); } \
  NS_SCRIPTABLE NS_IMETHOD SetAction(const nsAString & aAction) { return _to SetAction(aAction); } \
  NS_SCRIPTABLE NS_IMETHOD GetEnctype(nsAString & aEnctype) { return _to GetEnctype(aEnctype); } \
  NS_SCRIPTABLE NS_IMETHOD SetEnctype(const nsAString & aEnctype) { return _to SetEnctype(aEnctype); } \
  NS_SCRIPTABLE NS_IMETHOD GetMethod(nsAString & aMethod) { return _to GetMethod(aMethod); } \
  NS_SCRIPTABLE NS_IMETHOD SetMethod(const nsAString & aMethod) { return _to SetMethod(aMethod); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return _to GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) { return _to SetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD Submit(void) { return _to Submit(); } \
  NS_SCRIPTABLE NS_IMETHOD Reset(void) { return _to Reset(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLFORMELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetElements(nsIDOMHTMLCollection * *aElements) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetElements(aElements); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRInt32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetAcceptCharset(nsAString & aAcceptCharset) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAcceptCharset(aAcceptCharset); } \
  NS_SCRIPTABLE NS_IMETHOD SetAcceptCharset(const nsAString & aAcceptCharset) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAcceptCharset(aAcceptCharset); } \
  NS_SCRIPTABLE NS_IMETHOD GetAction(nsAString & aAction) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAction(aAction); } \
  NS_SCRIPTABLE NS_IMETHOD SetAction(const nsAString & aAction) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAction(aAction); } \
  NS_SCRIPTABLE NS_IMETHOD GetEnctype(nsAString & aEnctype) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEnctype(aEnctype); } \
  NS_SCRIPTABLE NS_IMETHOD SetEnctype(const nsAString & aEnctype) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetEnctype(aEnctype); } \
  NS_SCRIPTABLE NS_IMETHOD GetMethod(nsAString & aMethod) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMethod(aMethod); } \
  NS_SCRIPTABLE NS_IMETHOD SetMethod(const nsAString & aMethod) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMethod(aMethod); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD SetTarget(const nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD Submit(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Submit(); } \
  NS_SCRIPTABLE NS_IMETHOD Reset(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Reset(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLFormElement : public nsIDOMHTMLFormElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLFORMELEMENT

  nsDOMHTMLFormElement();

private:
  ~nsDOMHTMLFormElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLFormElement, nsIDOMHTMLFormElement)

nsDOMHTMLFormElement::nsDOMHTMLFormElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLFormElement::~nsDOMHTMLFormElement()
{
  /* destructor code */
}

/* readonly attribute nsIDOMHTMLCollection elements; */
NS_IMETHODIMP nsDOMHTMLFormElement::GetElements(nsIDOMHTMLCollection * *aElements)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long length; */
NS_IMETHODIMP nsDOMHTMLFormElement::GetLength(PRInt32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMHTMLFormElement::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFormElement::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString acceptCharset; */
NS_IMETHODIMP nsDOMHTMLFormElement::GetAcceptCharset(nsAString & aAcceptCharset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFormElement::SetAcceptCharset(const nsAString & aAcceptCharset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString action; */
NS_IMETHODIMP nsDOMHTMLFormElement::GetAction(nsAString & aAction)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFormElement::SetAction(const nsAString & aAction)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString enctype; */
NS_IMETHODIMP nsDOMHTMLFormElement::GetEnctype(nsAString & aEnctype)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFormElement::SetEnctype(const nsAString & aEnctype)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString method; */
NS_IMETHODIMP nsDOMHTMLFormElement::GetMethod(nsAString & aMethod)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFormElement::SetMethod(const nsAString & aMethod)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString target; */
NS_IMETHODIMP nsDOMHTMLFormElement::GetTarget(nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLFormElement::SetTarget(const nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void submit (); */
NS_IMETHODIMP nsDOMHTMLFormElement::Submit()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void reset (); */
NS_IMETHODIMP nsDOMHTMLFormElement::Reset()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLFormElement_h__ */
