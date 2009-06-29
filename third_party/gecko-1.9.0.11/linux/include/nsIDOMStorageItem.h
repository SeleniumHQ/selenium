/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/storage/nsIDOMStorageItem.idl
 */

#ifndef __gen_nsIDOMStorageItem_h__
#define __gen_nsIDOMStorageItem_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMStorageItem */
#define NS_IDOMSTORAGEITEM_IID_STR "0cc37c78-4c5f-48e1-adfc-7480b8fe9dc4"

#define NS_IDOMSTORAGEITEM_IID \
  {0x0cc37c78, 0x4c5f, 0x48e1, \
    { 0xad, 0xfc, 0x74, 0x80, 0xb8, 0xfe, 0x9d, 0xc4 }}

/**
 * Interface for a client side storage item. See
 * http://www.whatwg.org/specs/web-apps/current-work/#scs-client-side
 * for more information.
 *
 * A respresentation of a storage object item.
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMStorageItem : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMSTORAGEITEM_IID)

  /**
   * Indicates whether a key is available only in a secure context.
   */
  /* attribute boolean secure; */
  NS_SCRIPTABLE NS_IMETHOD GetSecure(PRBool *aSecure) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSecure(PRBool aSecure) = 0;

  /**
   * The value associated with the item.
   */
  /* attribute DOMString value; */
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMStorageItem, NS_IDOMSTORAGEITEM_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMSTORAGEITEM \
  NS_SCRIPTABLE NS_IMETHOD GetSecure(PRBool *aSecure); \
  NS_SCRIPTABLE NS_IMETHOD SetSecure(PRBool aSecure); \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue); \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMSTORAGEITEM(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetSecure(PRBool *aSecure) { return _to GetSecure(aSecure); } \
  NS_SCRIPTABLE NS_IMETHOD SetSecure(PRBool aSecure) { return _to SetSecure(aSecure); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return _to GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return _to SetValue(aValue); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMSTORAGEITEM(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetSecure(PRBool *aSecure) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSecure(aSecure); } \
  NS_SCRIPTABLE NS_IMETHOD SetSecure(PRBool aSecure) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSecure(aSecure); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetValue(aValue); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMStorageItem : public nsIDOMStorageItem
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMSTORAGEITEM

  nsDOMStorageItem();

private:
  ~nsDOMStorageItem();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMStorageItem, nsIDOMStorageItem)

nsDOMStorageItem::nsDOMStorageItem()
{
  /* member initializers and constructor code */
}

nsDOMStorageItem::~nsDOMStorageItem()
{
  /* destructor code */
}

/* attribute boolean secure; */
NS_IMETHODIMP nsDOMStorageItem::GetSecure(PRBool *aSecure)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMStorageItem::SetSecure(PRBool aSecure)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString value; */
NS_IMETHODIMP nsDOMStorageItem::GetValue(nsAString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMStorageItem::SetValue(const nsAString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMStorageItem_h__ */
