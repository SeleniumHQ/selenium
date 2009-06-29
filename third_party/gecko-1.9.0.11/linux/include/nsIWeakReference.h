/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/xpcom/base/nsIWeakReference.idl
 */

#ifndef __gen_nsIWeakReference_h__
#define __gen_nsIWeakReference_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIWeakReference */
#define NS_IWEAKREFERENCE_IID_STR "9188bc85-f92e-11d2-81ef-0060083a0bcf"

#define NS_IWEAKREFERENCE_IID \
  {0x9188bc85, 0xf92e, 0x11d2, \
    { 0x81, 0xef, 0x00, 0x60, 0x08, 0x3a, 0x0b, 0xcf }}

/**
 * An instance of |nsIWeakReference| is a proxy object that cooperates with
 * its referent to give clients a non-owning, non-dangling reference.  Clients
 * own the proxy, and should generally manage it with an |nsCOMPtr| (see the
 * type |nsWeakPtr| for a |typedef| name that stands out) as they would any
 * other XPCOM object.  The |QueryReferent| member function provides a
 * (hopefully short-lived) owning reference on demand, through which clients
 * can get useful access to the referent, while it still exists.
 *
 * @status FROZEN
 * @version 1.0
 * @see nsISupportsWeakReference
 * @see nsWeakReference
 * @see nsWeakPtr
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWeakReference : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEAKREFERENCE_IID)

  /**
     * |QueryReferent| queries the referent, if it exists, and like |QueryInterface|, produces
     * an owning reference to the desired interface.  It is designed to look and act exactly
     * like (a proxied) |QueryInterface|.  Don't hold on to the produced interface permanently;
     * that would defeat the purpose of using a non-owning |nsIWeakReference| in the first place.
     */
  /* void QueryReferent (in nsIIDRef uuid, [iid_is (uuid), retval] out nsQIResult result); */
  NS_SCRIPTABLE NS_IMETHOD QueryReferent(const nsIID & uuid, void * *result) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWeakReference, NS_IWEAKREFERENCE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEAKREFERENCE \
  NS_SCRIPTABLE NS_IMETHOD QueryReferent(const nsIID & uuid, void * *result); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEAKREFERENCE(_to) \
  NS_SCRIPTABLE NS_IMETHOD QueryReferent(const nsIID & uuid, void * *result) { return _to QueryReferent(uuid, result); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEAKREFERENCE(_to) \
  NS_SCRIPTABLE NS_IMETHOD QueryReferent(const nsIID & uuid, void * *result) { return !_to ? NS_ERROR_NULL_POINTER : _to->QueryReferent(uuid, result); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWeakReference : public nsIWeakReference
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEAKREFERENCE

  nsWeakReference();

private:
  ~nsWeakReference();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWeakReference, nsIWeakReference)

nsWeakReference::nsWeakReference()
{
  /* member initializers and constructor code */
}

nsWeakReference::~nsWeakReference()
{
  /* destructor code */
}

/* void QueryReferent (in nsIIDRef uuid, [iid_is (uuid), retval] out nsQIResult result); */
NS_IMETHODIMP nsWeakReference::QueryReferent(const nsIID & uuid, void * *result)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsISupportsWeakReference */
#define NS_ISUPPORTSWEAKREFERENCE_IID_STR "9188bc86-f92e-11d2-81ef-0060083a0bcf"

#define NS_ISUPPORTSWEAKREFERENCE_IID \
  {0x9188bc86, 0xf92e, 0x11d2, \
    { 0x81, 0xef, 0x00, 0x60, 0x08, 0x3a, 0x0b, 0xcf }}

/**
 * |nsISupportsWeakReference| is a factory interface which produces appropriate
 * instances of |nsIWeakReference|.  Weak references in this scheme can only be
 * produced for objects that implement this interface.
 *
 * @status FROZEN
 * @version 1.0
 * @see nsIWeakReference
 * @see nsSupportsWeakReference
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISupportsWeakReference : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISUPPORTSWEAKREFERENCE_IID)

  /**
     * |GetWeakReference| produces an appropriate instance of |nsIWeakReference|.
     * As with all good XPCOM `getters', you own the resulting interface and should
     * manage it with an |nsCOMPtr|.
     *
     * @see nsIWeakReference
     * @see nsWeakPtr
     * @see nsCOMPtr
     */
  /* nsIWeakReference GetWeakReference (); */
  NS_SCRIPTABLE NS_IMETHOD GetWeakReference(nsIWeakReference **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISupportsWeakReference, NS_ISUPPORTSWEAKREFERENCE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISUPPORTSWEAKREFERENCE \
  NS_SCRIPTABLE NS_IMETHOD GetWeakReference(nsIWeakReference **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISUPPORTSWEAKREFERENCE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetWeakReference(nsIWeakReference **_retval) { return _to GetWeakReference(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISUPPORTSWEAKREFERENCE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetWeakReference(nsIWeakReference **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWeakReference(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSupportsWeakReference : public nsISupportsWeakReference
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISUPPORTSWEAKREFERENCE

  nsSupportsWeakReference();

private:
  ~nsSupportsWeakReference();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSupportsWeakReference, nsISupportsWeakReference)

nsSupportsWeakReference::nsSupportsWeakReference()
{
  /* member initializers and constructor code */
}

nsSupportsWeakReference::~nsSupportsWeakReference()
{
  /* destructor code */
}

/* nsIWeakReference GetWeakReference (); */
NS_IMETHODIMP nsSupportsWeakReference::GetWeakReference(nsIWeakReference **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

#ifdef MOZILLA_INTERNAL_API
#include "nsIWeakReferenceUtils.h"
#endif

#endif /* __gen_nsIWeakReference_h__ */
