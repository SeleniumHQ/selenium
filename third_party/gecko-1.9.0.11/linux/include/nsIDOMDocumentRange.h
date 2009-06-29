/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/range/nsIDOMDocumentRange.idl
 */

#ifndef __gen_nsIDOMDocumentRange_h__
#define __gen_nsIDOMDocumentRange_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMDocumentRange */
#define NS_IDOMDOCUMENTRANGE_IID_STR "7b9badc6-c9bc-447a-8670-dbd195aed24b"

#define NS_IDOMDOCUMENTRANGE_IID \
  {0x7b9badc6, 0xc9bc, 0x447a, \
    { 0x86, 0x70, 0xdb, 0xd1, 0x95, 0xae, 0xd2, 0x4b }}

/**
 * The nsIDOMDocumentRange interface is an interface to a document
 * object that supports ranges in the Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Traversal-Range/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMDocumentRange : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMDOCUMENTRANGE_IID)

  /* nsIDOMRange createRange (); */
  NS_SCRIPTABLE NS_IMETHOD CreateRange(nsIDOMRange **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMDocumentRange, NS_IDOMDOCUMENTRANGE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMDOCUMENTRANGE \
  NS_SCRIPTABLE NS_IMETHOD CreateRange(nsIDOMRange **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMDOCUMENTRANGE(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateRange(nsIDOMRange **_retval) { return _to CreateRange(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMDOCUMENTRANGE(_to) \
  NS_SCRIPTABLE NS_IMETHOD CreateRange(nsIDOMRange **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateRange(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMDocumentRange : public nsIDOMDocumentRange
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMDOCUMENTRANGE

  nsDOMDocumentRange();

private:
  ~nsDOMDocumentRange();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMDocumentRange, nsIDOMDocumentRange)

nsDOMDocumentRange::nsDOMDocumentRange()
{
  /* member initializers and constructor code */
}

nsDOMDocumentRange::~nsDOMDocumentRange()
{
  /* destructor code */
}

/* nsIDOMRange createRange (); */
NS_IMETHODIMP nsDOMDocumentRange::CreateRange(nsIDOMRange **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMDocumentRange_h__ */
