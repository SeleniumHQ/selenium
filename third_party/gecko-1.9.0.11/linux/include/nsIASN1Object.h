/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/security/manager/ssl/public/nsIASN1Object.idl
 */

#ifndef __gen_nsIASN1Object_h__
#define __gen_nsIASN1Object_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIASN1Object */
#define NS_IASN1OBJECT_IID_STR "ba8bf582-1dd1-11b2-898c-f40246bc9a63"

#define NS_IASN1OBJECT_IID \
  {0xba8bf582, 0x1dd1, 0x11b2, \
    { 0x89, 0x8c, 0xf4, 0x02, 0x46, 0xbc, 0x9a, 0x63 }}

/**
 * This represents an ASN.1 object,
 * where ASN.1 is "Abstract Syntax Notation number One".
 *
 * The additional state information carried in this interface
 * makes it fit for being used as the data structure
 * when working with visual reprenstation of ASN.1 objects
 * in a human user interface, like in a tree widget
 * where open/close state of nodes must be remembered.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIASN1Object : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IASN1OBJECT_IID)

  /**
   *  Identifiers for the possible types of object.
   */
  enum { ASN1_END_CONTENTS = 0U };

  enum { ASN1_BOOLEAN = 1U };

  enum { ASN1_INTEGER = 2U };

  enum { ASN1_BIT_STRING = 3U };

  enum { ASN1_OCTET_STRING = 4U };

  enum { ASN1_NULL = 5U };

  enum { ASN1_OBJECT_ID = 6U };

  enum { ASN1_ENUMERATED = 10U };

  enum { ASN1_UTF8_STRING = 12U };

  enum { ASN1_SEQUENCE = 16U };

  enum { ASN1_SET = 17U };

  enum { ASN1_PRINTABLE_STRING = 19U };

  enum { ASN1_T61_STRING = 20U };

  enum { ASN1_IA5_STRING = 22U };

  enum { ASN1_UTC_TIME = 23U };

  enum { ASN1_GEN_TIME = 24U };

  enum { ASN1_VISIBLE_STRING = 26U };

  enum { ASN1_UNIVERSAL_STRING = 28U };

  enum { ASN1_BMP_STRING = 30U };

  enum { ASN1_HIGH_TAG_NUMBER = 31U };

  enum { ASN1_CONTEXT_SPECIFIC = 32U };

  enum { ASN1_APPLICATION = 33U };

  enum { ASN1_PRIVATE = 34U };

  /**
   *  "type" will be equal to one of the defined object identifiers.
   */
  /* attribute unsigned long type; */
  NS_SCRIPTABLE NS_IMETHOD GetType(PRUint32 *aType) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetType(PRUint32 aType) = 0;

  /**
   *  This contains a tag as explained in ASN.1 standards documents.
   */
  /* attribute unsigned long tag; */
  NS_SCRIPTABLE NS_IMETHOD GetTag(PRUint32 *aTag) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTag(PRUint32 aTag) = 0;

  /**
   *  "displayName" contains a human readable explanatory label.
   */
  /* attribute AString displayName; */
  NS_SCRIPTABLE NS_IMETHOD GetDisplayName(nsAString & aDisplayName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDisplayName(const nsAString & aDisplayName) = 0;

  /**
   *  "displayValue" contains the human readable value.
   */
  /* attribute AString displayValue; */
  NS_SCRIPTABLE NS_IMETHOD GetDisplayValue(nsAString & aDisplayValue) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDisplayValue(const nsAString & aDisplayValue) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIASN1Object, NS_IASN1OBJECT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIASN1OBJECT \
  NS_SCRIPTABLE NS_IMETHOD GetType(PRUint32 *aType); \
  NS_SCRIPTABLE NS_IMETHOD SetType(PRUint32 aType); \
  NS_SCRIPTABLE NS_IMETHOD GetTag(PRUint32 *aTag); \
  NS_SCRIPTABLE NS_IMETHOD SetTag(PRUint32 aTag); \
  NS_SCRIPTABLE NS_IMETHOD GetDisplayName(nsAString & aDisplayName); \
  NS_SCRIPTABLE NS_IMETHOD SetDisplayName(const nsAString & aDisplayName); \
  NS_SCRIPTABLE NS_IMETHOD GetDisplayValue(nsAString & aDisplayValue); \
  NS_SCRIPTABLE NS_IMETHOD SetDisplayValue(const nsAString & aDisplayValue); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIASN1OBJECT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(PRUint32 *aType) { return _to GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD SetType(PRUint32 aType) { return _to SetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetTag(PRUint32 *aTag) { return _to GetTag(aTag); } \
  NS_SCRIPTABLE NS_IMETHOD SetTag(PRUint32 aTag) { return _to SetTag(aTag); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisplayName(nsAString & aDisplayName) { return _to GetDisplayName(aDisplayName); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisplayName(const nsAString & aDisplayName) { return _to SetDisplayName(aDisplayName); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisplayValue(nsAString & aDisplayValue) { return _to GetDisplayValue(aDisplayValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisplayValue(const nsAString & aDisplayValue) { return _to SetDisplayValue(aDisplayValue); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIASN1OBJECT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(PRUint32 *aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD SetType(PRUint32 aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetTag(PRUint32 *aTag) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTag(aTag); } \
  NS_SCRIPTABLE NS_IMETHOD SetTag(PRUint32 aTag) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTag(aTag); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisplayName(nsAString & aDisplayName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDisplayName(aDisplayName); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisplayName(const nsAString & aDisplayName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDisplayName(aDisplayName); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisplayValue(nsAString & aDisplayValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDisplayValue(aDisplayValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisplayValue(const nsAString & aDisplayValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDisplayValue(aDisplayValue); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsASN1Object : public nsIASN1Object
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIASN1OBJECT

  nsASN1Object();

private:
  ~nsASN1Object();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsASN1Object, nsIASN1Object)

nsASN1Object::nsASN1Object()
{
  /* member initializers and constructor code */
}

nsASN1Object::~nsASN1Object()
{
  /* destructor code */
}

/* attribute unsigned long type; */
NS_IMETHODIMP nsASN1Object::GetType(PRUint32 *aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsASN1Object::SetType(PRUint32 aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute unsigned long tag; */
NS_IMETHODIMP nsASN1Object::GetTag(PRUint32 *aTag)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsASN1Object::SetTag(PRUint32 aTag)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString displayName; */
NS_IMETHODIMP nsASN1Object::GetDisplayName(nsAString & aDisplayName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsASN1Object::SetDisplayName(const nsAString & aDisplayName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString displayValue; */
NS_IMETHODIMP nsASN1Object::GetDisplayValue(nsAString & aDisplayValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsASN1Object::SetDisplayValue(const nsAString & aDisplayValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIASN1Object_h__ */
