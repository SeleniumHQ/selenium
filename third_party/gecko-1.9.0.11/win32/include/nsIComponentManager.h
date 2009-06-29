/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM e:/xr19rel/WINNT_5.2_Depend/mozilla/xpcom/components/nsIComponentManager.idl
 */

#ifndef __gen_nsIComponentManager_h__
#define __gen_nsIComponentManager_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIFactory; /* forward declaration */


/* starting interface:    nsIComponentManager */
#define NS_ICOMPONENTMANAGER_IID_STR "a88e5a60-205a-4bb1-94e1-2628daf51eae"

#define NS_ICOMPONENTMANAGER_IID \
  {0xa88e5a60, 0x205a, 0x4bb1, \
    { 0x94, 0xe1, 0x26, 0x28, 0xda, 0xf5, 0x1e, 0xae }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIComponentManager : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ICOMPONENTMANAGER_IID)

  /**
     * getClassObject
     *
     * Returns the factory object that can be used to create instances of
     * CID aClass
     *
     * @param aClass The classid of the factory that is being requested
     */
  /* void getClassObject (in nsCIDRef aClass, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult result); */
  NS_SCRIPTABLE NS_IMETHOD GetClassObject(const nsCID & aClass, const nsIID & aIID, void * *result) = 0;

  /**
     * getClassObjectByContractID
     *
     * Returns the factory object that can be used to create instances of
     * CID aClass
     *
     * @param aClass The classid of the factory that is being requested
     */
  /* void getClassObjectByContractID (in string aContractID, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult result); */
  NS_SCRIPTABLE NS_IMETHOD GetClassObjectByContractID(const char *aContractID, const nsIID & aIID, void * *result) = 0;

  /**
     * createInstance
     *
     * Create an instance of the CID aClass and return the interface aIID.
     *
     * @param aClass : ClassID of object instance requested
     * @param aDelegate : Used for aggregation
     * @param aIID : IID of interface requested
     */
  /* void createInstance (in nsCIDRef aClass, in nsISupports aDelegate, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult result); */
  NS_SCRIPTABLE NS_IMETHOD CreateInstance(const nsCID & aClass, nsISupports *aDelegate, const nsIID & aIID, void * *result) = 0;

  /**
     * createInstanceByContractID
     *
     * Create an instance of the CID that implements aContractID and return the
     * interface aIID. 
     *
     * @param aContractID : aContractID of object instance requested
     * @param aDelegate : Used for aggregation
     * @param aIID : IID of interface requested
     */
  /* void createInstanceByContractID (in string aContractID, in nsISupports aDelegate, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult result); */
  NS_SCRIPTABLE NS_IMETHOD CreateInstanceByContractID(const char *aContractID, nsISupports *aDelegate, const nsIID & aIID, void * *result) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIComponentManager, NS_ICOMPONENTMANAGER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSICOMPONENTMANAGER \
  NS_SCRIPTABLE NS_IMETHOD GetClassObject(const nsCID & aClass, const nsIID & aIID, void * *result); \
  NS_SCRIPTABLE NS_IMETHOD GetClassObjectByContractID(const char *aContractID, const nsIID & aIID, void * *result); \
  NS_SCRIPTABLE NS_IMETHOD CreateInstance(const nsCID & aClass, nsISupports *aDelegate, const nsIID & aIID, void * *result); \
  NS_SCRIPTABLE NS_IMETHOD CreateInstanceByContractID(const char *aContractID, nsISupports *aDelegate, const nsIID & aIID, void * *result); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSICOMPONENTMANAGER(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetClassObject(const nsCID & aClass, const nsIID & aIID, void * *result) { return _to GetClassObject(aClass, aIID, result); } \
  NS_SCRIPTABLE NS_IMETHOD GetClassObjectByContractID(const char *aContractID, const nsIID & aIID, void * *result) { return _to GetClassObjectByContractID(aContractID, aIID, result); } \
  NS_SCRIPTABLE NS_IMETHOD CreateInstance(const nsCID & aClass, nsISupports *aDelegate, const nsIID & aIID, void * *result) { return _to CreateInstance(aClass, aDelegate, aIID, result); } \
  NS_SCRIPTABLE NS_IMETHOD CreateInstanceByContractID(const char *aContractID, nsISupports *aDelegate, const nsIID & aIID, void * *result) { return _to CreateInstanceByContractID(aContractID, aDelegate, aIID, result); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSICOMPONENTMANAGER(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetClassObject(const nsCID & aClass, const nsIID & aIID, void * *result) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClassObject(aClass, aIID, result); } \
  NS_SCRIPTABLE NS_IMETHOD GetClassObjectByContractID(const char *aContractID, const nsIID & aIID, void * *result) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetClassObjectByContractID(aContractID, aIID, result); } \
  NS_SCRIPTABLE NS_IMETHOD CreateInstance(const nsCID & aClass, nsISupports *aDelegate, const nsIID & aIID, void * *result) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateInstance(aClass, aDelegate, aIID, result); } \
  NS_SCRIPTABLE NS_IMETHOD CreateInstanceByContractID(const char *aContractID, nsISupports *aDelegate, const nsIID & aIID, void * *result) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateInstanceByContractID(aContractID, aDelegate, aIID, result); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsComponentManager : public nsIComponentManager
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSICOMPONENTMANAGER

  nsComponentManager();

private:
  ~nsComponentManager();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsComponentManager, nsIComponentManager)

nsComponentManager::nsComponentManager()
{
  /* member initializers and constructor code */
}

nsComponentManager::~nsComponentManager()
{
  /* destructor code */
}

/* void getClassObject (in nsCIDRef aClass, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult result); */
NS_IMETHODIMP nsComponentManager::GetClassObject(const nsCID & aClass, const nsIID & aIID, void * *result)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getClassObjectByContractID (in string aContractID, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult result); */
NS_IMETHODIMP nsComponentManager::GetClassObjectByContractID(const char *aContractID, const nsIID & aIID, void * *result)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void createInstance (in nsCIDRef aClass, in nsISupports aDelegate, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult result); */
NS_IMETHODIMP nsComponentManager::CreateInstance(const nsCID & aClass, nsISupports *aDelegate, const nsIID & aIID, void * *result)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void createInstanceByContractID (in string aContractID, in nsISupports aDelegate, in nsIIDRef aIID, [iid_is (aIID), retval] out nsQIResult result); */
NS_IMETHODIMP nsComponentManager::CreateInstanceByContractID(const char *aContractID, nsISupports *aDelegate, const nsIID & aIID, void * *result)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

#ifdef MOZILLA_INTERNAL_API
#include "nsComponentManagerUtils.h"
#endif

#endif /* __gen_nsIComponentManager_h__ */
