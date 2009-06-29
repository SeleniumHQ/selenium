/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/core/nsIDOMNotation.idl
 */

#ifndef __gen_nsIDOMNotation_h__
#define __gen_nsIDOMNotation_h__


#ifndef __gen_nsIDOMNode_h__
#include "nsIDOMNode.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMNotation */
#define NS_IDOMNOTATION_IID_STR "a6cf907e-15b3-11d2-932e-00805f8add32"

#define NS_IDOMNOTATION_IID \
  {0xa6cf907e, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMNotation : public nsIDOMNode {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMNOTATION_IID)

  /**
 * The nsIDOMNotation interface represents a notation declared in the DTD.
 * A notation  either declares, by name, the format of an unparsed entity, 
 * or is used for formal declaration of processing instruction targets.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Core/
 *
 * @status FROZEN
 */
  /* readonly attribute DOMString publicId; */
  NS_SCRIPTABLE NS_IMETHOD GetPublicId(nsAString & aPublicId) = 0;

  /* readonly attribute DOMString systemId; */
  NS_SCRIPTABLE NS_IMETHOD GetSystemId(nsAString & aSystemId) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMNotation, NS_IDOMNOTATION_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMNOTATION \
  NS_SCRIPTABLE NS_IMETHOD GetPublicId(nsAString & aPublicId); \
  NS_SCRIPTABLE NS_IMETHOD GetSystemId(nsAString & aSystemId); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMNOTATION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetPublicId(nsAString & aPublicId) { return _to GetPublicId(aPublicId); } \
  NS_SCRIPTABLE NS_IMETHOD GetSystemId(nsAString & aSystemId) { return _to GetSystemId(aSystemId); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMNOTATION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetPublicId(nsAString & aPublicId) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPublicId(aPublicId); } \
  NS_SCRIPTABLE NS_IMETHOD GetSystemId(nsAString & aSystemId) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSystemId(aSystemId); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMNotation : public nsIDOMNotation
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMNOTATION

  nsDOMNotation();

private:
  ~nsDOMNotation();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMNotation, nsIDOMNotation)

nsDOMNotation::nsDOMNotation()
{
  /* member initializers and constructor code */
}

nsDOMNotation::~nsDOMNotation()
{
  /* destructor code */
}

/* readonly attribute DOMString publicId; */
NS_IMETHODIMP nsDOMNotation::GetPublicId(nsAString & aPublicId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString systemId; */
NS_IMETHODIMP nsDOMNotation::GetSystemId(nsAString & aSystemId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMNotation_h__ */
