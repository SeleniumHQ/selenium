/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/html/nsIDOMHTMLImageElement.idl
 */

#ifndef __gen_nsIDOMHTMLImageElement_h__
#define __gen_nsIDOMHTMLImageElement_h__


#ifndef __gen_nsIDOMHTMLElement_h__
#include "nsIDOMHTMLElement.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMHTMLImageElement */
#define NS_IDOMHTMLIMAGEELEMENT_IID_STR "a6cf90ab-15b3-11d2-932e-00805f8add32"

#define NS_IDOMHTMLIMAGEELEMENT_IID \
  {0xa6cf90ab, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * The nsIDOMHTMLImageElement interface is the interface to a [X]HTML
 * img element.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-HTML/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMHTMLImageElement : public nsIDOMHTMLElement {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMHTMLIMAGEELEMENT_IID)

  /* attribute DOMString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /* attribute DOMString align; */
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) = 0;

  /* attribute DOMString alt; */
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt) = 0;

  /* attribute DOMString border; */
  NS_SCRIPTABLE NS_IMETHOD GetBorder(nsAString & aBorder) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetBorder(const nsAString & aBorder) = 0;

  /* attribute long height; */
  NS_SCRIPTABLE NS_IMETHOD GetHeight(PRInt32 *aHeight) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHeight(PRInt32 aHeight) = 0;

  /* attribute long hspace; */
  NS_SCRIPTABLE NS_IMETHOD GetHspace(PRInt32 *aHspace) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHspace(PRInt32 aHspace) = 0;

  /* attribute boolean isMap; */
  NS_SCRIPTABLE NS_IMETHOD GetIsMap(PRBool *aIsMap) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetIsMap(PRBool aIsMap) = 0;

  /* attribute DOMString longDesc; */
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc) = 0;

  /* attribute DOMString src; */
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc) = 0;

  /* attribute DOMString useMap; */
  NS_SCRIPTABLE NS_IMETHOD GetUseMap(nsAString & aUseMap) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetUseMap(const nsAString & aUseMap) = 0;

  /* attribute long vspace; */
  NS_SCRIPTABLE NS_IMETHOD GetVspace(PRInt32 *aVspace) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVspace(PRInt32 aVspace) = 0;

  /* attribute long width; */
  NS_SCRIPTABLE NS_IMETHOD GetWidth(PRInt32 *aWidth) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetWidth(PRInt32 aWidth) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMHTMLImageElement, NS_IDOMHTMLIMAGEELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMHTMLIMAGEELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign); \
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt); \
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt); \
  NS_SCRIPTABLE NS_IMETHOD GetBorder(nsAString & aBorder); \
  NS_SCRIPTABLE NS_IMETHOD SetBorder(const nsAString & aBorder); \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(PRInt32 *aHeight); \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(PRInt32 aHeight); \
  NS_SCRIPTABLE NS_IMETHOD GetHspace(PRInt32 *aHspace); \
  NS_SCRIPTABLE NS_IMETHOD SetHspace(PRInt32 aHspace); \
  NS_SCRIPTABLE NS_IMETHOD GetIsMap(PRBool *aIsMap); \
  NS_SCRIPTABLE NS_IMETHOD SetIsMap(PRBool aIsMap); \
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc); \
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc); \
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc); \
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc); \
  NS_SCRIPTABLE NS_IMETHOD GetUseMap(nsAString & aUseMap); \
  NS_SCRIPTABLE NS_IMETHOD SetUseMap(const nsAString & aUseMap); \
  NS_SCRIPTABLE NS_IMETHOD GetVspace(PRInt32 *aVspace); \
  NS_SCRIPTABLE NS_IMETHOD SetVspace(PRInt32 aVspace); \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(PRInt32 *aWidth); \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(PRInt32 aWidth); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMHTMLIMAGEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return _to GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return _to SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt) { return _to GetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt) { return _to SetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD GetBorder(nsAString & aBorder) { return _to GetBorder(aBorder); } \
  NS_SCRIPTABLE NS_IMETHOD SetBorder(const nsAString & aBorder) { return _to SetBorder(aBorder); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(PRInt32 *aHeight) { return _to GetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(PRInt32 aHeight) { return _to SetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetHspace(PRInt32 *aHspace) { return _to GetHspace(aHspace); } \
  NS_SCRIPTABLE NS_IMETHOD SetHspace(PRInt32 aHspace) { return _to SetHspace(aHspace); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsMap(PRBool *aIsMap) { return _to GetIsMap(aIsMap); } \
  NS_SCRIPTABLE NS_IMETHOD SetIsMap(PRBool aIsMap) { return _to SetIsMap(aIsMap); } \
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc) { return _to GetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc) { return _to SetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc) { return _to GetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc) { return _to SetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD GetUseMap(nsAString & aUseMap) { return _to GetUseMap(aUseMap); } \
  NS_SCRIPTABLE NS_IMETHOD SetUseMap(const nsAString & aUseMap) { return _to SetUseMap(aUseMap); } \
  NS_SCRIPTABLE NS_IMETHOD GetVspace(PRInt32 *aVspace) { return _to GetVspace(aVspace); } \
  NS_SCRIPTABLE NS_IMETHOD SetVspace(PRInt32 aVspace) { return _to SetVspace(aVspace); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(PRInt32 *aWidth) { return _to GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(PRInt32 aWidth) { return _to SetWidth(aWidth); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMHTMLIMAGEELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlign(nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlign(const nsAString & aAlign) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlign(aAlign); } \
  NS_SCRIPTABLE NS_IMETHOD GetAlt(nsAString & aAlt) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD SetAlt(const nsAString & aAlt) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAlt(aAlt); } \
  NS_SCRIPTABLE NS_IMETHOD GetBorder(nsAString & aBorder) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBorder(aBorder); } \
  NS_SCRIPTABLE NS_IMETHOD SetBorder(const nsAString & aBorder) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBorder(aBorder); } \
  NS_SCRIPTABLE NS_IMETHOD GetHeight(PRInt32 *aHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD SetHeight(PRInt32 aHeight) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHeight(aHeight); } \
  NS_SCRIPTABLE NS_IMETHOD GetHspace(PRInt32 *aHspace) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHspace(aHspace); } \
  NS_SCRIPTABLE NS_IMETHOD SetHspace(PRInt32 aHspace) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHspace(aHspace); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsMap(PRBool *aIsMap) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsMap(aIsMap); } \
  NS_SCRIPTABLE NS_IMETHOD SetIsMap(PRBool aIsMap) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetIsMap(aIsMap); } \
  NS_SCRIPTABLE NS_IMETHOD GetLongDesc(nsAString & aLongDesc) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD SetLongDesc(const nsAString & aLongDesc) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLongDesc(aLongDesc); } \
  NS_SCRIPTABLE NS_IMETHOD GetSrc(nsAString & aSrc) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD SetSrc(const nsAString & aSrc) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSrc(aSrc); } \
  NS_SCRIPTABLE NS_IMETHOD GetUseMap(nsAString & aUseMap) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUseMap(aUseMap); } \
  NS_SCRIPTABLE NS_IMETHOD SetUseMap(const nsAString & aUseMap) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUseMap(aUseMap); } \
  NS_SCRIPTABLE NS_IMETHOD GetVspace(PRInt32 *aVspace) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVspace(aVspace); } \
  NS_SCRIPTABLE NS_IMETHOD SetVspace(PRInt32 aVspace) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVspace(aVspace); } \
  NS_SCRIPTABLE NS_IMETHOD GetWidth(PRInt32 *aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWidth(aWidth); } \
  NS_SCRIPTABLE NS_IMETHOD SetWidth(PRInt32 aWidth) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetWidth(aWidth); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMHTMLImageElement : public nsIDOMHTMLImageElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMHTMLIMAGEELEMENT

  nsDOMHTMLImageElement();

