/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLDListElement.idl
 */

#ifndef __gen_nsIDOMHTMLDListElement_h__
#define __gen_nsIDOMHTMLDListElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLDListElement */
#define NS_IDOMHTMLDLISTELEMENT_IID_STR "a6cf909b-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLDLISTELEMENT_IID \
  {0xa6cf909b, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLDListElement interface is the interface to a [X]HTML
 * dl element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLDListElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLDLISTELEMENT_IID)

  /* attribute boolean compact; */
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLDListElement, NS_IDOMHTMLDLISTELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLDLISTELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact); \
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLDLISTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact) { return _to GetCompact(aCompact); } \
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact) { return _to SetCompact(aCompact); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLDLISTELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCompact(aCompact); } \
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCompact(aCompact); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLDListElement : public nsIDOMHTMLDListElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLDLISTELEMENT

  nsDOMHTMLDListElement();

private:
  ~nsDOMHTMLDListElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLDListElement, nsIDOMHTMLDListElement)

nsDOMHTMLDListElement::nsDOMHTMLDListElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLDListElement::~nsDOMHTMLDListElement()
{
  /* destructor code */
}

/* attribute boolean compact; */
NS_IMETHODIMP nsDOMHTMLDListElement::GetCompact(PRBool *aCompact)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLDListElement::SetCompact(PRBool aCompact)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLDListElement_h__ */
