/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/core/nsIDOMEntity.idl
 */

#ifndef __gen_nsIDOMEntity_h__
#define __gen_nsIDOMEntity_h__


#ifndef __gen_nsIDOMNode_h__
#include "nsIDOMNode.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMEntity */
#define NS_IDOMENTITY_IID_STR "a6cf9079-15b3-11d2-932e-00805f8add32"

#define NS_IDOMENTITY_IID \
  {0xa6cf9079, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMEntity : public nsIDOMNode {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMENTITY_IID)

  /**
 * The nsIDOMEntity interface represents an entity, either parsed 
 * or unparsed, in an XML document.
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

  /* readonly attribute DOMString notationName; */
  NS_SCRIPTABLE NS_IMETHOD GetNotationName(nsAString & aNotationName) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMEntity, NS_IDOMENTITY_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMENTITY \
  NS_SCRIPTABLE NS_IMETHOD GetPublicId(nsAString & aPublicId); \
  NS_SCRIPTABLE NS_IMETHOD GetSystemId(nsAString & aSystemId); \
  NS_SCRIPTABLE NS_IMETHOD GetNotationName(nsAString & aNotationName); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMENTITY(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetPublicId(nsAString & aPublicId) { return _to GetPublicId(aPublicId); } \
  NS_SCRIPTABLE NS_IMETHOD GetSystemId(nsAString & aSystemId) { return _to GetSystemId(aSystemId); } \
  NS_SCRIPTABLE NS_IMETHOD GetNotationName(nsAString & aNotationName) { return _to GetNotationName(aNotationName); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMENTITY(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetPublicId(nsAString & aPublicId) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPublicId(aPublicId); } \
  NS_SCRIPTABLE NS_IMETHOD GetSystemId(nsAString & aSystemId) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSystemId(aSystemId); } \
  NS_SCRIPTABLE NS_IMETHOD GetNotationName(nsAString & aNotationName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNotationName(aNotationName); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMEntity : public nsIDOMEntity
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMENTITY

  nsDOMEntity();

private:
  ~nsDOMEntity();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMEntity, nsIDOMEntity)

nsDOMEntity::nsDOMEntity()
{
  /* member initializers and constructor code */
}

nsDOMEntity::~nsDOMEntity()
{
  /* destructor code */
}

/* readonly attribute DOMString publicId; */
NS_IMETHODIMP nsDOMEntity::GetPublicId(nsAString & aPublicId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString systemId; */
NS_IMETHODIMP nsDOMEntity::GetSystemId(nsAString & aSystemId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString notationName; */
NS_IMETHODIMP nsDOMEntity::GetNotationName(nsAString & aNotationName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMEntity_h__ */
