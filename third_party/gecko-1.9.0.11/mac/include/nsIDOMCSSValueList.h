/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/css/nsIDOMCSSValueList.idl
 */

#ifndef __gen_nsIDOMCSSValueList_h__
#define __gen_nsIDOMCSSValueList_h__


#ifndef __gen_nsIDOMCSSValue_h__
#include "nsIDOMCSSValue.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMCSSValueList */
#define NS_IDOMCSSVALUELIST_IID_STR "8f09fa84-39b9-4dca-9b2f-db0eeb186286"

#define NS_IDOMCSSVALUELIST_IID \
  {0x8f09fa84, 0x39b9, 0x4dca, \
    { 0x9b, 0x2f, 0xdb, 0x0e, 0xeb, 0x18, 0x62, 0x86 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMCSSValueList : public nsIDOMCSSValue {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMCSSVALUELIST_IID)

  /**
 * The nsIDOMCSSValueList interface is a datatype for a list of CSS
 * values in the Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Style
 *
 * @status FROZEN
 */
  /* readonly attribute unsigned long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) = 0;

  /* nsIDOMCSSValue item (in unsigned long index); */
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMCSSValue **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMCSSValueList, NS_IDOMCSSVALUELIST_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMCSSVALUELIST \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength); \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMCSSValue **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMCSSVALUELIST(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return _to GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMCSSValue **_retval) { return _to Item(index, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMCSSVALUELIST(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMCSSValue **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Item(index, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMCSSValueList : public nsIDOMCSSValueList
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMCSSVALUELIST

  nsDOMCSSValueList();

private:
  ~nsDOMCSSValueList();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMCSSValueList, nsIDOMCSSValueList)

nsDOMCSSValueList::nsDOMCSSValueList()
{
  /* member initializers and constructor code */
}

nsDOMCSSValueList::~nsDOMCSSValueList()
{
  /* destructor code */
}

/* readonly attribute unsigned long length; */
NS_IMETHODIMP nsDOMCSSValueList::GetLength(PRUint32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMCSSValue item (in unsigned long index); */
NS_IMETHODIMP nsDOMCSSValueList::Item(PRUint32 index, nsIDOMCSSValue **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMCSSValueList_h__ */
