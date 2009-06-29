/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/xpcom/ds/nsISupportsPrimitives.idl
 */

#ifndef __gen_nsISupportsPrimitives_h__
#define __gen_nsISupportsPrimitives_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsISupportsPrimitive */
#define NS_ISUPPORTSPRIMITIVE_IID_STR "d0d4b136-1dd1-11b2-9371-f0727ef827c0"

#define NS_ISUPPORTSPRIMITIVE_IID \
  {0xd0d4b136, 0x1dd1, 0x11b2, \
    { 0x93, 0x71, 0xf0, 0x72, 0x7e, 0xf8, 0x27, 0xc0 }}

/**
 * Primitive base interface.
 *
 * These first three are pointer types and do data copying
 * using the nsIMemory. Be careful!
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPrimitive : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRIMITIVE_IID)

  enum { TYPE_ID = 1U };

  enum { TYPE_CSTRING = 2U };

  enum { TYPE_STRING = 3U };

  enum { TYPE_PRBOOL = 4U };

  enum { TYPE_PRUINT8 = 5U };

  enum { TYPE_PRUINT16 = 6U };

  enum { TYPE_PRUINT32 = 7U };

  enum { TYPE_PRUINT64 = 8U };

  enum { TYPE_PRTIME = 9U };

  enum { TYPE_CHAR = 10U };

  enum { TYPE_PRINT16 = 11U };

  enum { TYPE_PRINT32 = 12U };

  enum { TYPE_PRINT64 = 13U };

  enum { TYPE_FLOAT = 14U };

  enum { TYPE_DOUBLE = 15U };

  enum { TYPE_VOID = 16U };

  enum { TYPE_INTERFACE_POINTER = 17U };

  /* readonly attribute unsigned short type; */
  NS_SCRIPTABLE NS_IMETHOD GetType(PRUint16 *aType) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPrimitive, NS_ISUPPORTSPRIMITIVE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRIMITIVE \
  NS_SCRIPTABLE NS_IMETHOD GetType(PRUint16 *aType); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRIMITIVE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(PRUint16 *aType) { return _to GetType(aType); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRIMITIVE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(PRUint16 *aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetType(aType); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPrimitive : public nsISupportsPrimitive
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRIMITIVE

  nsSupportsPrimitive();

private:
  ~nsSupportsPrimitive();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPrimitive, nsISupportsPrimitive)

nsSupportsPrimitive::nsSupportsPrimitive()
{
  /* member initializers and constructor code */
}

nsSupportsPrimitive::~nsSupportsPrimitive()
{
  /* destructor code */
}

/* readonly attribute unsigned short type; */
NS_IMETHODIMP nsSupportsPrimitive::GetType(PRUint16 *aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsID */
#define NS_ISUPPORTSID_IID_STR "d18290a0-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSID_IID \
  {0xd18290a0, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for nsID structures
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsID : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSID_IID)

  /* attribute nsIDPtr data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(nsID * *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsID * aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsID, NS_ISUPPORTSID_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSID \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsID * *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsID * aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSID(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsID * *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsID * aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSID(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsID * *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsID * aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsID : public nsISupportsID
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSID

  nsSupportsID();

private:
  ~nsSupportsID();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsID, nsISupportsID)

nsSupportsID::nsSupportsID()
{
  /* member initializers and constructor code */
}

nsSupportsID::~nsSupportsID()
{
  /* destructor code */
}

/* attribute nsIDPtr data; */
NS_IMETHODIMP nsSupportsID::GetData(nsID * *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsID::SetData(const nsID * aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsID::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsCString */
#define NS_ISUPPORTSCSTRING_IID_STR "d65ff270-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSCSTRING_IID \
  {0xd65ff270, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for ASCII strings
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsCString : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSCSTRING_IID)

  /* attribute ACString data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(nsACString & aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsACString & aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsCString, NS_ISUPPORTSCSTRING_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSCSTRING \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsACString & aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsACString & aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSCSTRING(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsACString & aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsACString & aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSCSTRING(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsACString & aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsACString & aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsCString : public nsISupportsCString
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSCSTRING

  nsSupportsCString();

private:
  ~nsSupportsCString();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsCString, nsISupportsCString)

nsSupportsCString::nsSupportsCString()
{
  /* member initializers and constructor code */
}

nsSupportsCString::~nsSupportsCString()
{
  /* destructor code */
}

/* attribute ACString data; */
NS_IMETHODIMP nsSupportsCString::GetData(nsACString & aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsCString::SetData(const nsACString & aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsCString::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsString */
#define NS_ISUPPORTSSTRING_IID_STR "d79dc970-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSSTRING_IID \
  {0xd79dc970, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for Unicode strings
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsString : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSSTRING_IID)

  /* attribute AString data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(nsAString & aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsAString & aData) = 0;

  /* wstring toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(PRUnichar **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsString, NS_ISUPPORTSSTRING_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSSTRING \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsAString & aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsAString & aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(PRUnichar **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSSTRING(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsAString & aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsAString & aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(PRUnichar **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSSTRING(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsAString & aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsAString & aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(PRUnichar **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsString : public nsISupportsString
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSSTRING

  nsSupportsString();

private:
  ~nsSupportsString();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsString, nsISupportsString)

nsSupportsString::nsSupportsString()
{
  /* member initializers and constructor code */
}

nsSupportsString::~nsSupportsString()
{
  /* destructor code */
}

/* attribute AString data; */
NS_IMETHODIMP nsSupportsString::GetData(nsAString & aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsString::SetData(const nsAString & aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* wstring toString (); */
NS_IMETHODIMP nsSupportsString::ToString(PRUnichar **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsPRBool */
#define NS_ISUPPORTSPRBOOL_IID_STR "ddc3b490-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSPRBOOL_IID \
  {0xddc3b490, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * The rest are truly primitive and are passed by value
 */
/**
 * Scriptable storage for booleans
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPRBool : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRBOOL_IID)

  /* attribute PRBool data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRBool *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(PRBool aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPRBool, NS_ISUPPORTSPRBOOL_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRBOOL \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRBool *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRBool aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRBOOL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRBool *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRBool aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRBOOL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRBool *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRBool aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPRBool : public nsISupportsPRBool
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRBOOL

  nsSupportsPRBool();

private:
  ~nsSupportsPRBool();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPRBool, nsISupportsPRBool)

nsSupportsPRBool::nsSupportsPRBool()
{
  /* member initializers and constructor code */
}

nsSupportsPRBool::~nsSupportsPRBool()
{
  /* destructor code */
}

/* attribute PRBool data; */
NS_IMETHODIMP nsSupportsPRBool::GetData(PRBool *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsPRBool::SetData(PRBool aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsPRBool::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsPRUint8 */
#define NS_ISUPPORTSPRUINT8_IID_STR "dec2e4e0-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSPRUINT8_IID \
  {0xdec2e4e0, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for 8-bit integers
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPRUint8 : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRUINT8_IID)

  /* attribute PRUint8 data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint8 *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint8 aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPRUint8, NS_ISUPPORTSPRUINT8_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRUINT8 \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint8 *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint8 aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRUINT8(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint8 *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint8 aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRUINT8(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint8 *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint8 aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPRUint8 : public nsISupportsPRUint8
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRUINT8

  nsSupportsPRUint8();

private:
  ~nsSupportsPRUint8();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPRUint8, nsISupportsPRUint8)

nsSupportsPRUint8::nsSupportsPRUint8()
{
  /* member initializers and constructor code */
}

nsSupportsPRUint8::~nsSupportsPRUint8()
{
  /* destructor code */
}

/* attribute PRUint8 data; */
NS_IMETHODIMP nsSupportsPRUint8::GetData(PRUint8 *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsPRUint8::SetData(PRUint8 aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsPRUint8::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsPRUint16 */
#define NS_ISUPPORTSPRUINT16_IID_STR "dfacb090-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSPRUINT16_IID \
  {0xdfacb090, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for unsigned 16-bit integers
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPRUint16 : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRUINT16_IID)

  /* attribute PRUint16 data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint16 *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint16 aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPRUint16, NS_ISUPPORTSPRUINT16_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRUINT16 \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint16 *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint16 aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRUINT16(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint16 *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint16 aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRUINT16(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint16 *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint16 aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPRUint16 : public nsISupportsPRUint16
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRUINT16

  nsSupportsPRUint16();

private:
  ~nsSupportsPRUint16();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPRUint16, nsISupportsPRUint16)

nsSupportsPRUint16::nsSupportsPRUint16()
{
  /* member initializers and constructor code */
}

nsSupportsPRUint16::~nsSupportsPRUint16()
{
  /* destructor code */
}

/* attribute PRUint16 data; */
NS_IMETHODIMP nsSupportsPRUint16::GetData(PRUint16 *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsPRUint16::SetData(PRUint16 aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsPRUint16::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsPRUint32 */
#define NS_ISUPPORTSPRUINT32_IID_STR "e01dc470-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSPRUINT32_IID \
  {0xe01dc470, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for unsigned 32-bit integers
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPRUint32 : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRUINT32_IID)

  /* attribute PRUint32 data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint32 *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint32 aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPRUint32, NS_ISUPPORTSPRUINT32_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRUINT32 \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint32 *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint32 aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRUINT32(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint32 *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint32 aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRUINT32(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint32 *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint32 aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPRUint32 : public nsISupportsPRUint32
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRUINT32

  nsSupportsPRUint32();

private:
  ~nsSupportsPRUint32();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPRUint32, nsISupportsPRUint32)

nsSupportsPRUint32::nsSupportsPRUint32()
{
  /* member initializers and constructor code */
}

nsSupportsPRUint32::~nsSupportsPRUint32()
{
  /* destructor code */
}

/* attribute PRUint32 data; */
NS_IMETHODIMP nsSupportsPRUint32::GetData(PRUint32 *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsPRUint32::SetData(PRUint32 aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsPRUint32::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsPRUint64 */
#define NS_ISUPPORTSPRUINT64_IID_STR "e13567c0-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSPRUINT64_IID \
  {0xe13567c0, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for 64-bit integers
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPRUint64 : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRUINT64_IID)

  /* attribute PRUint64 data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint64 *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint64 aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPRUint64, NS_ISUPPORTSPRUINT64_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRUINT64 \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint64 *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint64 aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRUINT64(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint64 *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint64 aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRUINT64(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRUint64 *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRUint64 aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPRUint64 : public nsISupportsPRUint64
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRUINT64

  nsSupportsPRUint64();

private:
  ~nsSupportsPRUint64();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPRUint64, nsISupportsPRUint64)

nsSupportsPRUint64::nsSupportsPRUint64()
{
  /* member initializers and constructor code */
}

nsSupportsPRUint64::~nsSupportsPRUint64()
{
  /* destructor code */
}

/* attribute PRUint64 data; */
NS_IMETHODIMP nsSupportsPRUint64::GetData(PRUint64 *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsPRUint64::SetData(PRUint64 aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsPRUint64::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsPRTime */
#define NS_ISUPPORTSPRTIME_IID_STR "e2563630-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSPRTIME_IID \
  {0xe2563630, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for NSPR date/time values
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPRTime : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRTIME_IID)

  /* attribute PRTime data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRTime *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(PRTime aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPRTime, NS_ISUPPORTSPRTIME_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRTIME \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRTime *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRTime aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRTIME(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRTime *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRTime aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRTIME(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRTime *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRTime aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPRTime : public nsISupportsPRTime
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRTIME

  nsSupportsPRTime();

private:
  ~nsSupportsPRTime();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPRTime, nsISupportsPRTime)

nsSupportsPRTime::nsSupportsPRTime()
{
  /* member initializers and constructor code */
}

nsSupportsPRTime::~nsSupportsPRTime()
{
  /* destructor code */
}

/* attribute PRTime data; */
NS_IMETHODIMP nsSupportsPRTime::GetData(PRTime *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsPRTime::SetData(PRTime aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsPRTime::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsChar */
#define NS_ISUPPORTSCHAR_IID_STR "e2b05e40-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSCHAR_IID \
  {0xe2b05e40, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for single character values
 * (often used to store an ASCII character)
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsChar : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSCHAR_IID)

  /* attribute char data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(char *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(char aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsChar, NS_ISUPPORTSCHAR_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSCHAR \
  NS_SCRIPTABLE NS_IMETHOD GetData(char *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(char aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSCHAR(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(char *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(char aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSCHAR(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(char *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(char aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsChar : public nsISupportsChar
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSCHAR

  nsSupportsChar();

private:
  ~nsSupportsChar();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsChar, nsISupportsChar)

nsSupportsChar::nsSupportsChar()
{
  /* member initializers and constructor code */
}

nsSupportsChar::~nsSupportsChar()
{
  /* destructor code */
}

/* attribute char data; */
NS_IMETHODIMP nsSupportsChar::GetData(char *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsChar::SetData(char aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsChar::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsPRInt16 */
#define NS_ISUPPORTSPRINT16_IID_STR "e30d94b0-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSPRINT16_IID \
  {0xe30d94b0, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for 16-bit integers
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPRInt16 : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRINT16_IID)

  /* attribute PRInt16 data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt16 *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt16 aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPRInt16, NS_ISUPPORTSPRINT16_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRINT16 \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt16 *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt16 aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRINT16(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt16 *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt16 aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRINT16(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt16 *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt16 aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPRInt16 : public nsISupportsPRInt16
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRINT16

  nsSupportsPRInt16();

private:
  ~nsSupportsPRInt16();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPRInt16, nsISupportsPRInt16)

nsSupportsPRInt16::nsSupportsPRInt16()
{
  /* member initializers and constructor code */
}

nsSupportsPRInt16::~nsSupportsPRInt16()
{
  /* destructor code */
}

/* attribute PRInt16 data; */
NS_IMETHODIMP nsSupportsPRInt16::GetData(PRInt16 *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsPRInt16::SetData(PRInt16 aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsPRInt16::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsPRInt32 */
#define NS_ISUPPORTSPRINT32_IID_STR "e36c5250-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSPRINT32_IID \
  {0xe36c5250, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for 32-bit integers
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPRInt32 : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRINT32_IID)

  /* attribute PRInt32 data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt32 *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt32 aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPRInt32, NS_ISUPPORTSPRINT32_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRINT32 \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt32 *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt32 aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRINT32(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt32 *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt32 aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRINT32(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt32 *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt32 aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPRInt32 : public nsISupportsPRInt32
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRINT32

  nsSupportsPRInt32();

private:
  ~nsSupportsPRInt32();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPRInt32, nsISupportsPRInt32)

nsSupportsPRInt32::nsSupportsPRInt32()
{
  /* member initializers and constructor code */
}

nsSupportsPRInt32::~nsSupportsPRInt32()
{
  /* destructor code */
}

/* attribute PRInt32 data; */
NS_IMETHODIMP nsSupportsPRInt32::GetData(PRInt32 *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsPRInt32::SetData(PRInt32 aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsPRInt32::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsPRInt64 */
#define NS_ISUPPORTSPRINT64_IID_STR "e3cb0ff0-4a1c-11d3-9890-006008962422"

#define NS_ISUPPORTSPRINT64_IID \
  {0xe3cb0ff0, 0x4a1c, 0x11d3, \
    { 0x98, 0x90, 0x00, 0x60, 0x08, 0x96, 0x24, 0x22 }}

/**
 * Scriptable storage for 64-bit integers
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsPRInt64 : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSPRINT64_IID)

  /* attribute PRInt64 data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt64 *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt64 aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsPRInt64, NS_ISUPPORTSPRINT64_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSPRINT64 \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt64 *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt64 aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSPRINT64(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt64 *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt64 aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSPRINT64(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(PRInt64 *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(PRInt64 aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsPRInt64 : public nsISupportsPRInt64
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSPRINT64

  nsSupportsPRInt64();

private:
  ~nsSupportsPRInt64();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsPRInt64, nsISupportsPRInt64)

nsSupportsPRInt64::nsSupportsPRInt64()
{
  /* member initializers and constructor code */
}

nsSupportsPRInt64::~nsSupportsPRInt64()
{
  /* destructor code */
}

/* attribute PRInt64 data; */
NS_IMETHODIMP nsSupportsPRInt64::GetData(PRInt64 *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsPRInt64::SetData(PRInt64 aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsPRInt64::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsFloat */
#define NS_ISUPPORTSFLOAT_IID_STR "abeaa390-4ac0-11d3-baea-00805f8a5dd7"

#define NS_ISUPPORTSFLOAT_IID \
  {0xabeaa390, 0x4ac0, 0x11d3, \
    { 0xba, 0xea, 0x00, 0x80, 0x5f, 0x8a, 0x5d, 0xd7 }}

/**
 * Scriptable storage for floating point numbers
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsFloat : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSFLOAT_IID)

  /* attribute float data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(float *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(float aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsFloat, NS_ISUPPORTSFLOAT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSFLOAT \
  NS_SCRIPTABLE NS_IMETHOD GetData(float *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(float aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSFLOAT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(float *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(float aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSFLOAT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(float *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(float aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsFloat : public nsISupportsFloat
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSFLOAT

  nsSupportsFloat();

private:
  ~nsSupportsFloat();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsFloat, nsISupportsFloat)

nsSupportsFloat::nsSupportsFloat()
{
  /* member initializers and constructor code */
}

nsSupportsFloat::~nsSupportsFloat()
{
  /* destructor code */
}

/* attribute float data; */
NS_IMETHODIMP nsSupportsFloat::GetData(float *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsFloat::SetData(float aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsFloat::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsDouble */
#define NS_ISUPPORTSDOUBLE_IID_STR "b32523a0-4ac0-11d3-baea-00805f8a5dd7"

#define NS_ISUPPORTSDOUBLE_IID \
  {0xb32523a0, 0x4ac0, 0x11d3, \
    { 0xba, 0xea, 0x00, 0x80, 0x5f, 0x8a, 0x5d, 0xd7 }}

/**
 * Scriptable storage for doubles
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsDouble : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSDOUBLE_IID)

  /* attribute double data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(double *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(double aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsDouble, NS_ISUPPORTSDOUBLE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSDOUBLE \
  NS_SCRIPTABLE NS_IMETHOD GetData(double *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(double aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSDOUBLE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(double *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(double aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSDOUBLE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(double *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(double aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsDouble : public nsISupportsDouble
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSDOUBLE

  nsSupportsDouble();

private:
  ~nsSupportsDouble();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsDouble, nsISupportsDouble)

nsSupportsDouble::nsSupportsDouble()
{
  /* member initializers and constructor code */
}

nsSupportsDouble::~nsSupportsDouble()
{
  /* destructor code */
}

/* attribute double data; */
NS_IMETHODIMP nsSupportsDouble::GetData(double *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsDouble::SetData(double aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsDouble::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsVoid */
#define NS_ISUPPORTSVOID_IID_STR "464484f0-568d-11d3-baf8-00805f8a5dd7"

#define NS_ISUPPORTSVOID_IID \
  {0x464484f0, 0x568d, 0x11d3, \
    { 0xba, 0xf8, 0x00, 0x80, 0x5f, 0x8a, 0x5d, 0xd7 }}

/**
 * Scriptable storage for generic pointers
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsVoid : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSVOID_IID)

  /* [noscript] attribute voidPtr data; */
  NS_IMETHOD GetData(void * *aData) = 0;
  NS_IMETHOD SetData(void * aData) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsVoid, NS_ISUPPORTSVOID_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSVOID \
  NS_IMETHOD GetData(void * *aData); \
  NS_IMETHOD SetData(void * aData); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSVOID(_to) \
  NS_IMETHOD GetData(void * *aData) { return _to GetData(aData); } \
  NS_IMETHOD SetData(void * aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSVOID(_to) \
  NS_IMETHOD GetData(void * *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_IMETHOD SetData(void * aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsVoid : public nsISupportsVoid
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSVOID

  nsSupportsVoid();

private:
  ~nsSupportsVoid();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsVoid, nsISupportsVoid)

nsSupportsVoid::nsSupportsVoid()
{
  /* member initializers and constructor code */
}

nsSupportsVoid::~nsSupportsVoid()
{
  /* destructor code */
}

/* [noscript] attribute voidPtr data; */
NS_IMETHODIMP nsSupportsVoid::GetData(void * *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsVoid::SetData(void * aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsVoid::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsInterfacePointer */
#define NS_ISUPPORTSINTERFACEPOINTER_IID_STR "995ea724-1dd1-11b2-9211-c21bdd3e7ed0"

#define NS_ISUPPORTSINTERFACEPOINTER_IID \
  {0x995ea724, 0x1dd1, 0x11b2, \
    { 0x92, 0x11, 0xc2, 0x1b, 0xdd, 0x3e, 0x7e, 0xd0 }}

/**
 * Scriptable storage for other XPCOM objects
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsInterfacePointer : public nsISupportsPrimitive {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSINTERFACEPOINTER_IID)

  /* attribute nsISupports data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(nsISupports * *aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(nsISupports * aData) = 0;

  /* attribute nsIDPtr dataIID; */
  NS_SCRIPTABLE NS_IMETHOD GetDataIID(nsID * *aDataIID) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDataIID(const nsID * aDataIID) = 0;

  /* string toString (); */
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsInterfacePointer, NS_ISUPPORTSINTERFACEPOINTER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSINTERFACEPOINTER \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsISupports * *aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(nsISupports * aData); \
  NS_SCRIPTABLE NS_IMETHOD GetDataIID(nsID * *aDataIID); \
  NS_SCRIPTABLE NS_IMETHOD SetDataIID(const nsID * aDataIID); \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSINTERFACEPOINTER(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsISupports * *aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(nsISupports * aData) { return _to SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD GetDataIID(nsID * *aDataIID) { return _to GetDataIID(aDataIID); } \
  NS_SCRIPTABLE NS_IMETHOD SetDataIID(const nsID * aDataIID) { return _to SetDataIID(aDataIID); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return _to ToString(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSINTERFACEPOINTER(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsISupports * *aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(nsISupports * aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD GetDataIID(nsID * *aDataIID) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDataIID(aDataIID); } \
  NS_SCRIPTABLE NS_IMETHOD SetDataIID(const nsID * aDataIID) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDataIID(aDataIID); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsInterfacePointer : public nsISupportsInterfacePointer
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSINTERFACEPOINTER

  nsSupportsInterfacePointer();

private:
  ~nsSupportsInterfacePointer();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsInterfacePointer, nsISupportsInterfacePointer)

nsSupportsInterfacePointer::nsSupportsInterfacePointer()
{
  /* member initializers and constructor code */
}

nsSupportsInterfacePointer::~nsSupportsInterfacePointer()
{
  /* destructor code */
}

/* attribute nsISupports data; */
NS_IMETHODIMP nsSupportsInterfacePointer::GetData(nsISupports * *aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsInterfacePointer::SetData(nsISupports * aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDPtr dataIID; */
NS_IMETHODIMP nsSupportsInterfacePointer::GetDataIID(nsID * *aDataIID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSupportsInterfacePointer::SetDataIID(const nsID * aDataIID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string toString (); */
NS_IMETHODIMP nsSupportsInterfacePointer::ToString(char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsISupportsPrimitives_h__ */
