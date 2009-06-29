/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/css/nsIDOMCSSPrimitiveValue.idl
 */

#ifndef __gen_nsIDOMCSSPrimitiveValue_h__
#define __gen_nsIDOMCSSPrimitiveValue_h__


#ifndef __gen_nsIDOMCSSValue_h__
#include "nsIDOMCSSValue.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMCSSPrimitiveValue */
#define NS_IDOMCSSPRIMITIVEVALUE_IID_STR "e249031f-8df9-4e7a-b644-18946dce0019"

#define NS_IDOMCSSPRIMITIVEVALUE_IID \
  {0xe249031f, 0x8df9, 0x4e7a, \
    { 0xb6, 0x44, 0x18, 0x94, 0x6d, 0xce, 0x00, 0x19 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMCSSPrimitiveValue : public nsIDOMCSSValue {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMCSSPRIMITIVEVALUE_IID)

  /**
 * The nsIDOMCSSPrimitiveValue interface is a datatype for a primitive
 * CSS value in the Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Style
 *
 * @status FROZEN
 */
  enum { CSS_UNKNOWN = 0U };

  enum { CSS_NUMBER = 1U };

  enum { CSS_PERCENTAGE = 2U };

  enum { CSS_EMS = 3U };

  enum { CSS_EXS = 4U };

  enum { CSS_PX = 5U };

  enum { CSS_CM = 6U };

  enum { CSS_MM = 7U };

  enum { CSS_IN = 8U };

  enum { CSS_PT = 9U };

  enum { CSS_PC = 10U };

  enum { CSS_DEG = 11U };

  enum { CSS_RAD = 12U };

  enum { CSS_GRAD = 13U };

  enum { CSS_MS = 14U };

  enum { CSS_S = 15U };

  enum { CSS_HZ = 16U };

  enum { CSS_KHZ = 17U };

  enum { CSS_DIMENSION = 18U };

  enum { CSS_STRING = 19U };

  enum { CSS_URI = 20U };

  enum { CSS_IDENT = 21U };

  enum { CSS_ATTR = 22U };

  enum { CSS_COUNTER = 23U };

  enum { CSS_RECT = 24U };

  enum { CSS_RGBCOLOR = 25U };

  /* readonly attribute unsigned short primitiveType; */
  NS_SCRIPTABLE NS_IMETHOD GetPrimitiveType(PRUint16 *aPrimitiveType) = 0;

  /* void setFloatValue (in unsigned short unitType, in float floatValue)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetFloatValue(PRUint16 unitType, float floatValue) = 0;

  /* float getFloatValue (in unsigned short unitType)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD GetFloatValue(PRUint16 unitType, float *_retval) = 0;

  /* void setStringValue (in unsigned short stringType, in DOMString stringValue)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetStringValue(PRUint16 stringType, const nsAString & stringValue) = 0;

  /* DOMString getStringValue ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD GetStringValue(nsAString & _retval) = 0;

  /* nsIDOMCounter getCounterValue ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD GetCounterValue(nsIDOMCounter **_retval) = 0;

  /* nsIDOMRect getRectValue ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD GetRectValue(nsIDOMRect **_retval) = 0;

  /* nsIDOMRGBColor getRGBColorValue ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD GetRGBColorValue(nsIDOMRGBColor **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMCSSPrimitiveValue, NS_IDOMCSSPRIMITIVEVALUE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMCSSPRIMITIVEVALUE \
  NS_SCRIPTABLE NS_IMETHOD GetPrimitiveType(PRUint16 *aPrimitiveType); \
  NS_SCRIPTABLE NS_IMETHOD SetFloatValue(PRUint16 unitType, float floatValue); \
  NS_SCRIPTABLE NS_IMETHOD GetFloatValue(PRUint16 unitType, float *_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetStringValue(PRUint16 stringType, const nsAString & stringValue); \
  NS_SCRIPTABLE NS_IMETHOD GetStringValue(nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD GetCounterValue(nsIDOMCounter **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetRectValue(nsIDOMRect **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetRGBColorValue(nsIDOMRGBColor **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMCSSPRIMITIVEVALUE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetPrimitiveType(PRUint16 *aPrimitiveType) { return _to GetPrimitiveType(aPrimitiveType); } \
  NS_SCRIPTABLE NS_IMETHOD SetFloatValue(PRUint16 unitType, float floatValue) { return _to SetFloatValue(unitType, floatValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetFloatValue(PRUint16 unitType, float *_retval) { return _to GetFloatValue(unitType, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetStringValue(PRUint16 stringType, const nsAString & stringValue) { return _to SetStringValue(stringType, stringValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetStringValue(nsAString & _retval) { return _to GetStringValue(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetCounterValue(nsIDOMCounter **_retval) { return _to GetCounterValue(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetRectValue(nsIDOMRect **_retval) { return _to GetRectValue(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetRGBColorValue(nsIDOMRGBColor **_retval) { return _to GetRGBColorValue(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMCSSPRIMITIVEVALUE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetPrimitiveType(PRUint16 *aPrimitiveType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPrimitiveType(aPrimitiveType); } \
  NS_SCRIPTABLE NS_IMETHOD SetFloatValue(PRUint16 unitType, float floatValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFloatValue(unitType, floatValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetFloatValue(PRUint16 unitType, float *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFloatValue(unitType, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetStringValue(PRUint16 stringType, const nsAString & stringValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetStringValue(stringType, stringValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetStringValue(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetStringValue(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetCounterValue(nsIDOMCounter **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCounterValue(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetRectValue(nsIDOMRect **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRectValue(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetRGBColorValue(nsIDOMRGBColor **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRGBColorValue(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMCSSPrimitiveValue : public nsIDOMCSSPrimitiveValue
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMCSSPRIMITIVEVALUE

  nsDOMCSSPrimitiveValue();

private:
  ~nsDOMCSSPrimitiveValue();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMCSSPrimitiveValue, nsIDOMCSSPrimitiveValue)

nsDOMCSSPrimitiveValue::nsDOMCSSPrimitiveValue()
{
  /* member initializers and constructor code */
}

nsDOMCSSPrimitiveValue::~nsDOMCSSPrimitiveValue()
{
  /* destructor code */
}

/* readonly attribute unsigned short primitiveType; */
NS_IMETHODIMP nsDOMCSSPrimitiveValue::GetPrimitiveType(PRUint16 *aPrimitiveType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setFloatValue (in unsigned short unitType, in float floatValue)  raises (DOMException); */
NS_IMETHODIMP nsDOMCSSPrimitiveValue::SetFloatValue(PRUint16 unitType, float floatValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* float getFloatValue (in unsigned short unitType)  raises (DOMException); */
NS_IMETHODIMP nsDOMCSSPrimitiveValue::GetFloatValue(PRUint16 unitType, float *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setStringValue (in unsigned short stringType, in DOMString stringValue)  raises (DOMException); */
NS_IMETHODIMP nsDOMCSSPrimitiveValue::SetStringValue(PRUint16 stringType, const nsAString & stringValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* DOMString getStringValue ()  raises (DOMException); */
NS_IMETHODIMP nsDOMCSSPrimitiveValue::GetStringValue(nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMCounter getCounterValue ()  raises (DOMException); */
NS_IMETHODIMP nsDOMCSSPrimitiveValue::GetCounterValue(nsIDOMCounter **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMRect getRectValue ()  raises (DOMException); */
NS_IMETHODIMP nsDOMCSSPrimitiveValue::GetRectValue(nsIDOMRect **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMRGBColor getRGBColorValue ()  raises (DOMException); */
NS_IMETHODIMP nsDOMCSSPrimitiveValue::GetRGBColorValue(nsIDOMRGBColor **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMCSSPrimitiveValue_h__ */
