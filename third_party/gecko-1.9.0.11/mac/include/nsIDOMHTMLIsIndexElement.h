/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLIsIndexElement.idl
 */

#ifndef __gen_nsIDOMHTMLIsIndexElement_h__
#define __gen_nsIDOMHTMLIsIndexElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLIsIndexElement */
#define NS_IDOMHTMLISINDEXELEMENT_IID_STR "a6cf908c-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLISINDEXELEMENT_IID \
  {0xa6cf908c, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLIsIndexElement interface is the interface to a
 * [X]HTML isindex element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLIsIndexElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLISINDEXELEMENT_IID)

  /* readonly attribute nsIDOMHTMLFormElement form; */
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm) = 0;

  /* attribute DOMString prompt; */
  NS_SCRIPTABLE NS_IMETHOD GetPrompt(nsAString & aPrompt) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPrompt(const nsAString & aPrompt) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLIsIndexElement, NS_IDOMHTMLISINDEXELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLISINDEXELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm); \
  NS_SCRIPTABLE NS_IMETHOD GetPrompt(nsAString & aPrompt); \
  NS_SCRIPTABLE NS_IMETHOD SetPrompt(const nsAString & aPrompt); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLISINDEXELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm) { return _to GetForm(aForm); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrompt(nsAString & aPrompt) { return _to GetPrompt(aPrompt); } \
  NS_SCRIPTABLE NS_IMETHOD SetPrompt(const nsAString & aPrompt) { return _to SetPrompt(aPrompt); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLISINDEXELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetForm(nsIDOMHTMLFormElement * *aForm) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetForm(aForm); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrompt(nsAString & aPrompt) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPrompt(aPrompt); } \
  NS_SCRIPTABLE NS_IMETHOD SetPrompt(const nsAString & aPrompt) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPrompt(aPrompt); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLIsIndexElement : public nsIDOMHTMLIsIndexElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLISINDEXELEMENT

  nsDOMHTMLIsIndexElement();

private:
  ~nsDOMHTMLIsIndexElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLIsIndexElement, nsIDOMHTMLIsIndexElement)

nsDOMHTMLIsIndexElement::nsDOMHTMLIsIndexElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLIsIndexElement::~nsDOMHTMLIsIndexElement()
{
  /* destructor code */
}

/* readonly attribute nsIDOMHTMLFormElement form; */
NS_IMETHODIMP nsDOMHTMLIsIndexElement::GetForm(nsIDOMHTMLFormElement * *aForm)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString prompt; */
NS_IMETHODIMP nsDOMHTMLIsIndexElement::GetPrompt(nsAString & aPrompt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLIsIndexElement::SetPrompt(const nsAString & aPrompt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLIsIndexElement_h__ */
