/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/stylesheets/nsIDOMStyleSheetList.idl
 */

#ifndef __gen_nsIDOMStyleSheetList_h__
#define __gen_nsIDOMStyleSheetList_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMStyleSheetList */
#define NS_IDOMSTYLESHEETLIST_IID_STR "a6cf9081-15b3-11d2-932e-00805f8add32"

#define NS_IDOMSTYLESHEETLIST_IID \
  {0xa6cf9081, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMStyleSheetList : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMSTYLESHEETLIST_IID)

  /**
 * The nsIDOMStyleSheetList interface is a datatype for a style sheet
 * list in the Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Style
 *
 * @status FROZEN
 */
  /* readonly attribute unsigned long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) = 0;

  /* nsIDOMStyleSheet item (in unsigned long index); */
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMStyleSheet **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMStyleSheetList, NS_IDOMSTYLESHEETLIST_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMSTYLESHEETLIST \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength); \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMStyleSheet **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMSTYLESHEETLIST(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return _to GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMStyleSheet **_retval) { return _to Item(index, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMSTYLESHEETLIST(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMStyleSheet **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Item(index, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMStyleSheetList : public nsIDOMStyleSheetList
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMSTYLESHEETLIST

  nsDOMStyleSheetList();

private:
  ~nsDOMStyleSheetList();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMStyleSheetList, nsIDOMStyleSheetList)

nsDOMStyleSheetList::nsDOMStyleSheetList()
{
  /* member initializers and constructor code */
}

nsDOMStyleSheetList::~nsDOMStyleSheetList()
{
  /* destructor code */
}

/* readonly attribute unsigned long length; */
NS_IMETHODIMP nsDOMStyleSheetList::GetLength(PRUint32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMStyleSheet item (in unsigned long index); */
NS_IMETHODIMP nsDOMStyleSheetList::Item(PRUint32 index, nsIDOMStyleSheet **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMStyleSheetList_h__ */
