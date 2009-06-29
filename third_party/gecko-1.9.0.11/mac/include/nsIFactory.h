/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/xpcom/components/nsIFactory.idl
 */

#ifndef __gen_nsIFactory_h__
#define __gen_nsIFactory_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIFactory */
#define NS_IFACTORY_IID_STR "00000001-0000-0000-c000-000000000046"

#define NS_IFACTORY_IID \
  {0x00000001, 0x0000, 0x0000, \
    { 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x46 }}

/**
 * A class factory allows the creation of nsISupports derived
 * components without specifying a concrete base class.  
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIFactory : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IFACTORY_IID)

  /**
    * Creates an instance of a component.
    *
    * @param aOuter Pointer to a component that wishes to be aggregated
    *               in the resulting instance. This will be nsnull if no
    *               aggregation is requested.
    * @param iid    The IID of the interface being requested in
    *               the component which is being currently created.
    * @param result [out] Pointer to the newly created instance, if successful.
    * @return NS_OK - Component successfully created and the interface 
    *                 being requested was successfully returned in result.
    *         NS_NOINTERFACE - Interface not accessible.
    *         NS_ERROR_NO_AGGREGATION - if an 'outer' object is supplied, but the
    *                                   component is not aggregatable.
    *         NS_ERROR* - Method failure.
    */
  /* void createInstance (in nsISupports aOuter, in nsIIDRef iid, [iid_is (iid), retval] out nsQIResult result); */
  NS_SCRIPTABLE NS_IMETHOD CreateInstance(nsISupports *aOuter, const nsIID & iid, void * *result) = 0;

  /**
    * LockFactory provides the client a way to keep the component
    * in memory until it is finished with it. The client can call
    * LockFactory(PR_TRUE) to lock the factory and LockFactory(PR_FALSE)
    * to release the factory.	 
    *
    * @param lock - Must be PR_TRUE or PR_FALSE
    * @return NS_OK - If the lock operation was successful.
    *         NS_ERROR* - Method failure.
    */
  /* void lockFactory (in PRBool lock); */
  NS_SCRIPTABLE NS_IMETHOD LockFactory(PRBool lock) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIFactory, NS_IFACTORY_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIFACTORY \
  NS_SCRIPTABLE NS_IMETHOD CreateInstance(nsISupports *aOuter, const nsIID & iid, void * *result); \
  NS_SCRIPTABLE NS_IMETHOD LockFactory(PRBool lock); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIFACTORY(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateInstance(nsISupports *aOuter, const nsIID & iid, void * *result) { return _to CreateInstance(aOuter, iid, result); } \
  NS_SCRIPTABLE NS_IMETHOD LockFactory(PRBool lock) { return _to LockFactory(lock); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIFACTORY(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateInstance(nsISupports *aOuter, const nsIID & iid, void * *result) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateInstance(aOuter, iid, result); } \
  NS_SCRIPTABLE NS_IMETHOD LockFactory(PRBool lock) { return !_to ? NS_ERROR_NULL_POINTER : _to->LockFactory(lock); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsFactory : public nsIFactory
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIFACTORY

  nsFactory();

private:
  ~nsFactory();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsFactory, nsIFactory)

nsFactory::nsFactory()
{
  /* member initializers and constructor code */
}

nsFactory::~nsFactory()
{
  /* destructor code */
}

/* void createInstance (in nsISupports aOuter, in nsIIDRef iid, [iid_is (iid), retval] out nsQIResult result); */
NS_IMETHODIMP nsFactory::CreateInstance(nsISupports *aOuter, const nsIID & iid, void * *result)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void lockFactory (in PRBool lock); */
NS_IMETHODIMP nsFactory::LockFactory(PRBool lock)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIFactory_h__ */
