/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/xpcom/components/nsIModule.idl
 */

#ifndef __gen_nsIModule_h__
#define __gen_nsIModule_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIFile; /* forward declaration */

class nsIComponentManager; /* forward declaration */


/* starting interface:    nsIModule */
#define NS_IMODULE_IID_STR "7392d032-5371-11d3-994e-00805fd26fee"

#define NS_IMODULE_IID \
  {0x7392d032, 0x5371, 0x11d3, \
    { 0x99, 0x4e, 0x00, 0x80, 0x5f, 0xd2, 0x6f, 0xee }}

/**
 * The nsIModule interface.
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIModule : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IMODULE_IID)

  /** 
     * Object Instance Creation
     *
     * Obtains a Class Object from a nsIModule for a given CID and IID pair.  
     * This class object can either be query to a nsIFactory or a may be 
     * query to a nsIClassInfo.
     *
     * @param aCompMgr  : The global component manager
     * @param aClass    : ClassID of object instance requested
     * @param aIID      : IID of interface requested
     * 
     */
  /* void getClassObject (in nsIComponentManager aCompMgr, in nsCIDRef aClass, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult aResult); */
  NS_SCRIPTABLE NS_IMETHOD GetClassObject(nsIComponentManager *aCompMgr, const nsCID & aClass, const nsIID & aIID, void * *aResult) = 0;

  /**
     * One time registration callback
     *
     * When the nsIModule is discovered, this method will be
     * called so that any setup registration can be preformed.
     *
     * @param aCompMgr  : The global component manager
     * @param aLocation : The location of the nsIModule on disk
     * @param aLoaderStr: Opaque loader specific string
     * @param aType     : Loader Type being used to load this module 
     */
  /* void registerSelf (in nsIComponentManager aCompMgr, in nsIFile aLocation, in string aLoaderStr, in string aType); */
  NS_SCRIPTABLE NS_IMETHOD RegisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr, const char *aType) = 0;

  /**
     * One time unregistration callback
     *
     * When the nsIModule is being unregistered, this method will be
     * called so that any unregistration can be preformed
     *
     * @param aCompMgr   : The global component manager
     * @param aLocation  : The location of the nsIModule on disk
     * @param aLoaderStr : Opaque loader specific string
     * 
     */
  /* void unregisterSelf (in nsIComponentManager aCompMgr, in nsIFile aLocation, in string aLoaderStr); */
  NS_SCRIPTABLE NS_IMETHOD UnregisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr) = 0;

  /** 
    * Module load management
    * 
    * @param aCompMgr  : The global component manager
    *
    * @return indicates to the caller if the module can be unloaded.
    * 		Returning PR_TRUE isn't a guarantee that the module will be
    *		unloaded. It constitues only willingness of the module to be
    *		unloaded.  It is very important to ensure that no outstanding 
    *       references to the module's code/data exist before returning 
    *       PR_TRUE. 
    *		Returning PR_FALSE guaratees that the module won't be unloaded.
    */
  /* boolean canUnload (in nsIComponentManager aCompMgr); */
  NS_SCRIPTABLE NS_IMETHOD CanUnload(nsIComponentManager *aCompMgr, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIModule, NS_IMODULE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIMODULE \
  NS_SCRIPTABLE NS_IMETHOD GetClassObject(nsIComponentManager *aCompMgr, const nsCID & aClass, const nsIID & aIID, void * *aResult); \
  NS_SCRIPTABLE NS_IMETHOD RegisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr, const char *aType); \
  NS_SCRIPTABLE NS_IMETHOD UnregisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr); \
  NS_SCRIPTABLE NS_IMETHOD CanUnload(nsIComponentManager *aCompMgr, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIMODULE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetClassObject(nsIComponentManager *aCompMgr, const nsCID & aClass, const nsIID & aIID, void * *aResult) { return _to GetClassObject(aCompMgr, aClass, aIID, aResult); } \
  NS_SCRIPTABLE NS_IMETHOD RegisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr, const char *aType) { return _to RegisterSelf(aCompMgr, aLocation, aLoaderStr, aType); } \
  NS_SCRIPTABLE NS_IMETHOD UnregisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr) { return _to UnregisterSelf(aCompMgr, aLocation, aLoaderStr); } \
  NS_SCRIPTABLE NS_IMETHOD CanUnload(nsIComponentManager *aCompMgr, PRBool *_retval) { return _to CanUnload(aCompMgr, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIMODULE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetClassObject(nsIComponentManager *aCompMgr, const nsCID & aClass, const nsIID & aIID, void * *aResult) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClassObject(aCompMgr, aClass, aIID, aResult); } \
  NS_SCRIPTABLE NS_IMETHOD RegisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr, const char *aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->RegisterSelf(aCompMgr, aLocation, aLoaderStr, aType); } \
  NS_SCRIPTABLE NS_IMETHOD UnregisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr) { return !_to ? NS_ERROR_NULL_POINTER : _to->UnregisterSelf(aCompMgr, aLocation, aLoaderStr); } \
  NS_SCRIPTABLE NS_IMETHOD CanUnload(nsIComponentManager *aCompMgr, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CanUnload(aCompMgr, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsModule : public nsIModule
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIMODULE

  nsModule();

private:
  ~nsModule();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsModule, nsIModule)

nsModule::nsModule()
{
  /* member initializers and constructor code */
}

nsModule::~nsModule()
{
  /* destructor code */
}

/* void getClassObject (in nsIComponentManager aCompMgr, in nsCIDRef aClass, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult aResult); */
NS_IMETHODIMP nsModule::GetClassObject(nsIComponentManager *aCompMgr, const nsCID & aClass, const nsIID & aIID, void * *aResult)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void registerSelf (in nsIComponentManager aCompMgr, in nsIFile aLocation, in string aLoaderStr, in string aType); */
NS_IMETHODIMP nsModule::RegisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr, const char *aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void unregisterSelf (in nsIComponentManager aCompMgr, in nsIFile aLocation, in string aLoaderStr); */
NS_IMETHODIMP nsModule::UnregisterSelf(nsIComponentManager *aCompMgr, nsIFile *aLocation, const char *aLoaderStr)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean canUnload (in nsIComponentManager aCompMgr); */
NS_IMETHODIMP nsModule::CanUnload(nsIComponentManager *aCompMgr, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIModule_h__ */
