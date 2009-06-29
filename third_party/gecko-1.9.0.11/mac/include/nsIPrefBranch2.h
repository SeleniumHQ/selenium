/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/modules/libpref/public/nsIPrefBranch2.idl
 */

#ifndef __gen_nsIPrefBranch2_h__
#define __gen_nsIPrefBranch2_h__


#ifndef __gen_nsIPrefBranch_h__
#include "nsIPrefBranch.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIObserver; /* forward declaration */


/* starting interface:    nsIPrefBranch2 */
#define NS_IPREFBRANCH2_IID_STR "74567534-eb94-4b1c-8f45-389643bfc555"

#define NS_IPREFBRANCH2_IID \
  {0x74567534, 0xeb94, 0x4b1c, \
    { 0x8f, 0x45, 0x38, 0x96, 0x43, 0xbf, 0xc5, 0x55 }}

/**
 * nsIPrefBranch2 allows clients to observe changes to pref values.
 *
 * @status FROZEN
 * @see nsIPrefBranch
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIPrefBranch2 : public nsIPrefBranch {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IPREFBRANCH2_IID)

  /**
   * Add a preference change observer. On preference changes, the following
   * arguments will be passed to the nsIObserver.observe() method:
   *   aSubject - The nsIPrefBranch object (this)
   *   aTopic   - The string defined by NS_PREFBRANCH_PREFCHANGE_TOPIC_ID
   *   aData    - The name of the preference which has changed, relative to
   *              the |root| of the aSubject branch.
   *
   * aSubject.get*Pref(aData) will get the new value of the modified
   * preference. For example, if your observer is registered with
   * addObserver("bar.", ...) on a branch with root "foo.", modifying
   * the preference "foo.bar.baz" will trigger the observer, and aData
   * parameter will be "bar.baz".
   *
   * @param aDomain   The preference on which to listen for changes. This can
   *                  be the name of an entire branch to observe.
   *                  e.g. Holding the "root" prefbranch and calling
   *                  addObserver("foo.bar.", ...) will observe changes to
   *                  foo.bar.baz and foo.bar.bzip
   * @param aObserver The object to be notified if the preference changes.
   * @param aHoldWeak true  Hold a weak reference to |aObserver|. The object
   *                        must implement the nsISupportsWeakReference
   *                        interface or this will fail.
   *                  false Hold a strong reference to |aObserver|.
   *
   * @note
   * Registering as a preference observer can open an object to potential
   * cyclical references which will cause memory leaks. These cycles generally
   * occur because an object both registers itself as an observer (causing the
   * branch to hold a reference to the observer) and holds a reference to the
   * branch object for the purpose of getting/setting preference values. There
   * are 3 approaches which have been implemented in an attempt to avoid these
   * situations.
   * 1) The nsPrefBranch object supports nsISupportsWeakReference. Any consumer
   *    may hold a weak reference to it instead of a strong one.
   * 2) The nsPrefBranch object listens for xpcom-shutdown and frees all of the
   *    objects currently in its observer list. This ensures that long lived
   *    objects (services for example) will be freed correctly.
   * 3) The observer can request to be held as a weak reference when it is
   *    registered. This insures that shorter lived objects (say one tied to an
   *    open window) will not fall into the cyclical reference trap.
   *
   * @note
   * The list of registered observers may be changed during the dispatch of
   * nsPref:changed notification. However, the observers are not guaranteed
   * to be notified in any particular order, so you can't be sure whether the
   * added/removed observer will be called during the notification when it
   * is added/removed.
   *
   * @note
   * It is possible to change preferences during the notification.
   *
   * @note
   * It is not safe to change observers during this callback in Gecko 
   * releases before 1.9. If you want a safe way to remove a pref observer,
   * please use an nsITimer.
   *
   * @see nsIObserver
   * @see removeObserver
   */
  /* void addObserver (in string aDomain, in nsIObserver aObserver, in boolean aHoldWeak); */
  NS_SCRIPTABLE NS_IMETHOD AddObserver(const char *aDomain, nsIObserver *aObserver, PRBool aHoldWeak) = 0;

  /**
   * Remove a preference change observer.
   *
   * @param aDomain   The preference which is being observed for changes.
   * @param aObserver An observer previously registered with addObserver().
   *
   * @note
   * Note that you must call removeObserver() on the same nsIPrefBranch2
   * instance on which you called addObserver() in order to remove aObserver;
   * otherwise, the observer will not be removed.
   *
   * @see nsIObserver
   * @see addObserver
   */
  /* void removeObserver (in string aDomain, in nsIObserver aObserver); */
  NS_SCRIPTABLE NS_IMETHOD RemoveObserver(const char *aDomain, nsIObserver *aObserver) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIPrefBranch2, NS_IPREFBRANCH2_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIPREFBRANCH2 \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(const char *aDomain, nsIObserver *aObserver, PRBool aHoldWeak); \
  NS_SCRIPTABLE NS_IMETHOD RemoveObserver(const char *aDomain, nsIObserver *aObserver); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIPREFBRANCH2(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(const char *aDomain, nsIObserver *aObserver, PRBool aHoldWeak) { return _to AddObserver(aDomain, aObserver, aHoldWeak); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveObserver(const char *aDomain, nsIObserver *aObserver) { return _to RemoveObserver(aDomain, aObserver); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIPREFBRANCH2(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(const char *aDomain, nsIObserver *aObserver, PRBool aHoldWeak) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddObserver(aDomain, aObserver, aHoldWeak); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveObserver(const char *aDomain, nsIObserver *aObserver) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveObserver(aDomain, aObserver); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsPrefBranch2 : public nsIPrefBranch2
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPREFBRANCH2

  nsPrefBranch2();

private:
  ~nsPrefBranch2();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsPrefBranch2, nsIPrefBranch2)

nsPrefBranch2::nsPrefBranch2()
{
  /* member initializers and constructor code */
}

nsPrefBranch2::~nsPrefBranch2()
{
  /* destructor code */
}

/* void addObserver (in string aDomain, in nsIObserver aObserver, in boolean aHoldWeak); */
NS_IMETHODIMP nsPrefBranch2::AddObserver(const char *aDomain, nsIObserver *aObserver, PRBool aHoldWeak)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeObserver (in string aDomain, in nsIObserver aObserver); */
NS_IMETHODIMP nsPrefBranch2::RemoveObserver(const char *aDomain, nsIObserver *aObserver)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

/**
 * Notification sent when a preference changes.
 */
#define NS_PREFBRANCH_PREFCHANGE_TOPIC_ID "nsPref:changed"

#endif /* __gen_nsIPrefBranch2_h__ */
