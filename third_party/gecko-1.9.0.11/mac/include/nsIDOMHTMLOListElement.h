/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLOListElement.idl
 */

#ifndef __gen_nsIDOMHTMLOListElement_h__
#define __gen_nsIDOMHTMLOListElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLOListElement */
#define NS_IDOMHTMLOLISTELEMENT_IID_STR "a6cf909a-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLOLISTELEMENT_IID \
  {0xa6cf909a, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLOListElement interface is the interface to a [X]HTML
 * ol element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLOListElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLOLISTELEMENT_IID)

  /* attribute boolean compact; */
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact) = 0;

  /* attribute long start; */
  NS_SCRIPTABLE NS_IMETHOD GetStart(PRInt32 *aStart) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetStart(PRInt32 aStart) = 0;

  /* attribute DOMString type; */
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLOListElement, NS_IDOMHTMLOLISTELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLOLISTELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact); \
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact); \
  NS_SCRIPTABLE NS_IMETHOD GetStart(PRInt32 *aStart); \
  NS_SCRIPTABLE NS_IMETHOD SetStart(PRInt32 aStart); \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType); \
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLOLISTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact) { return _to GetCompact(aCompact); } \
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact) { return _to SetCompact(aCompact); } \
  NS_SCRIPTABLE NS_IMETHOD GetStart(PRInt32 *aStart) { return _to GetStart(aStart); } \
  NS_SCRIPTABLE NS_IMETHOD SetStart(PRInt32 aStart) { return _to SetStart(aStart); } \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return _to GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType) { return _to SetType(aType); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLOLISTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCompact(aCompact); } \
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCompact(aCompact); } \
  NS_SCRIPTABLE NS_IMETHOD GetStart(PRInt32 *aStart) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetStart(aStart); } \
  NS_SCRIPTABLE NS_IMETHOD SetStart(PRInt32 aStart) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetStart(aStart); } \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetType(aType); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLOListElement : public nsIDOMHTMLOListElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLOLISTELEMENT

  nsDOMHTMLOListElement();

private:
  ~nsDOMHTMLOListElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLOListElement, nsIDOMHTMLOListElement)

nsDOMHTMLOListElement::nsDOMHTMLOListElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLOListElement::~nsDOMHTMLOListElement()
{
  /* destructor code */
}

/* attribute boolean compact; */
NS_IMETHODIMP nsDOMHTMLOListElement::GetCompact(PRBool *aCompact)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLOListElement::SetCompact(PRBool aCompact)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long start; */
NS_IMETHODIMP nsDOMHTMLOListElement::GetStart(PRInt32 *aStart)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLOListElement::SetStart(PRInt32 aStart)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString type; */
NS_IMETHODIMP nsDOMHTMLOListElement::GetType(nsAString & aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLOListElement::SetType(const nsAString & aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLOListElement_h__ */
