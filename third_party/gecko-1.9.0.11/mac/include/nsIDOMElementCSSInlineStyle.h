/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/css/nsIDOMElementCSSInlineStyle.idl
 */

#ifndef __gen_nsIDOMElementCSSInlineStyle_h__
#define __gen_nsIDOMElementCSSInlineStyle_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMElementCSSInlineStyle */
#define NS_IDOMELEMENTCSSINLINESTYLE_IID_STR "99715845-95fc-4a56-aa53-214b65c26e22"

#define NS_IDOMELEMENTCSSINLINESTYLE_IID \
  {0x99715845, 0x95fc, 0x4a56, \
    { 0xaa, 0x53, 0x21, 0x4b, 0x65, 0xc2, 0x6e, 0x22 }}

/**
 * The nsIDOMElementCSSInlineStyle interface allows access to the inline
 * style information for elements.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Style
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMElementCSSInlineStyle : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMELEMENTCSSINLINESTYLE_IID)

  /* readonly attribute nsIDOMCSSStyleDeclaration style; */
  NS_SCRIPTABLE NS_IMETHOD GetStyle(nsIDOMCSSStyleDeclaration * *aStyle) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMElementCSSInlineStyle, NS_IDOMELEMENTCSSINLINESTYLE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMELEMENTCSSINLINESTYLE \
  NS_SCRIPTABLE NS_IMETHOD GetStyle(nsIDOMCSSStyleDeclaration * *aStyle); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMELEMENTCSSINLINESTYLE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetStyle(nsIDOMCSSStyleDeclaration * *aStyle) { return _to GetStyle(aStyle); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMELEMENTCSSINLINESTYLE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetStyle(nsIDOMCSSStyleDeclaration * *aStyle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetStyle(aStyle); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMElementCSSInlineStyle : public nsIDOMElementCSSInlineStyle
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMELEMENTCSSINLINESTYLE

  nsDOMElementCSSInlineStyle();

private:
  ~nsDOMElementCSSInlineStyle();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMElementCSSInlineStyle, nsIDOMElementCSSInlineStyle)

nsDOMElementCSSInlineStyle::nsDOMElementCSSInlineStyle()
{
  /* member initializers and constructor code */
}

nsDOMElementCSSInlineStyle::~nsDOMElementCSSInlineStyle()
{
  /* destructor code */
}

/* readonly attribute nsIDOMCSSStyleDeclaration style; */
NS_IMETHODIMP nsDOMElementCSSInlineStyle::GetStyle(nsIDOMCSSStyleDeclaration * *aStyle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMElementCSSInlineStyle_h__ */
