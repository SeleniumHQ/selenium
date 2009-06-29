/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/storage/nsIDOMStorage.idl
 */

#ifndef __gen_nsIDOMStorage_h__
#define __gen_nsIDOMStorage_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIDOMStorageItem; /* forward declaration */


/* starting interface:    nsIDOMStorage */
#define NS_IDOMSTORAGE_IID_STR "95cc1383-3b62-4b89-aaef-1004a513ef47"

#define NS_IDOMSTORAGE_IID \
  {0x95cc1383, 0x3b62, 0x4b89, \
    { 0xaa, 0xef, 0x10, 0x04, 0xa5, 0x13, 0xef, 0x47 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMStorage : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMSTORAGE_IID)

  /**
   * The number of keys stored.
   */
  /* readonly attribute unsigned long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) = 0;

  /**
   * Retrieve the name of the key at a particular index.
   *
   * @param index index of the item to retrieve
   * @returns the key at index
   * @throws INDEX_SIZE_ERR if there is no key at that index
   */
  /* DOMString key (in unsigned long index); */
  NS_SCRIPTABLE NS_IMETHOD Key(PRUint32 index, nsAString & _retval) = 0;

  /**
   * Retrieve an item with a given key
   *
   * @param key key to retrieve
   * @returns found item or null if the key was not found
   */
  /* nsIDOMStorageItem getItem (in DOMString key); */
  NS_SCRIPTABLE NS_IMETHOD GetItem(const nsAString & key, nsIDOMStorageItem **_retval) = 0;

  /**
   * Assign a value with a key. If the key does not exist already, a new
   * key is added associated with that value. If the key already exists,
   * then the existing value is replaced with a new value.
   *
   * @param key key to set
   * @param data data to associate with the key
   * @returns found item or null if the key was not found
   */
  /* void setItem (in DOMString key, in DOMString data); */
  NS_SCRIPTABLE NS_IMETHOD SetItem(const nsAString & key, const nsAString & data) = 0;

  /**
   * Remove a key and its corresponding value.
   *
   * @param key key to remove
   */
  /* void removeItem (in DOMString key); */
  NS_SCRIPTABLE NS_IMETHOD RemoveItem(const nsAString & key) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMStorage, NS_IDOMSTORAGE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMSTORAGE \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength); \
  NS_SCRIPTABLE NS_IMETHOD Key(PRUint32 index, nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD GetItem(const nsAString & key, nsIDOMStorageItem **_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetItem(const nsAString & key, const nsAString & data); \
  NS_SCRIPTABLE NS_IMETHOD RemoveItem(const nsAString & key); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMSTORAGE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return _to GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Key(PRUint32 index, nsAString & _retval) { return _to Key(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetItem(const nsAString & key, nsIDOMStorageItem **_retval) { return _to GetItem(key, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetItem(const nsAString & key, const nsAString & data) { return _to SetItem(key, data); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveItem(const nsAString & key) { return _to RemoveItem(key); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMSTORAGE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Key(PRUint32 index, nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Key(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetItem(const nsAString & key, nsIDOMStorageItem **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetItem(key, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetItem(const nsAString & key, const nsAString & data) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetItem(key, data); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveItem(const nsAString & key) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveItem(key); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMStorage : public nsIDOMStorage
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMSTORAGE

  nsDOMStorage();

private:
  ~nsDOMStorage();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMStorage, nsIDOMStorage)

nsDOMStorage::nsDOMStorage()
{
  /* member initializers and constructor code */
}

nsDOMStorage::~nsDOMStorage()
{
  /* destructor code */
}

/* readonly attribute unsigned long length; */
NS_IMETHODIMP nsDOMStorage::GetLength(PRUint32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* DOMString key (in unsigned long index); */
NS_IMETHODIMP nsDOMStorage::Key(PRUint32 index, nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMStorageItem getItem (in DOMString key); */
NS_IMETHODIMP nsDOMStorage::GetItem(const nsAString & key, nsIDOMStorageItem **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setItem (in DOMString key, in DOMString data); */
NS_IMETHODIMP nsDOMStorage::SetItem(const nsAString & key, const nsAString & data)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeItem (in DOMString key); */
NS_IMETHODIMP nsDOMStorage::RemoveItem(const nsAString & key)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMStorage_h__ */
