/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/views/nsIDOMDocumentView.idl
 */

#ifndef __gen_nsIDOMDocumentView_h__
#define __gen_nsIDOMDocumentView_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMDocumentView */
#define NS_IDOMDOCUMENTVIEW_IID_STR "1acdb2ba-1dd2-11b2-95bc-9542495d2569"

#define NS_IDOMDOCUMENTVIEW_IID \
  {0x1acdb2ba, 0x1dd2, 0x11b2, \
    { 0x95, 0xbc, 0x95, 0x42, 0x49, 0x5d, 0x25, 0x69 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMDocumentView : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMDOCUMENTVIEW_IID)

  /**
 * The nsIDOMDocumentView interface is a datatype for a document that
 * supports views in the Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Views
 *
 * @status FROZEN
 */
  /* readonly attribute nsIDOMAbstractView defaultView; */
  NS_SCRIPTABLE NS_IMETHOD GetDefaultView(nsIDOMAbstractView * *aDefaultView) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMDocumentView, NS_IDOMDOCUMENTVIEW_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMDOCUMENTVIEW \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultView(nsIDOMAbstractView * *aDefaultView); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMDOCUMENTVIEW(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultView(nsIDOMAbstractView * *aDefaultView) { return _to GetDefaultView(aDefaultView); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMDOCUMENTVIEW(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultView(nsIDOMAbstractView * *aDefaultView) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDefaultView(aDefaultView); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMDocumentView : public nsIDOMDocumentView
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMDOCUMENTVIEW

  nsDOMDocumentView();

private:
  ~nsDOMDocumentView();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMDocumentView, nsIDOMDocumentView)

nsDOMDocumentView::nsDOMDocumentView()
{
  /* member initializers and constructor code */
}

nsDOMDocumentView::~nsDOMDocumentView()
{
  /* destructor code */
}

/* readonly attribute nsIDOMAbstractView defaultView; */
NS_IMETHODIMP nsDOMDocumentView::GetDefaultView(nsIDOMAbstractView * *aDefaultView)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMDocumentView_h__ */
