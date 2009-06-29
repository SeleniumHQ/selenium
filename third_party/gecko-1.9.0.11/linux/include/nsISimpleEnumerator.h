/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/xpcom/ds/nsISimpleEnumerator.idl
 */

#ifndef __gen_nsISimpleEnumerator_h__
#define __gen_nsISimpleEnumerator_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsISimpleEnumerator */
#define NS_ISIMPLEENUMERATOR_IID_STR "d1899240-f9d2-11d2-bdd6-000064657374"

#define NS_ISIMPLEENUMERATOR_IID \
  {0xd1899240, 0xf9d2, 0x11d2, \
    { 0xbd, 0xd6, 0x00, 0x00, 0x64, 0x65, 0x73, 0x74 }}

/**
 * Used to enumerate over elements defined by its implementor.
 * Although hasMoreElements() can be called independently of getNext(),
 * getNext() must be pre-ceeded by a call to hasMoreElements(). There is
 * no way to "reset" an enumerator, once you obtain one.
 *
 * @status FROZEN
 * @version 1.0
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISimpleEnumerator : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISIMPLEENUMERATOR_IID)

  /**
   * Called to determine whether or not the enumerator has
   * any elements that can be returned via getNext(). This method
   * is generally used to determine whether or not to initiate or
   * continue iteration over the enumerator, though it can be
   * called without subsequent getNext() calls. Does not affect
   * internal state of enumerator.
   *
   * @see getNext()
   * @return PR_TRUE if there are remaining elements in the enumerator.
   *         PR_FALSE if there are no more elements in the enumerator.
   */
  /* boolean hasMoreElements (); */
  NS_SCRIPTABLE NS_IMETHOD HasMoreElements(PRBool *_retval) = 0;

  /**
   * Called to retrieve the next element in the enumerator. The "next"
   * element is the first element upon the first call. Must be
   * pre-ceeded by a call to hasMoreElements() which returns PR_TRUE.
   * This method is generally called within a loop to iterate over
   * the elements in the enumerator.
   *
   * @see hasMoreElements()
   * @return NS_OK if the call succeeded in returning a non-null
   *               value through the out parameter.
   *         NS_ERROR_FAILURE if there are no more elements
   *                          to enumerate.
   * @return the next element in the enumeration.
   */
  /* nsISupports getNext (); */
  NS_SCRIPTABLE NS_IMETHOD GetNext(nsISupports **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISimpleEnumerator, NS_ISIMPLEENUMERATOR_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISIMPLEENUMERATOR \
  NS_SCRIPTABLE NS_IMETHOD HasMoreElements(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetNext(nsISupports **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISIMPLEENUMERATOR(_to) \
  NS_SCRIPTABLE NS_IMETHOD HasMoreElements(PRBool *_retval) { return _to HasMoreElements(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetNext(nsISupports **_retval) { return _to GetNext(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISIMPLEENUMERATOR(_to) \
  NS_SCRIPTABLE NS_IMETHOD HasMoreElements(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->HasMoreElements(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetNext(nsISupports **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNext(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSimpleEnumerator : public nsISimpleEnumerator
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISIMPLEENUMERATOR

  nsSimpleEnumerator();

private:
  ~nsSimpleEnumerator();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSimpleEnumerator, nsISimpleEnumerator)

nsSimpleEnumerator::nsSimpleEnumerator()
{
  /* member initializers and constructor code */
}

nsSimpleEnumerator::~nsSimpleEnumerator()
{
  /* destructor code */
}

/* boolean hasMoreElements (); */
NS_IMETHODIMP nsSimpleEnumerator::HasMoreElements(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsISupports getNext (); */
NS_IMETHODIMP nsSimpleEnumerator::GetNext(nsISupports **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsISimpleEnumerator_h__ */
