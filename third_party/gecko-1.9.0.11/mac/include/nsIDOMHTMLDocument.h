/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLDocument.idl
 */

#ifndef __gen_nsIDOMHTMLDocument_h__
#define __gen_nsIDOMHTMLDocument_h__


#ifndef __gen_nsIDOMDocument_h__
#include "nsIDOMDocument.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLDocument */
#define NS_IDOMHTMLDOCUMENT_IID_STR "a6cf9084-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLDOCUMENT_IID \
  {0xa6cf9084, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLDocument interface is the interface to a [X]HTML
 * document object.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLDocument : public nsIDOMDocument {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLDOCUMENT_IID)

  /* attribute DOMString title; */
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) = 0;

  /* readonly attribute DOMString referrer; */
  NS_SCRIPTABLE NS_IMETHOD GetReferrer(nsAString & aReferrer) = 0;

  /* [noscript] readonly attribute DOMString domain; */
  NS_IMETHOD GetDomain(nsAString & aDomain) = 0;

  /* readonly attribute DOMString URL; */
  NS_SCRIPTABLE NS_IMETHOD GetURL(nsAString & aURL) = 0;

  /* attribute nsIDOMHTMLElement body; */
  NS_SCRIPTABLE NS_IMETHOD GetBody(nsIDOMHTMLElement * *aBody) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetBody(nsIDOMHTMLElement * aBody) = 0;

  /* readonly attribute nsIDOMHTMLCollection images; */
  NS_SCRIPTABLE NS_IMETHOD GetImages(nsIDOMHTMLCollection * *aImages) = 0;

  /* readonly attribute nsIDOMHTMLCollection applets; */
  NS_SCRIPTABLE NS_IMETHOD GetApplets(nsIDOMHTMLCollection * *aApplets) = 0;

  /* readonly attribute nsIDOMHTMLCollection links; */
  NS_SCRIPTABLE NS_IMETHOD GetLinks(nsIDOMHTMLCollection * *aLinks) = 0;

  /* readonly attribute nsIDOMHTMLCollection forms; */
  NS_SCRIPTABLE NS_IMETHOD GetForms(nsIDOMHTMLCollection * *aForms) = 0;

  /* readonly attribute nsIDOMHTMLCollection anchors; */
  NS_SCRIPTABLE NS_IMETHOD GetAnchors(nsIDOMHTMLCollection * *aAnchors) = 0;

  /* attribute DOMString cookie; */
  NS_SCRIPTABLE NS_IMETHOD GetCookie(nsAString & aCookie) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCookie(const nsAString & aCookie) = 0;

  /* [noscript] void open (); */
  NS_IMETHOD Open(void) = 0;

  /* void close (); */
  NS_SCRIPTABLE NS_IMETHOD Close(void) = 0;

  /* [noscript] void write (in DOMString text); */
  NS_IMETHOD Write(const nsAString & text) = 0;

  /* [noscript] void writeln (in DOMString text); */
  NS_IMETHOD Writeln(const nsAString & text) = 0;

  /* nsIDOMNodeList getElementsByName (in DOMString elementName); */
  NS_SCRIPTABLE NS_IMETHOD GetElementsByName(const nsAString & elementName, nsIDOMNodeList **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLDocument, NS_IDOMHTMLDOCUMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLDOCUMENT \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD GetReferrer(nsAString & aReferrer); \
  NS_IMETHOD GetDomain(nsAString & aDomain); \
  NS_SCRIPTABLE NS_IMETHOD GetURL(nsAString & aURL); \
  NS_SCRIPTABLE NS_IMETHOD GetBody(nsIDOMHTMLElement * *aBody); \
  NS_SCRIPTABLE NS_IMETHOD SetBody(nsIDOMHTMLElement * aBody); \
  NS_SCRIPTABLE NS_IMETHOD GetImages(nsIDOMHTMLCollection * *aImages); \
  NS_SCRIPTABLE NS_IMETHOD GetApplets(nsIDOMHTMLCollection * *aApplets); \
  NS_SCRIPTABLE NS_IMETHOD GetLinks(nsIDOMHTMLCollection * *aLinks); \
  NS_SCRIPTABLE NS_IMETHOD GetForms(nsIDOMHTMLCollection * *aForms); \
  NS_SCRIPTABLE NS_IMETHOD GetAnchors(nsIDOMHTMLCollection * *aAnchors); \
  NS_SCRIPTABLE NS_IMETHOD GetCookie(nsAString & aCookie); \
  NS_SCRIPTABLE NS_IMETHOD SetCookie(const nsAString & aCookie); \
  NS_IMETHOD Open(void); \
  NS_SCRIPTABLE NS_IMETHOD Close(void); \
  NS_IMETHOD Write(const nsAString & text); \
  NS_IMETHOD Writeln(const nsAString & text); \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByName(const nsAString & elementName, nsIDOMNodeList **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLDOCUMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return _to GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return _to SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetReferrer(nsAString & aReferrer) { return _to GetReferrer(aReferrer); } \
  NS_IMETHOD GetDomain(nsAString & aDomain) { return _to GetDomain(aDomain); } \
  NS_SCRIPTABLE NS_IMETHOD GetURL(nsAString & aURL) { return _to GetURL(aURL); } \
  NS_SCRIPTABLE NS_IMETHOD GetBody(nsIDOMHTMLElement * *aBody) { return _to GetBody(aBody); } \
  NS_SCRIPTABLE NS_IMETHOD SetBody(nsIDOMHTMLElement * aBody) { return _to SetBody(aBody); } \
  NS_SCRIPTABLE NS_IMETHOD GetImages(nsIDOMHTMLCollection * *aImages) { return _to GetImages(aImages); } \
  NS_SCRIPTABLE NS_IMETHOD GetApplets(nsIDOMHTMLCollection * *aApplets) { return _to GetApplets(aApplets); } \
  NS_SCRIPTABLE NS_IMETHOD GetLinks(nsIDOMHTMLCollection * *aLinks) { return _to GetLinks(aLinks); } \
  NS_SCRIPTABLE NS_IMETHOD GetForms(nsIDOMHTMLCollection * *aForms) { return _to GetForms(aForms); } \
  NS_SCRIPTABLE NS_IMETHOD GetAnchors(nsIDOMHTMLCollection * *aAnchors) { return _to GetAnchors(aAnchors); } \
  NS_SCRIPTABLE NS_IMETHOD GetCookie(nsAString & aCookie) { return _to GetCookie(aCookie); } \
  NS_SCRIPTABLE NS_IMETHOD SetCookie(const nsAString & aCookie) { return _to SetCookie(aCookie); } \
  NS_IMETHOD Open(void) { return _to Open(); } \
  NS_SCRIPTABLE NS_IMETHOD Close(void) { return _to Close(); } \
  NS_IMETHOD Write(const nsAString & text) { return _to Write(text); } \
  NS_IMETHOD Writeln(const nsAString & text) { return _to Writeln(text); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByName(const nsAString & elementName, nsIDOMNodeList **_retval) { return _to GetElementsByName(elementName, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLDOCUMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetReferrer(nsAString & aReferrer) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetReferrer(aReferrer); } \
  NS_IMETHOD GetDomain(nsAString & aDomain) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDomain(aDomain); } \
  NS_SCRIPTABLE NS_IMETHOD GetURL(nsAString & aURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetURL(aURL); } \
  NS_SCRIPTABLE NS_IMETHOD GetBody(nsIDOMHTMLElement * *aBody) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBody(aBody); } \
  NS_SCRIPTABLE NS_IMETHOD SetBody(nsIDOMHTMLElement * aBody) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBody(aBody); } \
  NS_SCRIPTABLE NS_IMETHOD GetImages(nsIDOMHTMLCollection * *aImages) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetImages(aImages); } \
  NS_SCRIPTABLE NS_IMETHOD GetApplets(nsIDOMHTMLCollection * *aApplets) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetApplets(aApplets); } \
  NS_SCRIPTABLE NS_IMETHOD GetLinks(nsIDOMHTMLCollection * *aLinks) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLinks(aLinks); } \
  NS_SCRIPTABLE NS_IMETHOD GetForms(nsIDOMHTMLCollection * *aForms) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetForms(aForms); } \
  NS_SCRIPTABLE NS_IMETHOD GetAnchors(nsIDOMHTMLCollection * *aAnchors) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAnchors(aAnchors); } \
  NS_SCRIPTABLE NS_IMETHOD GetCookie(nsAString & aCookie) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCookie(aCookie); } \
  NS_SCRIPTABLE NS_IMETHOD SetCookie(const nsAString & aCookie) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCookie(aCookie); } \
  NS_IMETHOD Open(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Open(); } \
  NS_SCRIPTABLE NS_IMETHOD Close(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Close(); } \
  NS_IMETHOD Write(const nsAString & text) { return !_to ? NS_ERROR_NULL_POINTER : _to->Write(text); } \
  NS_IMETHOD Writeln(const nsAString & text) { return !_to ? NS_ERROR_NULL_POINTER : _to->Writeln(text); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByName(const nsAString & elementName, nsIDOMNodeList **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetElementsByName(elementName, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLDocument : public nsIDOMHTMLDocument
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLDOCUMENT

  nsDOMHTMLDocument();

private:
  ~nsDOMHTMLDocument();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLDocument, nsIDOMHTMLDocument)

nsDOMHTMLDocument::nsDOMHTMLDocument()
{
  /* member initializers and constructor code */
}

nsDOMHTMLDocument::~nsDOMHTMLDocument()
{
  /* destructor code */
}

/* attribute DOMString title; */
NS_IMETHODIMP nsDOMHTMLDocument::GetTitle(nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLDocument::SetTitle(const nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString referrer; */
NS_IMETHODIMP nsDOMHTMLDocument::GetReferrer(nsAString & aReferrer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] readonly attribute DOMString domain; */
NS_IMETHODIMP nsDOMHTMLDocument::GetDomain(nsAString & aDomain)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString URL; */
NS_IMETHODIMP nsDOMHTMLDocument::GetURL(nsAString & aURL)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDOMHTMLElement body; */
NS_IMETHODIMP nsDOMHTMLDocument::GetBody(nsIDOMHTMLElement * *aBody)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLDocument::SetBody(nsIDOMHTMLElement * aBody)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLCollection images; */
NS_IMETHODIMP nsDOMHTMLDocument::GetImages(nsIDOMHTMLCollection * *aImages)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLCollection applets; */
NS_IMETHODIMP nsDOMHTMLDocument::GetApplets(nsIDOMHTMLCollection * *aApplets)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLCollection links; */
NS_IMETHODIMP nsDOMHTMLDocument::GetLinks(nsIDOMHTMLCollection * *aLinks)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLCollection forms; */
NS_IMETHODIMP nsDOMHTMLDocument::GetForms(nsIDOMHTMLCollection * *aForms)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMHTMLCollection anchors; */
NS_IMETHODIMP nsDOMHTMLDocument::GetAnchors(nsIDOMHTMLCollection * *aAnchors)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString cookie; */
NS_IMETHODIMP nsDOMHTMLDocument::GetCookie(nsAString & aCookie)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLDocument::SetCookie(const nsAString & aCookie)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] void open (); */
NS_IMETHODIMP nsDOMHTMLDocument::Open()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void close (); */
NS_IMETHODIMP nsDOMHTMLDocument::Close()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] void write (in DOMString text); */
NS_IMETHODIMP nsDOMHTMLDocument::Write(const nsAString & text)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] void writeln (in DOMString text); */
NS_IMETHODIMP nsDOMHTMLDocument::Writeln(const nsAString & text)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNodeList getElementsByName (in DOMString elementName); */
NS_IMETHODIMP nsDOMHTMLDocument::GetElementsByName(const nsAString & elementName, nsIDOMNodeList **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLDocument_h__ */