private:
  ~nsDOMHTMLImageElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMHTMLImageElement, nsIDOMHTMLImageElement)

nsDOMHTMLImageElement::nsDOMHTMLImageElement()
{
  /* member initializers and constructor code */
}

nsDOMHTMLImageElement::~nsDOMHTMLImageElement()
{
  /* destructor code */
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString align; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetAlign(nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetAlign(const nsAString & aAlign)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString alt; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetAlt(nsAString & aAlt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetAlt(const nsAString & aAlt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString border; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetBorder(nsAString & aBorder)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetBorder(const nsAString & aBorder)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long height; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetHeight(PRInt32 *aHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetHeight(PRInt32 aHeight)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long hspace; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetHspace(PRInt32 *aHspace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetHspace(PRInt32 aHspace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean isMap; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetIsMap(PRBool *aIsMap)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetIsMap(PRBool aIsMap)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString longDesc; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetLongDesc(nsAString & aLongDesc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetLongDesc(const nsAString & aLongDesc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString src; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetSrc(nsAString & aSrc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetSrc(const nsAString & aSrc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString useMap; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetUseMap(nsAString & aUseMap)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetUseMap(const nsAString & aUseMap)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long vspace; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetVspace(PRInt32 *aVspace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetVspace(PRInt32 aVspace)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long width; */
NS_IMETHODIMP nsDOMHTMLImageElement::GetWidth(PRInt32 *aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMHTMLImageElement::SetWidth(PRInt32 aWidth)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMHTMLImageElement_h__ */
