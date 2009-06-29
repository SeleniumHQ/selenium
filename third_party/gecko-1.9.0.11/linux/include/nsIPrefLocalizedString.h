/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/modules/libpref/public/nsIPrefLocalizedString.idl
 */

#ifndef __gen_nsIPrefLocalizedString_h__
#define __gen_nsIPrefLocalizedString_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIPrefLocalizedString */
#define NS_IPREFLOCALIZEDSTRING_IID_STR "ae419e24-1dd1-11b2-b39a-d3e5e7073802"

#define NS_IPREFLOCALIZEDSTRING_IID \
  {0xae419e24, 0x1dd1, 0x11b2, \
    { 0xb3, 0x9a, 0xd3, 0xe5, 0xe7, 0x07, 0x38, 0x02 }}

/**
 * The nsIPrefLocalizedString interface is simply a wrapper interface for
 * nsISupportsString so the preferences service can have a unique identifier
 * to distinguish between requests for normal wide strings (nsISupportsString)
 * and "localized" wide strings, which get their default values from properites
 * files.
 *
 * @see nsIPrefBranch
 * @see nsISupportsString
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIPrefLocalizedString : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IPREFLOCALIZEDSTRING_IID)

  /**
   * Provides access to string data stored in this property.
   *
   * @return NS_OK The operation succeeded.
   * @return Other An error occured.
   */
  /* attribute wstring data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUnichar * *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(const PRUnichar * aData) = 0;

  /**
   * Used to retrieve the contents of this object into a wide string.
   *
   * @return wstring The string containing the data stored within this object.
   */
  /* wstring toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(PRUnichar **_retval) = 0;

  /**
   * Used to set the contents of this object.
   *
   * @param length The length of the string. This value should not include
   *               space for the null terminator, nor should it account for the
   *               size of a character. It should  only be the number of
   *               characters for which there is space in the string.
   * @param data   The string data to be stored.
   *
   * @note
   * This makes a copy of the string argument passed in.
   *
   * @return NS_OK The data was successfully stored.
   */
  /* void setDataWithLength (in unsigned long length, [size_is (length)] in wstring data); */
  NS_SCRIPTABLE NS_IMETHOD SetDataWithLength(PRUint32 length, const PRUnichar *data) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIPrefLocalizedString, NS_IPREFLOCALIZEDSTRING_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIPREFLOCALIZEDSTRING \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUnichar * *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(const PRUnichar * aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(PRUnichar **_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetDataWithLength(PRUint32 length, const PRUnichar *data); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIPREFLOCALIZEDSTRING(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUnichar * *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const PRUnichar * aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(PRUnichar **_retval) { return _to ToString(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetDataWithLength(PRUint32 length, const PRUnichar *data) { return _to SetDataWithLength(length, data); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIPREFLOCALIZEDSTRING(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUnichar * *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const PRUnichar * aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(PRUnichar **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetDataWithLength(PRUint32 length, const PRUnichar *data) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDataWithLength(length, data); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsPrefLocalizedString : public nsIPrefLocalizedString
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPREFLOCALIZEDSTRING

  nsPrefLocalizedString();

private:
  ~nsPrefLocalizedString();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsPrefLocalizedString, nsIPrefLocalizedString)

nsPrefLocalizedString::nsPrefLocalizedString()
{
  /* member initializers and constructor code */
}

nsPrefLocalizedString::~nsPrefLocalizedString()
{
  /* destructor code */
}

/* attribute wstring data; */
NS_IMETHODIMP nsPrefLocalizedString::GetData(PRUnichar * *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsPrefLocalizedString::SetData(const PRUnichar * aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* wstring toString (); */
NS_IMETHODIMP nsPrefLocalizedString::ToString(PRUnichar **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setDataWithLength (in unsigned long length, [size_is (length)] in wstring data); */
NS_IMETHODIMP nsPrefLocalizedString::SetDataWithLength(PRUint32 length, const PRUnichar *data)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

#define NS_PREFLOCALIZEDSTRING_CID                     \
  { /* {064d9cee-1dd2-11b2-83e3-d25ab0193c26} */       \
    0x064d9cee,                                        \
    0x1dd2,                                            \
    0x11b2,                                            \
    { 0x83, 0xe3, 0xd2, 0x5a, 0xb0, 0x19, 0x3c, 0x26 } \
  }
#define NS_PREFLOCALIZEDSTRING_CONTRACTID "@mozilla.org/pref-localizedstring;1"
#define NS_PREFLOCALIZEDSTRING_CLASSNAME "Pref LocalizedString"

#endif /* __gen_nsIPrefLocalizedString_h__ */
