/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM e:/xr19rel/WINNT_5.2_Depend/mozilla/xpcom/components/nsIClassInfo.idl
 */

#ifndef __gen_nsIClassInfo_h__
#define __gen_nsIClassInfo_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIClassInfo */
#define NS_ICLASSINFO_IID_STR "986c11d0-f340-11d4-9075-0010a4e73d9a"

#define NS_ICLASSINFO_IID \
  {0x986c11d0, 0xf340, 0x11d4, \
    { 0x90, 0x75, 0x00, 0x10, 0xa4, 0xe7, 0x3d, 0x9a }}

/**
 * Provides information about a specific implementation class
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIClassInfo : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ICLASSINFO_IID)

  /**
     * Get an ordered list of the interface ids that instances of the class 
     * promise to implement. Note that nsISupports is an implicit member 
     * of any such list and need not be included. 
     *
     * Should set *count = 0 and *array = null and return NS_OK if getting the 
     * list is not supported.
     */
  /* void getInterfaces (out PRUint32 count, [array, size_is (count), retval] out nsIIDPtr array); */
  NS_SCRIPTABLE NS_IMETHOD GetInterfaces(PRUint32 *count, nsIID * **array) = 0;

  /**
     * Get a language mapping specific helper object that may assist in using
     * objects of this class in a specific lanaguage. For instance, if asked
     * for the helper for nsIProgrammingLanguage::JAVASCRIPT this might return 
     * an object that can be QI'd into the nsIXPCScriptable interface to assist 
     * XPConnect in supplying JavaScript specific behavior to callers of the 
     * instance object.
     *
     * see: nsIProgrammingLanguage.idl
     *
     * Should return null if no helper available for given language.
     */
  /* nsISupports getHelperForLanguage (in PRUint32 language); */
  NS_SCRIPTABLE NS_IMETHOD GetHelperForLanguage(PRUint32 language, nsISupports **_retval) = 0;

  /**
     * A contract ID through which an instance of this class can be created
     * (or accessed as a service, if |flags & SINGLETON|), or null.
     */
  /* readonly attribute string contractID; */
  NS_SCRIPTABLE NS_IMETHOD GetContractID(char * *aContractID) = 0;

  /**
     * A human readable string naming the class, or null.
     */
  /* readonly attribute string classDescription; */
  NS_SCRIPTABLE NS_IMETHOD GetClassDescription(char * *aClassDescription) = 0;

  /**
     * A class ID through which an instance of this class can be created
     * (or accessed as a service, if |flags & SINGLETON|), or null.
     */
  /* readonly attribute nsCIDPtr classID; */
  NS_SCRIPTABLE NS_IMETHOD GetClassID(nsCID * *aClassID) = 0;

  /**
     * Return language type from list in nsIProgrammingLanguage
     */
  /* readonly attribute PRUint32 implementationLanguage; */
  NS_SCRIPTABLE NS_IMETHOD GetImplementationLanguage(PRUint32 *aImplementationLanguage) = 0;

  /**
     * Bitflags for 'flags' attribute.
     */
  enum { SINGLETON = 1U };

  enum { THREADSAFE = 2U };

  enum { MAIN_THREAD_ONLY = 4U };

  enum { DOM_OBJECT = 8U };

  enum { PLUGIN_OBJECT = 16U };

  enum { EAGER_CLASSINFO = 32U };

  /**
     * 'flags' attribute bitflag: whether objects of this type implement
     * nsIContent.
     */
  enum { CONTENT_NODE = 64U };

  enum { RESERVED = 2147483648U };

  /* readonly attribute PRUint32 flags; */
  NS_SCRIPTABLE NS_IMETHOD GetFlags(PRUint32 *aFlags) = 0;

  /**
     * Also a class ID through which an instance of this class can be created
     * (or accessed as a service, if |flags & SINGLETON|).  If the class does
     * not have a CID, it should return NS_ERROR_NOT_AVAILABLE.  This attribute
     * exists so C++ callers can avoid allocating and freeing a CID, as would
     * happen if they used classID.
     */
  /* [notxpcom] readonly attribute nsCID classIDNoAlloc; */
  NS_IMETHOD GetClassIDNoAlloc(nsCID *aClassIDNoAlloc) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIClassInfo, NS_ICLASSINFO_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSICLASSINFO \
  NS_SCRIPTABLE NS_IMETHOD GetInterfaces(PRUint32 *count, nsIID * **array); \
  NS_SCRIPTABLE NS_IMETHOD GetHelperForLanguage(PRUint32 language, nsISupports **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetContractID(char * *aContractID); \
  NS_SCRIPTABLE NS_IMETHOD GetClassDescription(char * *aClassDescription); \
  NS_SCRIPTABLE NS_IMETHOD GetClassID(nsCID * *aClassID); \
  NS_SCRIPTABLE NS_IMETHOD GetImplementationLanguage(PRUint32 *aImplementationLanguage); \
  NS_SCRIPTABLE NS_IMETHOD GetFlags(PRUint32 *aFlags); \
  NS_IMETHOD GetClassIDNoAlloc(nsCID *aClassIDNoAlloc); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSICLASSINFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetInterfaces(PRUint32 *count, nsIID * **array) { return _to GetInterfaces(count, array); } \
  NS_SCRIPTABLE NS_IMETHOD GetHelperForLanguage(PRUint32 language, nsISupports **_retval) { return _to GetHelperForLanguage(language, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetContractID(char * *aContractID) { return _to GetContractID(aContractID); } \
  NS_SCRIPTABLE NS_IMETHOD GetClassDescription(char * *aClassDescription) { return _to GetClassDescription(aClassDescription); } \
  NS_SCRIPTABLE NS_IMETHOD GetClassID(nsCID * *aClassID) { return _to GetClassID(aClassID); } \
  NS_SCRIPTABLE NS_IMETHOD GetImplementationLanguage(PRUint32 *aImplementationLanguage) { return _to GetImplementationLanguage(aImplementationLanguage); } \
  NS_SCRIPTABLE NS_IMETHOD GetFlags(PRUint32 *aFlags) { return _to GetFlags(aFlags); } \
  NS_IMETHOD GetClassIDNoAlloc(nsCID *aClassIDNoAlloc) { return _to GetClassIDNoAlloc(aClassIDNoAlloc); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSICLASSINFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetInterfaces(PRUint32 *count, nsIID * **array) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetInterfaces(count, array); } \
  NS_SCRIPTABLE NS_IMETHOD GetHelperForLanguage(PRUint32 language, nsISupports **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHelperForLanguage(language, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetContractID(char * *aContractID) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetContractID(aContractID); } \
  NS_SCRIPTABLE NS_IMETHOD GetClassDescription(char * *aClassDescription) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClassDescription(aClassDescription); } \
  NS_SCRIPTABLE NS_IMETHOD GetClassID(nsCID * *aClassID) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClassID(aClassID); } \
  NS_SCRIPTABLE NS_IMETHOD GetImplementationLanguage(PRUint32 *aImplementationLanguage) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetImplementationLanguage(aImplementationLanguage); } \
  NS_SCRIPTABLE NS_IMETHOD GetFlags(PRUint32 *aFlags) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFlags(aFlags); } \
  NS_IMETHOD GetClassIDNoAlloc(nsCID *aClassIDNoAlloc) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClassIDNoAlloc(aClassIDNoAlloc); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsClassInfo : public nsIClassInfo
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSICLASSINFO

  nsClassInfo();

