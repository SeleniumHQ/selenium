/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/xpcom/components/nsIComponentRegistrar.idl
 */

#ifndef __gen_nsIComponentRegistrar_h__
#define __gen_nsIComponentRegistrar_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIFile; /* forward declaration */

class nsIFactory; /* forward declaration */

class nsISimpleEnumerator; /* forward declaration */


/* starting interface:    nsIComponentRegistrar */
#define NS_ICOMPONENTREGISTRAR_IID_STR "2417cbfe-65ad-48a6-b4b6-eb84db174392"

#define NS_ICOMPONENTREGISTRAR_IID \
  {0x2417cbfe, 0x65ad, 0x48a6, \
    { 0xb4, 0xb6, 0xeb, 0x84, 0xdb, 0x17, 0x43, 0x92 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIComponentRegistrar : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ICOMPONENTREGISTRAR_IID)

  /**
     * autoRegister
     *
     * Register a component file or all component files in a directory.  
     *
     * Component files must have an associated loader and export the required
     * symbols which this loader defines.  For example, if the given file is a
     * native library (which is built into XPCOM), it must export the symbol 
     * "NSGetModule".  Other loaders may have different semantics.
     *
     * This method may only be called from the main thread.
     * 
     * @param aSpec    : Filename spec for component file's location. If aSpec 
     *                   is a directory, then every component file in the
     *                   directory will be registered. 
     *                   If aSpec is null, static components, GRE components,
     *                   and the application's component directories will be
     *                   registered. See NS_GRE_DIR, NS_XPCOM_COMPONENT_DIR,
     *                   and NS_XPCOM_COMPONENT_DIR_LIST in
     *                   nsDirectoryServiceDefs.h.
     */
  /* void autoRegister (in nsIFile aSpec); */
  NS_SCRIPTABLE NS_IMETHOD AutoRegister(nsIFile *aSpec) = 0;

  /**
     * autoUnregister
     *
     * Unregister a component file or all component files in a directory.  
     * This method may only be called from the main thread.
     *
     * @param aSpec    : Filename spec for component file's location. If aSpec 
     *                   is a directory, the every component file in the directory 
     *                   will be registered.  
     *                   If aSpec is null, then the application component's 
     *                   directory as defined by NS_XPCOM_COMPONENT_DIR will be 
     *                   registered. (see nsIDirectoryService.idl)
     *
     * @return NS_OK     Unregistration was successful.
     *         NS_ERROR* Method failure.
     */
  /* void autoUnregister (in nsIFile aSpec); */
  NS_SCRIPTABLE NS_IMETHOD AutoUnregister(nsIFile *aSpec) = 0;

  /**
     * registerFactory
     *
     * Register a factory with a given ContractID, CID and Class Name.
     *
     * @param aClass      : CID of object
     * @param aClassName  : Class Name of CID
     * @param aContractID : ContractID associated with CID aClass
     * @param aFactory    : Factory that will be registered for CID aClass
     *
     * @return NS_OK        Registration was successful.
     *         NS_ERROR*    method failure.
     */
  /* void registerFactory (in nsCIDRef aClass, in string aClassName, in string aContractID, in nsIFactory aFactory); */
  NS_SCRIPTABLE NS_IMETHOD RegisterFactory(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFactory *aFactory) = 0;

  /**
     * unregisterFactory
     *
     * Unregister a factory associated with CID aClass.
     *
     * @param aClass   : CID being unregistered
     * @param aFactory : Factory previously registered to create instances of
     *                   CID aClass.
     *
     * @return NS_OK     Unregistration was successful.
     *         NS_ERROR* Method failure.
     */
  /* void unregisterFactory (in nsCIDRef aClass, in nsIFactory aFactory); */
  NS_SCRIPTABLE NS_IMETHOD UnregisterFactory(const nsCID & aClass, nsIFactory *aFactory) = 0;

  /**
     * registerFactoryLocation
     *
     * Register a factory with a given ContractID, CID and Class Name
     *
     * @param aClass      : CID of object
     * @param aClassName  : Class Name of CID
     * @param aContractID : ContractID associated with CID aClass
     * @param aFile       : Component File. This file must have an associated 
     *                      loader and export the required symbols which this 
     *                      loader specifies.
     * @param aLoaderStr  : Opaque loader specific string.  This value is
     *                      passed into the nsIModule's registerSelf
     *                      callback and must be fowarded unmodified when
     *                      registering factories via their location.
     * @param aType       : Component Type of CID aClass.  This value is
     *                      passed into the nsIModule's registerSelf
     *                      callback and must be fowarded unmodified when
     *                      registering factories via their location.
     *
     * @return NS_OK        Registration was successful.
     *         NS_ERROR*    Method failure.
     */
  /* void registerFactoryLocation (in nsCIDRef aClass, in string aClassName, in string aContractID, in nsIFile aFile, in string aLoaderStr, in string aType); */
  NS_SCRIPTABLE NS_IMETHOD RegisterFactoryLocation(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFile *aFile, const char *aLoaderStr, const char *aType) = 0;

  /**
     * unregisterFactoryLocation
     *
     * Unregister a factory associated with CID aClass.
     *
     * @param aClass   : CID being unregistered
     * @param aFile    : Component File previously registered
     *
     * @return NS_OK     Unregistration was successful.
     *         NS_ERROR* Method failure.
     */
  /* void unregisterFactoryLocation (in nsCIDRef aClass, in nsIFile aFile); */
  NS_SCRIPTABLE NS_IMETHOD UnregisterFactoryLocation(const nsCID & aClass, nsIFile *aFile) = 0;

  /**
     * isCIDRegistered
     *
     * Returns true if a factory is registered for the CID.
     *
     * @param aClass : CID queried for registeration
     * @return       : true if a factory is registered for CID 
     *                 false otherwise.
     */
  /* boolean isCIDRegistered (in nsCIDRef aClass); */
  NS_SCRIPTABLE NS_IMETHOD IsCIDRegistered(const nsCID & aClass, PRBool *_retval) = 0;

  /**
     * isContractIDRegistered
     *
     * Returns true if a factory is registered for the contract id.
     *
     * @param aClass : contract id queried for registeration
     * @return       : true if a factory is registered for contract id 
     *                 false otherwise.
     */
  /* boolean isContractIDRegistered (in string aContractID); */
  NS_SCRIPTABLE NS_IMETHOD IsContractIDRegistered(const char *aContractID, PRBool *_retval) = 0;

  /**
     * enumerateCIDs
     *
     * Enumerate the list of all registered CIDs.
     *
     * @return : enumerator for CIDs.  Elements of the enumeration can be QI'ed
     *           for the nsISupportsID interface.  From the nsISupportsID, you 
     *           can obtain the actual CID.
     */
  /* nsISimpleEnumerator enumerateCIDs (); */
  NS_SCRIPTABLE NS_IMETHOD EnumerateCIDs(nsISimpleEnumerator **_retval) = 0;

  /**
     * enumerateContractIDs
     *
     * Enumerate the list of all registered ContractIDs.
     *
     * @return : enumerator for ContractIDs. Elements of the enumeration can be 
     *           QI'ed for the nsISupportsCString interface.  From  the
     *           nsISupportsCString interface, you can obtain the actual 
     *           Contract ID string.
     */
  /* nsISimpleEnumerator enumerateContractIDs (); */
  NS_SCRIPTABLE NS_IMETHOD EnumerateContractIDs(nsISimpleEnumerator **_retval) = 0;

  /**
     * CIDToContractID
     *
     * Returns the Contract ID for a given CID, if one exists and is registered.
     *
     * @return : Contract ID.
     */
  /* string CIDToContractID (in nsCIDRef aClass); */
  NS_SCRIPTABLE NS_IMETHOD CIDToContractID(const nsCID & aClass, char **_retval) = 0;

  /**
     * contractIDToCID
     *
     * Returns the CID for a given Contract ID, if one exists and is registered.
     *
     * @return : Contract ID.
     */
  /* nsCIDPtr contractIDToCID (in string aContractID); */
  NS_SCRIPTABLE NS_IMETHOD ContractIDToCID(const char *aContractID, nsCID * *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIComponentRegistrar, NS_ICOMPONENTREGISTRAR_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSICOMPONENTREGISTRAR \
  NS_SCRIPTABLE NS_IMETHOD AutoRegister(nsIFile *aSpec); \
  NS_SCRIPTABLE NS_IMETHOD AutoUnregister(nsIFile *aSpec); \
  NS_SCRIPTABLE NS_IMETHOD RegisterFactory(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFactory *aFactory); \
  NS_SCRIPTABLE NS_IMETHOD UnregisterFactory(const nsCID & aClass, nsIFactory *aFactory); \
  NS_SCRIPTABLE NS_IMETHOD RegisterFactoryLocation(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFile *aFile, const char *aLoaderStr, const char *aType); \
  NS_SCRIPTABLE NS_IMETHOD UnregisterFactoryLocation(const nsCID & aClass, nsIFile *aFile); \
  NS_SCRIPTABLE NS_IMETHOD IsCIDRegistered(const nsCID & aClass, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsContractIDRegistered(const char *aContractID, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD EnumerateCIDs(nsISimpleEnumerator **_retval); \
  NS_SCRIPTABLE NS_IMETHOD EnumerateContractIDs(nsISimpleEnumerator **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CIDToContractID(const nsCID & aClass, char **_retval); \
  NS_SCRIPTABLE NS_IMETHOD ContractIDToCID(const char *aContractID, nsCID * *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSICOMPONENTREGISTRAR(_to) \
  NS_SCRIPTABLE NS_IMETHOD AutoRegister(nsIFile *aSpec) { return _to AutoRegister(aSpec); } \
  NS_SCRIPTABLE NS_IMETHOD AutoUnregister(nsIFile *aSpec) { return _to AutoUnregister(aSpec); } \
  NS_SCRIPTABLE NS_IMETHOD RegisterFactory(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFactory *aFactory) { return _to RegisterFactory(aClass, aClassName, aContractID, aFactory); } \
  NS_SCRIPTABLE NS_IMETHOD UnregisterFactory(const nsCID & aClass, nsIFactory *aFactory) { return _to UnregisterFactory(aClass, aFactory); } \
  NS_SCRIPTABLE NS_IMETHOD RegisterFactoryLocation(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFile *aFile, const char *aLoaderStr, const char *aType) { return _to RegisterFactoryLocation(aClass, aClassName, aContractID, aFile, aLoaderStr, aType); } \
  NS_SCRIPTABLE NS_IMETHOD UnregisterFactoryLocation(const nsCID & aClass, nsIFile *aFile) { return _to UnregisterFactoryLocation(aClass, aFile); } \
  NS_SCRIPTABLE NS_IMETHOD IsCIDRegistered(const nsCID & aClass, PRBool *_retval) { return _to IsCIDRegistered(aClass, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsContractIDRegistered(const char *aContractID, PRBool *_retval) { return _to IsContractIDRegistered(aContractID, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD EnumerateCIDs(nsISimpleEnumerator **_retval) { return _to EnumerateCIDs(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD EnumerateContractIDs(nsISimpleEnumerator **_retval) { return _to EnumerateContractIDs(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CIDToContractID(const nsCID & aClass, char **_retval) { return _to CIDToContractID(aClass, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ContractIDToCID(const char *aContractID, nsCID * *_retval) { return _to ContractIDToCID(aContractID, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSICOMPONENTREGISTRAR(_to) \
  NS_SCRIPTABLE NS_IMETHOD AutoRegister(nsIFile *aSpec) { return !_to ? NS_ERROR_NULL_POINTER : _to->AutoRegister(aSpec); } \
  NS_SCRIPTABLE NS_IMETHOD AutoUnregister(nsIFile *aSpec) { return !_to ? NS_ERROR_NULL_POINTER : _to->AutoUnregister(aSpec); } \
  NS_SCRIPTABLE NS_IMETHOD RegisterFactory(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFactory *aFactory) { return !_to ? NS_ERROR_NULL_POINTER : _to->RegisterFactory(aClass, aClassName, aContractID, aFactory); } \
  NS_SCRIPTABLE NS_IMETHOD UnregisterFactory(const nsCID & aClass, nsIFactory *aFactory) { return !_to ? NS_ERROR_NULL_POINTER : _to->UnregisterFactory(aClass, aFactory); } \
  NS_SCRIPTABLE NS_IMETHOD RegisterFactoryLocation(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFile *aFile, const char *aLoaderStr, const char *aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->RegisterFactoryLocation(aClass, aClassName, aContractID, aFile, aLoaderStr, aType); } \
  NS_SCRIPTABLE NS_IMETHOD UnregisterFactoryLocation(const nsCID & aClass, nsIFile *aFile) { return !_to ? NS_ERROR_NULL_POINTER : _to->UnregisterFactoryLocation(aClass, aFile); } \
  NS_SCRIPTABLE NS_IMETHOD IsCIDRegistered(const nsCID & aClass, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsCIDRegistered(aClass, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsContractIDRegistered(const char *aContractID, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsContractIDRegistered(aContractID, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD EnumerateCIDs(nsISimpleEnumerator **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->EnumerateCIDs(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD EnumerateContractIDs(nsISimpleEnumerator **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->EnumerateContractIDs(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CIDToContractID(const nsCID & aClass, char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CIDToContractID(aClass, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ContractIDToCID(const char *aContractID, nsCID * *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ContractIDToCID(aContractID, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsComponentRegistrar : public nsIComponentRegistrar
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSICOMPONENTREGISTRAR

  nsComponentRegistrar();

private:
  ~nsComponentRegistrar();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsComponentRegistrar, nsIComponentRegistrar)

nsComponentRegistrar::nsComponentRegistrar()
{
  /* member initializers and constructor code */
}

nsComponentRegistrar::~nsComponentRegistrar()
{
  /* destructor code */
}

/* void autoRegister (in nsIFile aSpec); */
NS_IMETHODIMP nsComponentRegistrar::AutoRegister(nsIFile *aSpec)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void autoUnregister (in nsIFile aSpec); */
NS_IMETHODIMP nsComponentRegistrar::AutoUnregister(nsIFile *aSpec)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void registerFactory (in nsCIDRef aClass, in string aClassName, in string aContractID, in nsIFactory aFactory); */
NS_IMETHODIMP nsComponentRegistrar::RegisterFactory(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFactory *aFactory)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void unregisterFactory (in nsCIDRef aClass, in nsIFactory aFactory); */
NS_IMETHODIMP nsComponentRegistrar::UnregisterFactory(const nsCID & aClass, nsIFactory *aFactory)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void registerFactoryLocation (in nsCIDRef aClass, in string aClassName, in string aContractID, in nsIFile aFile, in string aLoaderStr, in string aType); */
NS_IMETHODIMP nsComponentRegistrar::RegisterFactoryLocation(const nsCID & aClass, const char *aClassName, const char *aContractID, nsIFile *aFile, const char *aLoaderStr, const char *aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void unregisterFactoryLocation (in nsCIDRef aClass, in nsIFile aFile); */
NS_IMETHODIMP nsComponentRegistrar::UnregisterFactoryLocation(const nsCID & aClass, nsIFile *aFile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isCIDRegistered (in nsCIDRef aClass); */
NS_IMETHODIMP nsComponentRegistrar::IsCIDRegistered(const nsCID & aClass, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isContractIDRegistered (in string aContractID); */
NS_IMETHODIMP nsComponentRegistrar::IsContractIDRegistered(const char *aContractID, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsISimpleEnumerator enumerateCIDs (); */
NS_IMETHODIMP nsComponentRegistrar::EnumerateCIDs(nsISimpleEnumerator **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsISimpleEnumerator enumerateContractIDs (); */
NS_IMETHODIMP nsComponentRegistrar::EnumerateContractIDs(nsISimpleEnumerator **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string CIDToContractID (in nsCIDRef aClass); */
NS_IMETHODIMP nsComponentRegistrar::CIDToContractID(const nsCID & aClass, char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsCIDPtr contractIDToCID (in string aContractID); */
NS_IMETHODIMP nsComponentRegistrar::ContractIDToCID(const char *aContractID, nsCID * *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIComponentRegistrar_h__ */
