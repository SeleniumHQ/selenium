/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/stylesheets/nsIDOMDocumentStyle.idl
 */

#ifndef __gen_nsIDOMDocumentStyle_h__
#define __gen_nsIDOMDocumentStyle_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMDocumentStyle */
#define NS_IDOMDOCUMENTSTYLE_IID_STR "3d9f4973-dd2e-48f5-b5f7-2634e09eadd9"

#define NS_IDOMDOCUMENTSTYLE_IID \
  {0x3d9f4973, 0xdd2e, 0x48f5, \
    { 0xb5, 0xf7, 0x26, 0x34, 0xe0, 0x9e, 0xad, 0xd9 }}

/**
 * The nsIDOMDocumentStyle interface is an interface to a document
 * object that supports style sheets in the Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Style
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMDocumentStyle : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMDOCUMENTSTYLE_IID)

  /* readonly attribute nsIDOMStyleSheetList styleSheets; */
  NS_SCRIPTABLE NS_IMETHOD GetStyleSheets(nsIDOMStyleSheetList * *aStyleSheets) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMDocumentStyle, NS_IDOMDOCUMENTSTYLE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMDOCUMENTSTYLE \
  NS_SCRIPTABLE NS_IMETHOD GetStyleSheets(nsIDOMStyleSheetList * *aStyleSheets); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMDOCUMENTSTYLE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetStyleSheets(nsIDOMStyleSheetList * *aStyleSheets) { return _to GetStyleSheets(aStyleSheets); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMDOCUMENTSTYLE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetStyleSheets(nsIDOMStyleSheetList * *aStyleSheets) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetStyleSheets(aStyleSheets); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMDocumentStyle : public nsIDOMDocumentStyle
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMDOCUMENTSTYLE

  nsDOMDocumentStyle();

private:
  ~nsDOMDocumentStyle();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMDocumentStyle, nsIDOMDocumentStyle)

nsDOMDocumentStyle::nsDOMDocumentStyle()
{
  /* member initializers and constructor code */
}

nsDOMDocumentStyle::~nsDOMDocumentStyle()
{
  /* destructor code */
}

/* readonly attribute nsIDOMStyleSheetList styleSheets; */
NS_IMETHODIMP nsDOMDocumentStyle::GetStyleSheets(nsIDOMStyleSheetList * *aStyleSheets)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMDocumentStyle_h__ */