private:
  ~nsClassInfo();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsClassInfo, nsIClassInfo)

nsClassInfo::nsClassInfo()
{
  /* member initializers and constructor code */
}

nsClassInfo::~nsClassInfo()
{
  /* destructor code */
}

/* void getInterfaces (out PRUint32 count, [array, size_is (count), retval] out nsIIDPtr array); */
NS_IMETHODIMP nsClassInfo::GetInterfaces(PRUint32 *count, nsIID * **array)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsISupports getHelperForLanguage (in PRUint32 language); */
NS_IMETHODIMP nsClassInfo::GetHelperForLanguage(PRUint32 language, nsISupports **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute string contractID; */
NS_IMETHODIMP nsClassInfo::GetContractID(char * *aContractID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute string classDescription; */
NS_IMETHODIMP nsClassInfo::GetClassDescription(char * *aClassDescription)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsCIDPtr classID; */
NS_IMETHODIMP nsClassInfo::GetClassID(nsCID * *aClassID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute PRUint32 implementationLanguage; */
NS_IMETHODIMP nsClassInfo::GetImplementationLanguage(PRUint32 *aImplementationLanguage)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute PRUint32 flags; */
NS_IMETHODIMP nsClassInfo::GetFlags(PRUint32 *aFlags)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [notxpcom] readonly attribute nsCID classIDNoAlloc; */
NS_IMETHODIMP nsClassInfo::GetClassIDNoAlloc(nsCID *aClassIDNoAlloc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIClassInfo_h__ */
