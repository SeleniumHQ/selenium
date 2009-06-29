/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/stylesheets/nsIDOMStyleSheet.idl
 */

#ifndef __gen_nsIDOMStyleSheet_h__
#define __gen_nsIDOMStyleSheet_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMStyleSheet */
#define NS_IDOMSTYLESHEET_IID_STR "a6cf9080-15b3-11d2-932e-00805f8add32"

#define NS_IDOMSTYLESHEET_IID \
  {0xa6cf9080, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMStyleSheet : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMSTYLESHEET_IID)

  /**
 * The nsIDOMStyleSheet interface is a datatype for a style sheet in
 * the Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Style
 *
 * @status FROZEN
 */
  /* readonly attribute DOMString type; */
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) = 0;

  /* attribute boolean disabled; */
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled) = 0;

  /* readonly attribute nsIDOMNode ownerNode; */
  NS_SCRIPTABLE NS_IMETHOD GetOwnerNode(nsIDOMNode * *aOwnerNode) = 0;

  /* readonly attribute nsIDOMStyleSheet parentStyleSheet; */
  NS_SCRIPTABLE NS_IMETHOD GetParentStyleSheet(nsIDOMStyleSheet * *aParentStyleSheet) = 0;

  /* readonly attribute DOMString href; */
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) = 0;

  /* readonly attribute DOMString title; */
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) = 0;

  /* readonly attribute nsIDOMMediaList media; */
  NS_SCRIPTABLE NS_IMETHOD GetMedia(nsIDOMMediaList * *aMedia) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMStyleSheet, NS_IDOMSTYLESHEET_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMSTYLESHEET \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType); \
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled); \
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled); \
  NS_SCRIPTABLE NS_IMETHOD GetOwnerNode(nsIDOMNode * *aOwnerNode); \
  NS_SCRIPTABLE NS_IMETHOD GetParentStyleSheet(nsIDOMStyleSheet * *aParentStyleSheet); \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref); \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD GetMedia(nsIDOMMediaList * *aMedia); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMSTYLESHEET(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return _to GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled) { return _to GetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled) { return _to SetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD GetOwnerNode(nsIDOMNode * *aOwnerNode) { return _to GetOwnerNode(aOwnerNode); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentStyleSheet(nsIDOMStyleSheet * *aParentStyleSheet) { return _to GetParentStyleSheet(aParentStyleSheet); } \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) { return _to GetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return _to GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetMedia(nsIDOMMediaList * *aMedia) { return _to GetMedia(aMedia); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMSTYLESHEET(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetDisabled(PRBool *aDisabled) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD SetDisabled(PRBool aDisabled) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDisabled(aDisabled); } \
  NS_SCRIPTABLE NS_IMETHOD GetOwnerNode(nsIDOMNode * *aOwnerNode) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOwnerNode(aOwnerNode); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentStyleSheet(nsIDOMStyleSheet * *aParentStyleSheet) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentStyleSheet(aParentStyleSheet); } \
  NS_SCRIPTABLE NS_IMETHOD GetHref(nsAString & aHref) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHref(aHref); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetMedia(nsIDOMMediaList * *aMedia) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMedia(aMedia); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMStyleSheet : public nsIDOMStyleSheet
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMSTYLESHEET

  nsDOMStyleSheet();

private:
  ~nsDOMStyleSheet();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMStyleSheet, nsIDOMStyleSheet)

nsDOMStyleSheet::nsDOMStyleSheet()
{
  /* member initializers and constructor code */
}

nsDOMStyleSheet::~nsDOMStyleSheet()
{
  /* destructor code */
}

/* readonly attribute DOMString type; */
NS_IMETHODIMP nsDOMStyleSheet::GetType(nsAString & aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean disabled; */
NS_IMETHODIMP nsDOMStyleSheet::GetDisabled(PRBool *aDisabled)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMStyleSheet::SetDisabled(PRBool aDisabled)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNode ownerNode; */
NS_IMETHODIMP nsDOMStyleSheet::GetOwnerNode(nsIDOMNode * *aOwnerNode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMStyleSheet parentStyleSheet; */
NS_IMETHODIMP nsDOMStyleSheet::GetParentStyleSheet(nsIDOMStyleSheet * *aParentStyleSheet)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString href; */
NS_IMETHODIMP nsDOMStyleSheet::GetHref(nsAString & aHref)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString title; */
NS_IMETHODIMP nsDOMStyleSheet::GetTitle(nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMMediaList media; */
NS_IMETHODIMP nsDOMStyleSheet::GetMedia(nsIDOMMediaList * *aMedia)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMStyleSheet_h__ */
