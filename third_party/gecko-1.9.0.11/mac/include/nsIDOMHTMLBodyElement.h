/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLBodyElement.idl
 */

#ifndef __gen_nsIDOMHTMLBodyElement_h__
#define __gen_nsIDOMHTMLBodyElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLBodyElement */
#define NS_IDOMHTMLBODYELEMENT_IID_STR "a6cf908e-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLBODYELEMENT_IID \
  {0xa6cf908e, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLBodyElement interface is the interface to a [X]HTML
 * body element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLBodyElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLBODYELEMENT_IID)

  /* attribute DOMString aLink; */
  NS_SCRIPTABLE NS_IMETHOD GetALink(nsAString & aALink) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetALink(const nsAString & aALink) = 0;

  /* attribute DOMString background; */
  NS_SCRIPTABLE NS_IMETHOD GetBackground(nsAString & aBackground) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetBackground(const nsAString & aBackground) = 0;

  /* attribute DOMString bgColor; */
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) = 0;

  /* attribute DOMString link; */
  NS_SCRIPTABLE NS_IMETHOD GetLink(nsAString & aLink) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLink(const nsAString & aLink) = 0;

  /* attribute DOMString text; */
  NS_SCRIPTABLE NS_IMETHOD GetText(nsAString & aText) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetText(const nsAString & aText) = 0;

  /* attribute DOMString vLink; */
  NS_SCRIPTABLE NS_IMETHOD GetVLink(nsAString & aVLink) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVLink(const nsAString & aVLink) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLBodyElement, NS_IDOMHTMLBODYELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLBODYELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetALink(nsAString & aALink); \
  NS_SCRIPTABLE NS_IMETHOD SetALink(const nsAString & aALink); \
  NS_SCRIPTABLE NS_IMETHOD GetBackground(nsAString & aBackground); \
  NS_SCRIPTABLE NS_IMETHOD SetBackground(const nsAString & aBackground); \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor); \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor); \
  NS_SCRIPTABLE NS_IMETHOD GetLink(nsAString & aLink); \
  NS_SCRIPTABLE NS_IMETHOD SetLink(const nsAString & aLink); \
  NS_SCRIPTABLE NS_IMETHOD GetText(nsAString & aText); \
  NS_SCRIPTABLE NS_IMETHOD SetText(const nsAString & aText); \
  NS_SCRIPTABLE NS_IMETHOD GetVLink(nsAString & aVLink); \
  NS_SCRIPTABLE NS_IMETHOD SetVLink(const nsAString & aVLink); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLBODYELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetALink(nsAString & aALink) { return _to GetALink(aALink); } \
  NS_SCRIPTABLE NS_IMETHOD SetALink(const nsAString & aALink) { return _to SetALink(aALink); } \
  NS_SCRIPTABLE NS_IMETHOD GetBackground(nsAString & aBackground) { return _to GetBackground(aBackground); } \
  NS_SCRIPTABLE NS_IMETHOD SetBackground(const nsAString & aBackground) { return _to SetBackground(aBackground); } \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) { return _to GetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) { return _to SetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetLink(nsAString & aLink) { return _to GetLink(aLink); } \
  NS_SCRIPTABLE NS_IMETHOD SetLink(const nsAString & aLink) { return _to SetLink(aLink); } \
  NS_SCRIPTABLE NS_IMETHOD GetText(nsAString & aText) { return _to GetText(aText); } \
  NS_SCRIPTABLE NS_IMETHOD SetText(const nsAString & aText) { return _to SetText(aText); } \
  NS_SCRIPTABLE NS_IMETHOD GetVLink(nsAString & aVLink) { return _to GetVLink(aVLink); } \
  NS_SCRIPTABLE NS_IMETHOD SetVLink(const nsAString & aVLink) { return _to SetVLink(aVLink); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLBODYELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetALink(nsAString & aALink) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetALink(aALink); } \
  NS_SCRIPTABLE NS_IMETHOD SetALink(const nsAString & aALink) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetALink(aALink); } \
  NS_SCRIPTABLE NS_IMETHOD GetBackground(nsAString & aBackground) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBackground(aBackground); } \
  NS_SCRIPTABLE NS_IMETHOD SetBackground(const nsAString & aBackground) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBackground(aBackground); } \
  NS_SCRIPTABLE NS_IMETHOD GetBgColor(nsAString & aBgColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD SetBgColor(const nsAString & aBgColor) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBgColor(aBgColor); } \
  NS_SCRIPTABLE NS_IMETHOD GetLink(nsAString & aLink) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLink(aLink); } \
  NS_SCRIPTABLE NS_IMETHOD SetLink(const nsAString & aLink) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLink(aLink); } \
  NS_SCRIPTABLE NS_IMETHOD GetText(nsAString & aText) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetText(aText); } \
  NS_SCRIPTABLE NS_IMETHOD SetText(const nsAString & aText) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetText(aText); } \
  NS_SCRIPTABLE NS_IMETHOD GetVLink(nsAString & aVLink) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVLink(aVLink); } \
  NS_SCRIPTABLE NS_IMETHOD SetVLink(const nsAString & aVLink) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVLink(aVLink); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLBodyElement : public nsIDOMHTMLBodyElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLBODYELEMENT

  nsDOMHTMLBodyElement();

private:
  ~nsDOMHTMLBodyElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLBodyElement, nsIDOMHTMLBodyElement)

nsDOMHTMLBodyElement::nsDOMHTMLBodyElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLBodyElement::~nsDOMHTMLBodyElement()
{
  /* destructor code */
}

/* attribute DOMString aLink; */
NS_IMETHODIMP nsDOMHTMLBodyElement::GetALink(nsAString & aALink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBodyElement::SetALink(const nsAString & aALink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString background; */
NS_IMETHODIMP nsDOMHTMLBodyElement::GetBackground(nsAString & aBackground)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBodyElement::SetBackground(const nsAString & aBackground)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString bgColor; */
NS_IMETHODIMP nsDOMHTMLBodyElement::GetBgColor(nsAString & aBgColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBodyElement::SetBgColor(const nsAString & aBgColor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString link; */
NS_IMETHODIMP nsDOMHTMLBodyElement::GetLink(nsAString & aLink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBodyElement::SetLink(const nsAString & aLink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString text; */
NS_IMETHODIMP nsDOMHTMLBodyElement::GetText(nsAString & aText)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBodyElement::SetText(const nsAString & aText)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString vLink; */
NS_IMETHODIMP nsDOMHTMLBodyElement::GetVLink(nsAString & aVLink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLBodyElement::SetVLink(const nsAString & aVLink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLBodyElement_h__ */
