/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLOptionsCollection.idl
 */

#ifndef __gen_nsIDOMHTMLOptionsCollection_h__
#define __gen_nsIDOMHTMLOptionsCollection_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLOptionsCollection */
#define NS_IDOMHTMLOPTIONSCOLLECTION_IID_STR "bce0213c-f70f-488f-b93f-688acca55d63"

#define NS_IDOMHTMLOPTIONSCOLLECTION_IID \
  {0xbce0213c, 0xf70f, 0x488f, \
    { 0xb9, 0x3f, 0x68, 0x8a, 0xcc, 0xa5, 0x5d, 0x63 }}

/**
 * The nsIDOMHTMLOptionsCollection interface is the interface to a
 * collection of [X]HTML option elements.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLOptionsCollection : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLOPTIONSCOLLECTION_IID)

  /* attribute unsigned long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLength(PRUint32 aLength) = 0;

  /* nsIDOMNode item (in unsigned long index); */
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval) = 0;

  /* nsIDOMNode namedItem (in DOMString name); */
  NS_SCRIPTABLE NS_IMETHOD NamedItem(const nsAString & name, nsIDOMNode **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLOptionsCollection, NS_IDOMHTMLOPTIONSCOLLECTION_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLOPTIONSCOLLECTION \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength); \
  NS_SCRIPTABLE NS_IMETHOD SetLength(PRUint32 aLength); \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD NamedItem(const nsAString & name, nsIDOMNode **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLOPTIONSCOLLECTION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return _to GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD SetLength(PRUint32 aLength) { return _to SetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval) { return _to Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NamedItem(const nsAString & name, nsIDOMNode **_retval) { return _to NamedItem(name, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLOPTIONSCOLLECTION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD SetLength(PRUint32 aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NamedItem(const nsAString & name, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->NamedItem(name, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLOptionsCollection : public nsIDOMHTMLOptionsCollection
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLOPTIONSCOLLECTION

  nsDOMHTMLOptionsCollection();

private:
  ~nsDOMHTMLOptionsCollection();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLOptionsCollection, nsIDOMHTMLOptionsCollection)

nsDOMHTMLOptionsCollection::nsDOMHTMLOptionsCollection()
{
  /* member initializers and constructor code */
}

nsDOMHTMLOptionsCollection::~nsDOMHTMLOptionsCollection()
{
  /* destructor code */
}

/* attribute unsigned long length; */
NS_IMETHODIMP nsDOMHTMLOptionsCollection::GetLength(PRUint32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLOptionsCollection::SetLength(PRUint32 aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode item (in unsigned long index); */
NS_IMETHODIMP nsDOMHTMLOptionsCollection::Item(PRUint32 index, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode namedItem (in DOMString name); */
NS_IMETHODIMP nsDOMHTMLOptionsCollection::NamedItem(const nsAString & name, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLOptionsCollection_h__ */
