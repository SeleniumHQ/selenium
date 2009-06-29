/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/netwerk/protocol/http/public/nsIHttpHeaderVisitor.idl
 */

#ifndef __gen_nsIHttpHeaderVisitor_h__
#define __gen_nsIHttpHeaderVisitor_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIHttpHeaderVisitor */
#define NS_IHTTPHEADERVISITOR_IID_STR "0cf40717-d7c1-4a94-8c1e-d6c9734101bb"

#define NS_IHTTPHEADERVISITOR_IID \
  {0x0cf40717, 0xd7c1, 0x4a94, \
    { 0x8c, 0x1e, 0xd6, 0xc9, 0x73, 0x41, 0x01, 0xbb }}

/**
 * Implement this interface to visit http headers.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIHttpHeaderVisitor : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IHTTPHEADERVISITOR_IID)

  /**
     * Called by the nsIHttpChannel implementation when visiting request and
     * response headers.
     *
     * @param aHeader
     *        the header being visited.
     * @param aValue
     *        the header value (possibly a comma delimited list).
     *
     * @throw any exception to terminate enumeration
     */
  /* void visitHeader (in ACString aHeader, in ACString aValue); */
  NS_SCRIPTABLE NS_IMETHOD VisitHeader(const nsACString & aHeader, const nsACString & aValue) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIHttpHeaderVisitor, NS_IHTTPHEADERVISITOR_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIHTTPHEADERVISITOR \
  NS_SCRIPTABLE NS_IMETHOD VisitHeader(const nsACString & aHeader, const nsACString & aValue); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIHTTPHEADERVISITOR(_to) \
  NS_SCRIPTABLE NS_IMETHOD VisitHeader(const nsACString & aHeader, const nsACString & aValue) { return _to VisitHeader(aHeader, aValue); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIHTTPHEADERVISITOR(_to) \
  NS_SCRIPTABLE NS_IMETHOD VisitHeader(const nsACString & aHeader, const nsACString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->VisitHeader(aHeader, aValue); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsHttpHeaderVisitor : public nsIHttpHeaderVisitor
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIHTTPHEADERVISITOR

  nsHttpHeaderVisitor();

private:
  ~nsHttpHeaderVisitor();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsHttpHeaderVisitor, nsIHttpHeaderVisitor)

nsHttpHeaderVisitor::nsHttpHeaderVisitor()
{
  /* member initializers and constructor code */
}

nsHttpHeaderVisitor::~nsHttpHeaderVisitor()
{
  /* destructor code */
}

/* void visitHeader (in ACString aHeader, in ACString aValue); */
NS_IMETHODIMP nsHttpHeaderVisitor::VisitHeader(const nsACString & aHeader, const nsACString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIHttpHeaderVisitor_h__ */
