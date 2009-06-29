/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/json/nsIJSON.idl
 */

#ifndef __gen_nsIJSON_h__
#define __gen_nsIJSON_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIInputStream; /* forward declaration */

class nsIOutputStream; /* forward declaration */

class nsIScriptGlobalObject; /* forward declaration */


/* starting interface:    nsIJSON */
#define NS_IJSON_IID_STR "45464c36-efde-4cb5-8e00-07480533ff35"

#define NS_IJSON_IID \
  {0x45464c36, 0xefde, 0x4cb5, \
    { 0x8e, 0x00, 0x07, 0x48, 0x05, 0x33, 0xff, 0x35 }}

/**
 * Encode and decode JSON text.
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIJSON : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IJSON_IID)

  /* AString encode (); */
  NS_SCRIPTABLE NS_IMETHOD Encode(nsAString & _retval) = 0;

  /* void encodeToStream (in nsIOutputStream stream, in string charset, in boolean writeBOM); */
  NS_SCRIPTABLE NS_IMETHOD EncodeToStream(nsIOutputStream *stream, const char *charset, PRBool writeBOM) = 0;

  /* void decode (in AString str); */
  NS_SCRIPTABLE NS_IMETHOD Decode(const nsAString & str) = 0;

  /* void decodeFromStream (in nsIInputStream stream, in long contentLength); */
  NS_SCRIPTABLE NS_IMETHOD DecodeFromStream(nsIInputStream *stream, PRInt32 contentLength) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIJSON, NS_IJSON_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIJSON \
  NS_SCRIPTABLE NS_IMETHOD Encode(nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD EncodeToStream(nsIOutputStream *stream, const char *charset, PRBool writeBOM); \
  NS_SCRIPTABLE NS_IMETHOD Decode(const nsAString & str); \
  NS_SCRIPTABLE NS_IMETHOD DecodeFromStream(nsIInputStream *stream, PRInt32 contentLength); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIJSON(_to) \
  NS_SCRIPTABLE NS_IMETHOD Encode(nsAString & _retval) { return _to Encode(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD EncodeToStream(nsIOutputStream *stream, const char *charset, PRBool writeBOM) { return _to EncodeToStream(stream, charset, writeBOM); } \
  NS_SCRIPTABLE NS_IMETHOD Decode(const nsAString & str) { return _to Decode(str); } \
  NS_SCRIPTABLE NS_IMETHOD DecodeFromStream(nsIInputStream *stream, PRInt32 contentLength) { return _to DecodeFromStream(stream, contentLength); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIJSON(_to) \
  NS_SCRIPTABLE NS_IMETHOD Encode(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Encode(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD EncodeToStream(nsIOutputStream *stream, const char *charset, PRBool writeBOM) { return !_to ? NS_ERROR_NULL_POINTER : _to->EncodeToStream(stream, charset, writeBOM); } \
  NS_SCRIPTABLE NS_IMETHOD Decode(const nsAString & str) { return !_to ? NS_ERROR_NULL_POINTER : _to->Decode(str); } \
  NS_SCRIPTABLE NS_IMETHOD DecodeFromStream(nsIInputStream *stream, PRInt32 contentLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->DecodeFromStream(stream, contentLength); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsJSON : public nsIJSON
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIJSON

  nsJSON();

private:
  ~nsJSON();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsJSON, nsIJSON)

nsJSON::nsJSON()
{
  /* member initializers and constructor code */
}

nsJSON::~nsJSON()
{
  /* destructor code */
}

/* AString encode (); */
NS_IMETHODIMP nsJSON::Encode(nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void encodeToStream (in nsIOutputStream stream, in string charset, in boolean writeBOM); */
NS_IMETHODIMP nsJSON::EncodeToStream(nsIOutputStream *stream, const char *charset, PRBool writeBOM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void decode (in AString str); */
NS_IMETHODIMP nsJSON::Decode(const nsAString & str)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void decodeFromStream (in nsIInputStream stream, in long contentLength); */
NS_IMETHODIMP nsJSON::DecodeFromStream(nsIInputStream *stream, PRInt32 contentLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIJSON_h__ */
