/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/core/nsIDOMDocument.idl
 */

#ifndef __gen_nsIDOMDocument_h__
#define __gen_nsIDOMDocument_h__


#ifndef __gen_nsIDOMNode_h__
#include "nsIDOMNode.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMDocument */
#define NS_IDOMDOCUMENT_IID_STR "a6cf9075-15b3-11d2-932e-00805f8add32"

#define NS_IDOMDOCUMENT_IID \
  {0xa6cf9075, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMDocument : public nsIDOMNode {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMDOCUMENT_IID)

  /**
 * The nsIDOMDocument interface represents the entire HTML or XML document.
 * Conceptually, it is the root of the document tree, and provides the 
 * primary access to the document's data.
 * Since elements, text nodes, comments, processing instructions, etc. 
 * cannot exist outside the context of a Document, the nsIDOMDocument 
 * interface also contains the factory methods needed to create these 
 * objects.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Core/
 *
 * @status FROZEN
 */
  /* readonly attribute nsIDOMDocumentType doctype; */
  NS_SCRIPTABLE NS_IMETHOD GetDoctype(nsIDOMDocumentType * *aDoctype) = 0;

  /* readonly attribute nsIDOMDOMImplementation implementation; */
  NS_SCRIPTABLE NS_IMETHOD GetImplementation(nsIDOMDOMImplementation * *aImplementation) = 0;

  /* readonly attribute nsIDOMElement documentElement; */
  NS_SCRIPTABLE NS_IMETHOD GetDocumentElement(nsIDOMElement * *aDocumentElement) = 0;

  /* nsIDOMElement createElement (in DOMString tagName)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateElement(const nsAString & tagName, nsIDOMElement **_retval) = 0;

  /* nsIDOMDocumentFragment createDocumentFragment (); */
  NS_SCRIPTABLE NS_IMETHOD CreateDocumentFragment(nsIDOMDocumentFragment **_retval) = 0;

  /* nsIDOMText createTextNode (in DOMString data); */
  NS_SCRIPTABLE NS_IMETHOD CreateTextNode(const nsAString & data, nsIDOMText **_retval) = 0;

  /* nsIDOMComment createComment (in DOMString data); */
  NS_SCRIPTABLE NS_IMETHOD CreateComment(const nsAString & data, nsIDOMComment **_retval) = 0;

  /* nsIDOMCDATASection createCDATASection (in DOMString data)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateCDATASection(const nsAString & data, nsIDOMCDATASection **_retval) = 0;

  /* nsIDOMProcessingInstruction createProcessingInstruction (in DOMString target, in DOMString data)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateProcessingInstruction(const nsAString & target, const nsAString & data, nsIDOMProcessingInstruction **_retval) = 0;

  /* nsIDOMAttr createAttribute (in DOMString name)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateAttribute(const nsAString & name, nsIDOMAttr **_retval) = 0;

  /* nsIDOMEntityReference createEntityReference (in DOMString name)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateEntityReference(const nsAString & name, nsIDOMEntityReference **_retval) = 0;

  /* nsIDOMNodeList getElementsByTagName (in DOMString tagname); */
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagName(const nsAString & tagname, nsIDOMNodeList **_retval) = 0;

  /* nsIDOMNode importNode (in nsIDOMNode importedNode, in boolean deep)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD ImportNode(nsIDOMNode *importedNode, PRBool deep, nsIDOMNode **_retval) = 0;

  /* nsIDOMElement createElementNS (in DOMString namespaceURI, in DOMString qualifiedName)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateElementNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMElement **_retval) = 0;

  /* nsIDOMAttr createAttributeNS (in DOMString namespaceURI, in DOMString qualifiedName)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMAttr **_retval) = 0;

  /* nsIDOMNodeList getElementsByTagNameNS (in DOMString namespaceURI, in DOMString localName); */
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval) = 0;

  /* nsIDOMElement getElementById (in DOMString elementId); */
  NS_SCRIPTABLE NS_IMETHOD GetElementById(const nsAString & elementId, nsIDOMElement **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMDocument, NS_IDOMDOCUMENT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMDOCUMENT \
  NS_SCRIPTABLE NS_IMETHOD GetDoctype(nsIDOMDocumentType * *aDoctype); \
  NS_SCRIPTABLE NS_IMETHOD GetImplementation(nsIDOMDOMImplementation * *aImplementation); \
  NS_SCRIPTABLE NS_IMETHOD GetDocumentElement(nsIDOMElement * *aDocumentElement); \
  NS_SCRIPTABLE NS_IMETHOD CreateElement(const nsAString & tagName, nsIDOMElement **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateDocumentFragment(nsIDOMDocumentFragment **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateTextNode(const nsAString & data, nsIDOMText **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateComment(const nsAString & data, nsIDOMComment **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateCDATASection(const nsAString & data, nsIDOMCDATASection **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateProcessingInstruction(const nsAString & target, const nsAString & data, nsIDOMProcessingInstruction **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateAttribute(const nsAString & name, nsIDOMAttr **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateEntityReference(const nsAString & name, nsIDOMEntityReference **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagName(const nsAString & tagname, nsIDOMNodeList **_retval); \
  NS_SCRIPTABLE NS_IMETHOD ImportNode(nsIDOMNode *importedNode, PRBool deep, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateElementNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMElement **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMAttr **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetElementById(const nsAString & elementId, nsIDOMElement **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMDOCUMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDoctype(nsIDOMDocumentType * *aDoctype) { return _to GetDoctype(aDoctype); } \
  NS_SCRIPTABLE NS_IMETHOD GetImplementation(nsIDOMDOMImplementation * *aImplementation) { return _to GetImplementation(aImplementation); } \
  NS_SCRIPTABLE NS_IMETHOD GetDocumentElement(nsIDOMElement * *aDocumentElement) { return _to GetDocumentElement(aDocumentElement); } \
  NS_SCRIPTABLE NS_IMETHOD CreateElement(const nsAString & tagName, nsIDOMElement **_retval) { return _to CreateElement(tagName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateDocumentFragment(nsIDOMDocumentFragment **_retval) { return _to CreateDocumentFragment(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateTextNode(const nsAString & data, nsIDOMText **_retval) { return _to CreateTextNode(data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateComment(const nsAString & data, nsIDOMComment **_retval) { return _to CreateComment(data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateCDATASection(const nsAString & data, nsIDOMCDATASection **_retval) { return _to CreateCDATASection(data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateProcessingInstruction(const nsAString & target, const nsAString & data, nsIDOMProcessingInstruction **_retval) { return _to CreateProcessingInstruction(target, data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateAttribute(const nsAString & name, nsIDOMAttr **_retval) { return _to CreateAttribute(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateEntityReference(const nsAString & name, nsIDOMEntityReference **_retval) { return _to CreateEntityReference(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagName(const nsAString & tagname, nsIDOMNodeList **_retval) { return _to GetElementsByTagName(tagname, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ImportNode(nsIDOMNode *importedNode, PRBool deep, nsIDOMNode **_retval) { return _to ImportNode(importedNode, deep, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateElementNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMElement **_retval) { return _to CreateElementNS(namespaceURI, qualifiedName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMAttr **_retval) { return _to CreateAttributeNS(namespaceURI, qualifiedName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval) { return _to GetElementsByTagNameNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementById(const nsAString & elementId, nsIDOMElement **_retval) { return _to GetElementById(elementId, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMDOCUMENT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDoctype(nsIDOMDocumentType * *aDoctype) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDoctype(aDoctype); } \
  NS_SCRIPTABLE NS_IMETHOD GetImplementation(nsIDOMDOMImplementation * *aImplementation) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetImplementation(aImplementation); } \
  NS_SCRIPTABLE NS_IMETHOD GetDocumentElement(nsIDOMElement * *aDocumentElement) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDocumentElement(aDocumentElement); } \
  NS_SCRIPTABLE NS_IMETHOD CreateElement(const nsAString & tagName, nsIDOMElement **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateElement(tagName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateDocumentFragment(nsIDOMDocumentFragment **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateDocumentFragment(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateTextNode(const nsAString & data, nsIDOMText **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateTextNode(data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateComment(const nsAString & data, nsIDOMComment **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateComment(data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateCDATASection(const nsAString & data, nsIDOMCDATASection **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateCDATASection(data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateProcessingInstruction(const nsAString & target, const nsAString & data, nsIDOMProcessingInstruction **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateProcessingInstruction(target, data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateAttribute(const nsAString & name, nsIDOMAttr **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateAttribute(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateEntityReference(const nsAString & name, nsIDOMEntityReference **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateEntityReference(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagName(const nsAString & tagname, nsIDOMNodeList **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetElementsByTagName(tagname, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ImportNode(nsIDOMNode *importedNode, PRBool deep, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImportNode(importedNode, deep, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateElementNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMElement **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateElementNS(namespaceURI, qualifiedName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMAttr **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateAttributeNS(namespaceURI, qualifiedName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetElementsByTagNameNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetElementById(const nsAString & elementId, nsIDOMElement **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetElementById(elementId, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMDocument : public nsIDOMDocument
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMDOCUMENT

  nsDOMDocument();

private:
  ~nsDOMDocument();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMDocument, nsIDOMDocument)

nsDOMDocument::nsDOMDocument()
{
  /* member initializers and constructor code */
}

nsDOMDocument::~nsDOMDocument()
{
  /* destructor code */
}

/* readonly attribute nsIDOMDocumentType doctype; */
NS_IMETHODIMP nsDOMDocument::GetDoctype(nsIDOMDocumentType * *aDoctype)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMDOMImplementation implementation; */
NS_IMETHODIMP nsDOMDocument::GetImplementation(nsIDOMDOMImplementation * *aImplementation)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMElement documentElement; */
NS_IMETHODIMP nsDOMDocument::GetDocumentElement(nsIDOMElement * *aDocumentElement)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMElement createElement (in DOMString tagName)  raises (DOMException); */
NS_IMETHODIMP nsDOMDocument::CreateElement(const nsAString & tagName, nsIDOMElement **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMDocumentFragment createDocumentFragment (); */
NS_IMETHODIMP nsDOMDocument::CreateDocumentFragment(nsIDOMDocumentFragment **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMText createTextNode (in DOMString data); */
NS_IMETHODIMP nsDOMDocument::CreateTextNode(const nsAString & data, nsIDOMText **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMComment createComment (in DOMString data); */
NS_IMETHODIMP nsDOMDocument::CreateComment(const nsAString & data, nsIDOMComment **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMCDATASection createCDATASection (in DOMString data)  raises (DOMException); */
NS_IMETHODIMP nsDOMDocument::CreateCDATASection(const nsAString & data, nsIDOMCDATASection **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMProcessingInstruction createProcessingInstruction (in DOMString target, in DOMString data)  raises (DOMException); */
NS_IMETHODIMP nsDOMDocument::CreateProcessingInstruction(const nsAString & target, const nsAString & data, nsIDOMProcessingInstruction **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMAttr createAttribute (in DOMString name)  raises (DOMException); */
NS_IMETHODIMP nsDOMDocument::CreateAttribute(const nsAString & name, nsIDOMAttr **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMEntityReference createEntityReference (in DOMString name)  raises (DOMException); */
NS_IMETHODIMP nsDOMDocument::CreateEntityReference(const nsAString & name, nsIDOMEntityReference **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNodeList getElementsByTagName (in DOMString tagname); */
NS_IMETHODIMP nsDOMDocument::GetElementsByTagName(const nsAString & tagname, nsIDOMNodeList **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode importNode (in nsIDOMNode importedNode, in boolean deep)  raises (DOMException); */
NS_IMETHODIMP nsDOMDocument::ImportNode(nsIDOMNode *importedNode, PRBool deep, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMElement createElementNS (in DOMString namespaceURI, in DOMString qualifiedName)  raises (DOMException); */
NS_IMETHODIMP nsDOMDocument::CreateElementNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMElement **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMAttr createAttributeNS (in DOMString namespaceURI, in DOMString qualifiedName)  raises (DOMException); */
NS_IMETHODIMP nsDOMDocument::CreateAttributeNS(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMAttr **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNodeList getElementsByTagNameNS (in DOMString namespaceURI, in DOMString localName); */
NS_IMETHODIMP nsDOMDocument::GetElementsByTagNameNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNodeList **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMElement getElementById (in DOMString elementId); */
NS_IMETHODIMP nsDOMDocument::GetElementById(const nsAString & elementId, nsIDOMElement **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMDocument_h__ */
