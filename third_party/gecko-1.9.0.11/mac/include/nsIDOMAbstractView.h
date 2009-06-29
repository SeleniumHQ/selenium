/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/views/nsIDOMAbstractView.idl
 */

#ifndef __gen_nsIDOMAbstractView_h__
#define __gen_nsIDOMAbstractView_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMAbstractView */
#define NS_IDOMABSTRACTVIEW_IID_STR "f51ebade-8b1a-11d3-aae7-0010830123b4"

#define NS_IDOMABSTRACTVIEW_IID \
  {0xf51ebade, 0x8b1a, 0x11d3, \
    { 0xaa, 0xe7, 0x00, 0x10, 0x83, 0x01, 0x23, 0xb4 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMAbstractView : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMABSTRACTVIEW_IID)

  /**
 * The nsIDOMAbstractView interface is a datatype for a view in the
 * Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Views
 *
 * @status FROZEN
 */
  /* readonly attribute nsIDOMDocumentView document; */
  NS_SCRIPTABLE NS_IMETHOD GetDocument(nsIDOMDocumentView * *aDocument) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMAbstractView, NS_IDOMABSTRACTVIEW_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMABSTRACTVIEW \
  NS_SCRIPTABLE NS_IMETHOD GetDocument(nsIDOMDocumentView * *aDocument); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMABSTRACTVIEW(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDocument(nsIDOMDocumentView * *aDocument) { return _to GetDocument(aDocument); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMABSTRACTVIEW(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDocument(nsIDOMDocumentView * *aDocument) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDocument(aDocument); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMAbstractView : public nsIDOMAbstractView
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMABSTRACTVIEW

  nsDOMAbstractView();

private:
  ~nsDOMAbstractView();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMAbstractView, nsIDOMAbstractView)

nsDOMAbstractView::nsDOMAbstractView()
{
  /* member initializers and constructor code */
}

nsDOMAbstractView::~nsDOMAbstractView()
{
  /* destructor code */
}

/* readonly attribute nsIDOMDocumentView document; */
NS_IMETHODIMP nsDOMAbstractView::GetDocument(nsIDOMDocumentView * *aDocument)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMAbstractView_h__ */
