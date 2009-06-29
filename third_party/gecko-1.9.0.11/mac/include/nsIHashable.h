/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/xpcom/ds/nsIHashable.idl
 */

#ifndef __gen_nsIHashable_h__
#define __gen_nsIHashable_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIHashable */
#define NS_IHASHABLE_IID_STR "17e595fa-b57a-4933-bd0f-b1812e8ab188"

#define NS_IHASHABLE_IID \
  {0x17e595fa, 0xb57a, 0x4933, \
    { 0xbd, 0x0f, 0xb1, 0x81, 0x2e, 0x8a, 0xb1, 0x88 }}

/**
 * Represents an object that can be stored in a hashtable.
 *
 * @status FROZEN - This interface will not change in the Mozilla 1.x lifetime
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIHashable : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IHASHABLE_IID)

  /**
   * Is this object the equivalent of the other object?
   */
  /* boolean equals (in nsIHashable aOther); */
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIHashable *aOther, PRBool *_retval) = 0;

  /**
   * A generated hashcode for this object. Objects that are equivalent
   * must have the same hash code. Getting this property should never
   * throw an exception!
   */
  /* readonly attribute unsigned long hashCode; */
  NS_SCRIPTABLE NS_IMETHOD GetHashCode(PRUint32 *aHashCode) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIHashable, NS_IHASHABLE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIHASHABLE \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIHashable *aOther, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetHashCode(PRUint32 *aHashCode); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIHASHABLE(_to) \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIHashable *aOther, PRBool *_retval) { return _to Equals(aOther, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetHashCode(PRUint32 *aHashCode) { return _to GetHashCode(aHashCode); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIHASHABLE(_to) \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIHashable *aOther, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Equals(aOther, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetHashCode(PRUint32 *aHashCode) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHashCode(aHashCode); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsHashable : public nsIHashable
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIHASHABLE

  nsHashable();

private:
  ~nsHashable();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsHashable, nsIHashable)

nsHashable::nsHashable()
{
  /* member initializers and constructor code */
}

nsHashable::~nsHashable()
{
  /* destructor code */
}

/* boolean equals (in nsIHashable aOther); */
NS_IMETHODIMP nsHashable::Equals(nsIHashable *aOther, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned long hashCode; */
NS_IMETHODIMP nsHashable::GetHashCode(PRUint32 *aHashCode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIHashable_h__ */
