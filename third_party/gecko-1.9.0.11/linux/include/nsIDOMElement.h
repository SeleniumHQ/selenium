/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/core/nsIDOMElement.idl
 */

#ifndef __gen_nsIDOMElement_h__
#define __gen_nsIDOMElement_h__


#ifndef __gen_nsIDOMNode_h__
#include "nsIDOMNode.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMElement */
#define NS_IDOMELEMENT_IID_STR "a6cf9078-15b3-11d2-932e-00805f8add32"

#define NS_IDOMELEMENT_IID \
  {0xa6cf9078, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMElement : public nsIDOMNode {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMELEMENT_IID)

  /**
 * The nsIDOMElement interface represents an element in an HTML or 
 * XML document. 
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Core/
 *
 * @status FROZEN
 */
  /* readonly attribute DOMString tagName; */
  NS_SCRIPTABLE NS_IMETHOD GetTagName(nsAString & aTagName) = 0;

  /* DOMString getAttribute (in DOMString name); */
  NS_SCRIPTABLE NS_IMETHOD GetAttribute(const nsAString & name, nsAString & _retval) = 0;

  /* void setAttribute (in DOMString name, in DOMString value)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetAttribute(const nsAString & name, const nsAString & value) = 0;

  /* void removeAttribute (in DOMString name)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD RemoveAttribute(const nsAString & name) = 0;

  /* nsIDOMAttr getAttributeNode (in DOMString name); */
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNode(const nsAString & name, nsIDOMAttr **_retval) = 0;

  /* nsIDOMAttr setAttributeNode (in nsIDOMAttr newAttr)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNode(nsIDOMAttr *newAttr, nsIDOMAttr **_retval) = 0;

  /* nsIDOMAttr removeAttributeNode (in nsIDOMAttr oldAttr)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD RemoveAttributeNode(nsIDOMAttr *oldAttr, nsIDOMAttr **_retval) = 0;

  /* nsIDOMNodeList getElementsByTagName (in DOMString name); */
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagName(const nsAString & name, nsIDOMNodeList **_retval) = 0;

  /* DOMString getAttributeNS (in DOMString namespaceURI, in DOMString localName); */
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNS(const nsAString & namespaceURI, const nsAString & localName, nsAString & _retval) = 0;

  /* void setAttributeNS (in DOMString namespaceURI, in DOMString qualifiedName, in DOMString value)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, const nsAString & value) = 0;

  /* void removeAttributeNS (in DOMString namespaceURI, in DOMString localName)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD RemoveAttributeNS(const nsAString & namespaceURI, const nsAString & localName) = 0;

  /* nsIDOMAttr getAttributeNodeNS (in DOMString namespaceURI, in DOMString localName); */
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNodeNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMAttr **_retval) = 0;

  /* nsIDOMAttr setAttributeNodeNS (in nsIDOMAttr newAttr)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNodeNS(nsIDOMAttr *newAttr, nsIDOMAttr **_retval) = 0;

  /* nsIDOMNodeList getElementsByTagNameNS (in DOMString namespaceURI, in DOMString localName); */
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval) = 0;

  /* boolean hasAttribute (in DOMString name); */
  NS_SCRIPTABLE NS_IMETHOD HasAttribute(const nsAString & name, PRBool *_retval) = 0;

  /* boolean hasAttributeNS (in DOMString namespaceURI, in DOMString localName); */
  NS_SCRIPTABLE NS_IMETHOD HasAttributeNS(const nsAString & namespaceURI, const nsAString & localName, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMElement, NS_IDOMELEMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMELEMENT \
  NS_SCRIPTABLE NS_IMETHOD GetTagName(nsAString & aTagName); \
  NS_SCRIPTABLE NS_IMETHOD GetAttribute(const nsAString & name, nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD SetAttribute(const nsAString & name, const nsAString & value); \
  NS_SCRIPTABLE NS_IMETHOD RemoveAttribute(const nsAString & name); \
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNode(const nsAString & name, nsIDOMAttr **_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNode(nsIDOMAttr *newAttr, nsIDOMAttr **_retval); \
  NS_SCRIPTABLE NS_IMETHOD RemoveAttributeNode(nsIDOMAttr *oldAttr, nsIDOMAttr **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagName(const nsAString & name, nsIDOMNodeList **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNS(const nsAString & namespaceURI, const nsAString & localName, nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, const nsAString & value); \
  NS_SCRIPTABLE NS_IMETHOD RemoveAttributeNS(const nsAString & namespaceURI, const nsAString & localName); \
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNodeNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMAttr **_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNodeNS(nsIDOMAttr *newAttr, nsIDOMAttr **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval); \
  NS_SCRIPTABLE NS_IMETHOD HasAttribute(const nsAString & name, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD HasAttributeNS(const nsAString & namespaceURI, const nsAString & localName, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetTagName(nsAString & aTagName) { return _to GetTagName(aTagName); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttribute(const nsAString & name, nsAString & _retval) { return _to GetAttribute(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAttribute(const nsAString & name, const nsAString & value) { return _to SetAttribute(name, value); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveAttribute(const nsAString & name) { return _to RemoveAttribute(name); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNode(const nsAString & name, nsIDOMAttr **_retval) { return _to GetAttributeNode(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNode(nsIDOMAttr *newAttr, nsIDOMAttr **_retval) { return _to SetAttributeNode(newAttr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveAttributeNode(nsIDOMAttr *oldAttr, nsIDOMAttr **_retval) { return _to RemoveAttributeNode(oldAttr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagName(const nsAString & name, nsIDOMNodeList **_retval) { return _to GetElementsByTagName(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNS(const nsAString & namespaceURI, const nsAString & localName, nsAString & _retval) { return _to GetAttributeNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, const nsAString & value) { return _to SetAttributeNS(namespaceURI, qualifiedName, value); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveAttributeNS(const nsAString & namespaceURI, const nsAString & localName) { return _to RemoveAttributeNS(namespaceURI, localName); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNodeNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMAttr **_retval) { return _to GetAttributeNodeNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNodeNS(nsIDOMAttr *newAttr, nsIDOMAttr **_retval) { return _to SetAttributeNodeNS(newAttr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval) { return _to GetElementsByTagNameNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HasAttribute(const nsAString & name, PRBool *_retval) { return _to HasAttribute(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HasAttributeNS(const nsAString & namespaceURI, const nsAString & localName, PRBool *_retval) { return _to HasAttributeNS(namespaceURI, localName, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMELEMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetTagName(nsAString & aTagName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTagName(aTagName); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttribute(const nsAString & name, nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAttribute(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAttribute(const nsAString & name, const nsAString & value) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAttribute(name, value); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveAttribute(const nsAString & name) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveAttribute(name); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNode(const nsAString & name, nsIDOMAttr **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAttributeNode(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNode(nsIDOMAttr *newAttr, nsIDOMAttr **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAttributeNode(newAttr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveAttributeNode(nsIDOMAttr *oldAttr, nsIDOMAttr **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveAttributeNode(oldAttr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagName(const nsAString & name, nsIDOMNodeList **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetElementsByTagName(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNS(const nsAString & namespaceURI, const nsAString & localName, nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAttributeNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, const nsAString & value) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAttributeNS(namespaceURI, qualifiedName, value); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveAttributeNS(const nsAString & namespaceURI, const nsAString & localName) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveAttributeNS(namespaceURI, localName); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttributeNodeNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMAttr **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAttributeNodeNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAttributeNodeNS(nsIDOMAttr *newAttr, nsIDOMAttr **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAttributeNodeNS(newAttr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetElementsByTagNameNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HasAttribute(const nsAString & name, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->HasAttribute(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HasAttributeNS(const nsAString & namespaceURI, const nsAString & localName, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->HasAttributeNS(namespaceURI, localName, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMElement : public nsIDOMElement
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMELEMENT

  nsDOMElement();

private:
  ~nsDOMElement();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMElement, nsIDOMElement)

nsDOMElement::nsDOMElement()
{
  /* member initializers and constructor code */
}

nsDOMElement::~nsDOMElement()
{
  /* destructor code */
}

/* readonly attribute DOMString tagName; */
NS_IMETHODIMP nsDOMElement::GetTagName(nsAString & aTagName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* DOMString getAttribute (in DOMString name); */
NS_IMETHODIMP nsDOMElement::GetAttribute(const nsAString & name, nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setAttribute (in DOMString name, in DOMString value)  raises (DOMException); */
NS_IMETHODIMP nsDOMElement::SetAttribute(const nsAString & name, const nsAString & value)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeAttribute (in DOMString name)  raises (DOMException); */
NS_IMETHODIMP nsDOMElement::RemoveAttribute(const nsAString & name)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMAttr getAttributeNode (in DOMString name); */
NS_IMETHODIMP nsDOMElement::GetAttributeNode(const nsAString & name, nsIDOMAttr **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMAttr setAttributeNode (in nsIDOMAttr newAttr)  raises (DOMException); */
NS_IMETHODIMP nsDOMElement::SetAttributeNode(nsIDOMAttr *newAttr, nsIDOMAttr **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMAttr removeAttributeNode (in nsIDOMAttr oldAttr)  raises (DOMException); */
NS_IMETHODIMP nsDOMElement::RemoveAttributeNode(nsIDOMAttr *oldAttr, nsIDOMAttr **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNodeList getElementsByTagName (in DOMString name); */
NS_IMETHODIMP nsDOMElement::GetElementsByTagName(const nsAString & name, nsIDOMNodeList **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* DOMString getAttributeNS (in DOMString namespaceURI, in DOMString localName); */
NS_IMETHODIMP nsDOMElement::GetAttributeNS(const nsAString & namespaceURI, const nsAString & localName, nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setAttributeNS (in DOMString namespaceURI, in DOMString qualifiedName, in DOMString value)  raises (DOMException); */
NS_IMETHODIMP nsDOMElement::SetAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, const nsAString & value)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeAttributeNS (in DOMString namespaceURI, in DOMString localName)  raises (DOMException); */
NS_IMETHODIMP nsDOMElement::RemoveAttributeNS(const nsAString & namespaceURI, const nsAString & localName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMAttr getAttributeNodeNS (in DOMString namespaceURI, in DOMString localName); */
NS_IMETHODIMP nsDOMElement::GetAttributeNodeNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMAttr **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMAttr setAttributeNodeNS (in nsIDOMAttr newAttr)  raises (DOMException); */
NS_IMETHODIMP nsDOMElement::SetAttributeNodeNS(nsIDOMAttr *newAttr, nsIDOMAttr **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNodeList getElementsByTagNameNS (in DOMString namespaceURI, in DOMString localName); */
NS_IMETHODIMP nsDOMElement::GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean hasAttribute (in DOMString name); */
NS_IMETHODIMP nsDOMElement::HasAttribute(const nsAString & name, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean hasAttributeNS (in DOMString namespaceURI, in DOMString localName); */
NS_IMETHODIMP nsDOMElement::HasAttributeNS(const nsAString & namespaceURI, const nsAString & localName, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMElement_h__ */
