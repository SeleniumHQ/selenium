/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/core/nsIDOMEntityReference.idl
 */

#ifndef __gen_nsIDOMEntityReference_h__
#define __gen_nsIDOMEntityReference_h__


#ifndef __gen_nsIDOMNode_h__
#include "nsIDOMNode.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMEntityReference */
#define NS_IDOMENTITYREFERENCE_IID_STR "a6cf907a-15b3-11d2-932e-00805f8add32"

#define NS_IDOMENTITYREFERENCE_IID \
  {0xa6cf907a, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMEntityReference : public nsIDOMNode {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMENTITYREFERENCE_IID)

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMEntityReference, NS_IDOMENTITYREFERENCE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMENTITYREFERENCE \
  /* no methods! */

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMENTITYREFERENCE(_to) \
  /* no methods! */

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMENTITYREFERENCE(_to) \
  /* no methods! */

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMEntityReference : public nsIDOMEntityReference
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMENTITYREFERENCE

  nsDOMEntityReference();

private:
  ~nsDOMEntityReference();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMEntityReference, nsIDOMEntityReference)

nsDOMEntityReference::nsDOMEntityReference()
{
  /* member initializers and constructor code */
}

nsDOMEntityReference::~nsDOMEntityReference()
{
  /* destructor code */
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMEntityReference_h__ */
