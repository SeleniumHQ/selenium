/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/base/nsIDOMWindowCollection.idl
 */

#ifndef __gen_nsIDOMWindowCollection_h__
#define __gen_nsIDOMWindowCollection_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMWindowCollection */
#define NS_IDOMWINDOWCOLLECTION_IID_STR "a6cf906f-15b3-11d2-932e-00805f8add32"

#define NS_IDOMWINDOWCOLLECTION_IID \
  {0xa6cf906f, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMWindowCollection : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMWINDOWCOLLECTION_IID)

  /**
 * The nsIDOMWindowCollection interface is an interface for a
 * collection of DOM window objects.
 *
 * @status FROZEN
 */
/**
   * Accessor for the number of windows in this collection.
   */
  /* readonly attribute unsigned long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) = 0;

  /**
   * Method for accessing an item in this collection by index.
   */
  /* nsIDOMWindow item (in unsigned long index); */
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMWindow **_retval) = 0;

  /**
   * Method for accessing an item in this collection by window name.
   */
  /* nsIDOMWindow namedItem (in DOMString name); */
  NS_SCRIPTABLE NS_IMETHOD NamedItem(const nsAString & name, nsIDOMWindow **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMWindowCollection, NS_IDOMWINDOWCOLLECTION_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMWINDOWCOLLECTION \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength); \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMWindow **_retval); \
  NS_SCRIPTABLE NS_IMETHOD NamedItem(const nsAString & name, nsIDOMWindow **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMWINDOWCOLLECTION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return _to GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMWindow **_retval) { return _to Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NamedItem(const nsAString & name, nsIDOMWindow **_retval) { return _to NamedItem(name, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMWINDOWCOLLECTION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMWindow **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NamedItem(const nsAString & name, nsIDOMWindow **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->NamedItem(name, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMWindowCollection : public nsIDOMWindowCollection
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMWINDOWCOLLECTION

  nsDOMWindowCollection();

private:
  ~nsDOMWindowCollection();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMWindowCollection, nsIDOMWindowCollection)

nsDOMWindowCollection::nsDOMWindowCollection()
{
  /* member initializers and constructor code */
}

nsDOMWindowCollection::~nsDOMWindowCollection()
{
  /* destructor code */
}

/* readonly attribute unsigned long length; */
NS_IMETHODIMP nsDOMWindowCollection::GetLength(PRUint32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMWindow item (in unsigned long index); */
NS_IMETHODIMP nsDOMWindowCollection::Item(PRUint32 index, nsIDOMWindow **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMWindow namedItem (in DOMString name); */
NS_IMETHODIMP nsDOMWindowCollection::NamedItem(const nsAString & name, nsIDOMWindow **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMWindowCollection_h__ */
