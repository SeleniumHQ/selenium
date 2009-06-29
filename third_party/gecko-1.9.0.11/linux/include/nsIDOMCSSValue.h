/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/css/nsIDOMCSSValue.idl
 */

#ifndef __gen_nsIDOMCSSValue_h__
#define __gen_nsIDOMCSSValue_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMCSSValue */
#define NS_IDOMCSSVALUE_IID_STR "009f7ea5-9e80-41be-b008-db62f10823f2"

#define NS_IDOMCSSVALUE_IID \
  {0x009f7ea5, 0x9e80, 0x41be, \
    { 0xb0, 0x08, 0xdb, 0x62, 0xf1, 0x08, 0x23, 0xf2 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMCSSValue : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMCSSVALUE_IID)

  /**
 * The nsIDOMCSSValue interface is a datatype for a CSS value in the
 * Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Style
 *
 * @status FROZEN
 */
  enum { CSS_INHERIT = 0U };

  enum { CSS_PRIMITIVE_VALUE = 1U };

  enum { CSS_VALUE_LIST = 2U };

  enum { CSS_CUSTOM = 3U };

  /* attribute DOMString cssText; */
  NS_SCRIPTABLE NS_IMETHOD GetCssText(nsAString & aCssText) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCssText(const nsAString & aCssText) = 0;

  /* readonly attribute unsigned short cssValueType; */
  NS_SCRIPTABLE NS_IMETHOD GetCssValueType(PRUint16 *aCssValueType) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMCSSValue, NS_IDOMCSSVALUE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMCSSVALUE \
  NS_SCRIPTABLE NS_IMETHOD GetCssText(nsAString & aCssText); \
  NS_SCRIPTABLE NS_IMETHOD SetCssText(const nsAString & aCssText); \
  NS_SCRIPTABLE NS_IMETHOD GetCssValueType(PRUint16 *aCssValueType); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMCSSVALUE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCssText(nsAString & aCssText) { return _to GetCssText(aCssText); } \
  NS_SCRIPTABLE NS_IMETHOD SetCssText(const nsAString & aCssText) { return _to SetCssText(aCssText); } \
  NS_SCRIPTABLE NS_IMETHOD GetCssValueType(PRUint16 *aCssValueType) { return _to GetCssValueType(aCssValueType); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMCSSVALUE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCssText(nsAString & aCssText) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCssText(aCssText); } \
  NS_SCRIPTABLE NS_IMETHOD SetCssText(const nsAString & aCssText) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCssText(aCssText); } \
  NS_SCRIPTABLE NS_IMETHOD GetCssValueType(PRUint16 *aCssValueType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCssValueType(aCssValueType); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMCSSValue : public nsIDOMCSSValue
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMCSSVALUE

  nsDOMCSSValue();

private:
  ~nsDOMCSSValue();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMCSSValue, nsIDOMCSSValue)

nsDOMCSSValue::nsDOMCSSValue()
{
  /* member initializers and constructor code */
}

nsDOMCSSValue::~nsDOMCSSValue()
{
  /* destructor code */
}

/* attribute DOMString cssText; */
NS_IMETHODIMP nsDOMCSSValue::GetCssText(nsAString & aCssText)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMCSSValue::SetCssText(const nsAString & aCssText)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned short cssValueType; */
NS_IMETHODIMP nsDOMCSSValue::GetCssValueType(PRUint16 *aCssValueType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMCSSValue_h__ */
