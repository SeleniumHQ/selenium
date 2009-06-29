/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLMenuElement.idl
 */

#ifndef __gen_nsIDOMHTMLMenuElement_h__
#define __gen_nsIDOMHTMLMenuElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLMenuElement */
#define NS_IDOMHTMLMENUELEMENT_IID_STR "a6cf909d-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLMENUELEMENT_IID \
  {0xa6cf909d, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLMenuElement interface is the interface to a [X]HTML
 * menu element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLMenuElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLMENUELEMENT_IID)

  /* attribute boolean compact; */
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLMenuElement, NS_IDOMHTMLMENUELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLMENUELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact); \
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLMENUELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact) { return _to GetCompact(aCompact); } \
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact) { return _to SetCompact(aCompact); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLMENUELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCompact(PRBool *aCompact) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCompact(aCompact); } \
  NS_SCRIPTABLE NS_IMETHOD SetCompact(PRBool aCompact) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCompact(aCompact); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLMenuElement : public nsIDOMHTMLMenuElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLMENUELEMENT

  nsDOMHTMLMenuElement();

private:
  ~nsDOMHTMLMenuElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLMenuElement, nsIDOMHTMLMenuElement)

nsDOMHTMLMenuElement::nsDOMHTMLMenuElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLMenuElement::~nsDOMHTMLMenuElement()
{
  /* destructor code */
}

/* attribute boolean compact; */
NS_IMETHODIMP nsDOMHTMLMenuElement::GetCompact(PRBool *aCompact)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLMenuElement::SetCompact(PRBool aCompact)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLMenuElement_h__ */
