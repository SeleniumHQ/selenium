/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/core/nsIDOMNodeList.idl
 */

#ifndef __gen_nsIDOMNodeList_h__
#define __gen_nsIDOMNodeList_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMNodeList */
#define NS_IDOMNODELIST_IID_STR "a6cf907d-15b3-11d2-932e-00805f8add32"

#define NS_IDOMNODELIST_IID \
  {0xa6cf907d, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMNodeList : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMNODELIST_IID)

  /**
 * The nsIDOMNodeList interface provides the abstraction of an ordered 
 * collection of nodes, without defining or constraining how this collection 
 * is implemented.
 * The items in the list are accessible via an integral index, starting from 0.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Core/
 *
 * @status FROZEN
 */
  /* nsIDOMNode item (in unsigned long index); */
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval) = 0;

  /* readonly attribute unsigned long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMNodeList, NS_IDOMNODELIST_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMNODELIST \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMNODELIST(_to) \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval) { return _to Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return _to GetLength(aLength); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMNODELIST(_to) \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMNodeList : public nsIDOMNodeList
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMNODELIST

  nsDOMNodeList();

private:
  ~nsDOMNodeList();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMNodeList, nsIDOMNodeList)

nsDOMNodeList::nsDOMNodeList()
{
  /* member initializers and constructor code */
}

nsDOMNodeList::~nsDOMNodeList()
{
  /* destructor code */
}

/* nsIDOMNode item (in unsigned long index); */
NS_IMETHODIMP nsDOMNodeList::Item(PRUint32 index, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned long length; */
NS_IMETHODIMP nsDOMNodeList::GetLength(PRUint32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMNodeList_h__ */
