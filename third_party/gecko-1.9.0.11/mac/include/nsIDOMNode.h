/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/core/nsIDOMNode.idl
 */

#ifndef __gen_nsIDOMNode_h__
#define __gen_nsIDOMNode_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMNode */
#define NS_IDOMNODE_IID_STR "a6cf907c-15b3-11d2-932e-00805f8add32"

#define NS_IDOMNODE_IID \
  {0xa6cf907c, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMNode : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMNODE_IID)

  /**
 * The nsIDOMNode interface is the primary datatype for the entire 
 * Document Object Model.
 * It represents a single node in the document tree.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Core/
 *
 * @status FROZEN
 */
  enum { ELEMENT_NODE = 1U };

  enum { ATTRIBUTE_NODE = 2U };

  enum { TEXT_NODE = 3U };

  enum { CDATA_SECTION_NODE = 4U };

  enum { ENTITY_REFERENCE_NODE = 5U };

  enum { ENTITY_NODE = 6U };

  enum { PROCESSING_INSTRUCTION_NODE = 7U };

  enum { COMMENT_NODE = 8U };

  enum { DOCUMENT_NODE = 9U };

  enum { DOCUMENT_TYPE_NODE = 10U };

  enum { DOCUMENT_FRAGMENT_NODE = 11U };

  enum { NOTATION_NODE = 12U };

  /* readonly attribute DOMString nodeName; */
  NS_SCRIPTABLE NS_IMETHOD GetNodeName(nsAString & aNodeName) = 0;

  /* attribute DOMString nodeValue; */
  NS_SCRIPTABLE NS_IMETHOD GetNodeValue(nsAString & aNodeValue) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetNodeValue(const nsAString & aNodeValue) = 0;

  /* readonly attribute unsigned short nodeType; */
  NS_SCRIPTABLE NS_IMETHOD GetNodeType(PRUint16 *aNodeType) = 0;

  /* readonly attribute nsIDOMNode parentNode; */
  NS_SCRIPTABLE NS_IMETHOD GetParentNode(nsIDOMNode * *aParentNode) = 0;

  /* readonly attribute nsIDOMNodeList childNodes; */
  NS_SCRIPTABLE NS_IMETHOD GetChildNodes(nsIDOMNodeList * *aChildNodes) = 0;

  /* readonly attribute nsIDOMNode firstChild; */
  NS_SCRIPTABLE NS_IMETHOD GetFirstChild(nsIDOMNode * *aFirstChild) = 0;

  /* readonly attribute nsIDOMNode lastChild; */
  NS_SCRIPTABLE NS_IMETHOD GetLastChild(nsIDOMNode * *aLastChild) = 0;

  /* readonly attribute nsIDOMNode previousSibling; */
  NS_SCRIPTABLE NS_IMETHOD GetPreviousSibling(nsIDOMNode * *aPreviousSibling) = 0;

  /* readonly attribute nsIDOMNode nextSibling; */
  NS_SCRIPTABLE NS_IMETHOD GetNextSibling(nsIDOMNode * *aNextSibling) = 0;

  /* readonly attribute nsIDOMNamedNodeMap attributes; */
  NS_SCRIPTABLE NS_IMETHOD GetAttributes(nsIDOMNamedNodeMap * *aAttributes) = 0;

  /* readonly attribute nsIDOMDocument ownerDocument; */
  NS_SCRIPTABLE NS_IMETHOD GetOwnerDocument(nsIDOMDocument * *aOwnerDocument) = 0;

  /* nsIDOMNode insertBefore (in nsIDOMNode newChild, in nsIDOMNode refChild)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD InsertBefore(nsIDOMNode *newChild, nsIDOMNode *refChild, nsIDOMNode **_retval) = 0;

  /* nsIDOMNode replaceChild (in nsIDOMNode newChild, in nsIDOMNode oldChild)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD ReplaceChild(nsIDOMNode *newChild, nsIDOMNode *oldChild, nsIDOMNode **_retval) = 0;

  /* nsIDOMNode removeChild (in nsIDOMNode oldChild)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD RemoveChild(nsIDOMNode *oldChild, nsIDOMNode **_retval) = 0;

  /* nsIDOMNode appendChild (in nsIDOMNode newChild)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD AppendChild(nsIDOMNode *newChild, nsIDOMNode **_retval) = 0;

  /* boolean hasChildNodes (); */
  NS_SCRIPTABLE NS_IMETHOD HasChildNodes(PRBool *_retval) = 0;

  /* nsIDOMNode cloneNode (in boolean deep); */
  NS_SCRIPTABLE NS_IMETHOD CloneNode(PRBool deep, nsIDOMNode **_retval) = 0;

  /* void normalize (); */
  NS_SCRIPTABLE NS_IMETHOD Normalize(void) = 0;

  /* boolean isSupported (in DOMString feature, in DOMString version); */
  NS_SCRIPTABLE NS_IMETHOD IsSupported(const nsAString & feature, const nsAString & version, PRBool *_retval) = 0;

  /* readonly attribute DOMString namespaceURI; */
  NS_SCRIPTABLE NS_IMETHOD GetNamespaceURI(nsAString & aNamespaceURI) = 0;

  /* attribute DOMString prefix; */
  NS_SCRIPTABLE NS_IMETHOD GetPrefix(nsAString & aPrefix) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPrefix(const nsAString & aPrefix) = 0;

  /* readonly attribute DOMString localName; */
  NS_SCRIPTABLE NS_IMETHOD GetLocalName(nsAString & aLocalName) = 0;

  /* boolean hasAttributes (); */
  NS_SCRIPTABLE NS_IMETHOD HasAttributes(PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMNode, NS_IDOMNODE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMNODE \
  NS_SCRIPTABLE NS_IMETHOD GetNodeName(nsAString & aNodeName); \
  NS_SCRIPTABLE NS_IMETHOD GetNodeValue(nsAString & aNodeValue); \
  NS_SCRIPTABLE NS_IMETHOD SetNodeValue(const nsAString & aNodeValue); \
  NS_SCRIPTABLE NS_IMETHOD GetNodeType(PRUint16 *aNodeType); \
  NS_SCRIPTABLE NS_IMETHOD GetParentNode(nsIDOMNode * *aParentNode); \
  NS_SCRIPTABLE NS_IMETHOD GetChildNodes(nsIDOMNodeList * *aChildNodes); \
  NS_SCRIPTABLE NS_IMETHOD GetFirstChild(nsIDOMNode * *aFirstChild); \
  NS_SCRIPTABLE NS_IMETHOD GetLastChild(nsIDOMNode * *aLastChild); \
  NS_SCRIPTABLE NS_IMETHOD GetPreviousSibling(nsIDOMNode * *aPreviousSibling); \
  NS_SCRIPTABLE NS_IMETHOD GetNextSibling(nsIDOMNode * *aNextSibling); \
  NS_SCRIPTABLE NS_IMETHOD GetAttributes(nsIDOMNamedNodeMap * *aAttributes); \
  NS_SCRIPTABLE NS_IMETHOD GetOwnerDocument(nsIDOMDocument * *aOwnerDocument); \
  NS_SCRIPTABLE NS_IMETHOD InsertBefore(nsIDOMNode *newChild, nsIDOMNode *refChild, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD ReplaceChild(nsIDOMNode *newChild, nsIDOMNode *oldChild, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD RemoveChild(nsIDOMNode *oldChild, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD AppendChild(nsIDOMNode *newChild, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD HasChildNodes(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CloneNode(PRBool deep, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD Normalize(void); \
  NS_SCRIPTABLE NS_IMETHOD IsSupported(const nsAString & feature, const nsAString & version, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetNamespaceURI(nsAString & aNamespaceURI); \
  NS_SCRIPTABLE NS_IMETHOD GetPrefix(nsAString & aPrefix); \
  NS_SCRIPTABLE NS_IMETHOD SetPrefix(const nsAString & aPrefix); \
  NS_SCRIPTABLE NS_IMETHOD GetLocalName(nsAString & aLocalName); \
  NS_SCRIPTABLE NS_IMETHOD HasAttributes(PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMNODE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetNodeName(nsAString & aNodeName) { return _to GetNodeName(aNodeName); } \
  NS_SCRIPTABLE NS_IMETHOD GetNodeValue(nsAString & aNodeValue) { return _to GetNodeValue(aNodeValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetNodeValue(const nsAString & aNodeValue) { return _to SetNodeValue(aNodeValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetNodeType(PRUint16 *aNodeType) { return _to GetNodeType(aNodeType); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentNode(nsIDOMNode * *aParentNode) { return _to GetParentNode(aParentNode); } \
  NS_SCRIPTABLE NS_IMETHOD GetChildNodes(nsIDOMNodeList * *aChildNodes) { return _to GetChildNodes(aChildNodes); } \
  NS_SCRIPTABLE NS_IMETHOD GetFirstChild(nsIDOMNode * *aFirstChild) { return _to GetFirstChild(aFirstChild); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastChild(nsIDOMNode * *aLastChild) { return _to GetLastChild(aLastChild); } \
  NS_SCRIPTABLE NS_IMETHOD GetPreviousSibling(nsIDOMNode * *aPreviousSibling) { return _to GetPreviousSibling(aPreviousSibling); } \
  NS_SCRIPTABLE NS_IMETHOD GetNextSibling(nsIDOMNode * *aNextSibling) { return _to GetNextSibling(aNextSibling); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttributes(nsIDOMNamedNodeMap * *aAttributes) { return _to GetAttributes(aAttributes); } \
  NS_SCRIPTABLE NS_IMETHOD GetOwnerDocument(nsIDOMDocument * *aOwnerDocument) { return _to GetOwnerDocument(aOwnerDocument); } \
  NS_SCRIPTABLE NS_IMETHOD InsertBefore(nsIDOMNode *newChild, nsIDOMNode *refChild, nsIDOMNode **_retval) { return _to InsertBefore(newChild, refChild, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ReplaceChild(nsIDOMNode *newChild, nsIDOMNode *oldChild, nsIDOMNode **_retval) { return _to ReplaceChild(newChild, oldChild, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveChild(nsIDOMNode *oldChild, nsIDOMNode **_retval) { return _to RemoveChild(oldChild, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AppendChild(nsIDOMNode *newChild, nsIDOMNode **_retval) { return _to AppendChild(newChild, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HasChildNodes(PRBool *_retval) { return _to HasChildNodes(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CloneNode(PRBool deep, nsIDOMNode **_retval) { return _to CloneNode(deep, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Normalize(void) { return _to Normalize(); } \
  NS_SCRIPTABLE NS_IMETHOD IsSupported(const nsAString & feature, const nsAString & version, PRBool *_retval) { return _to IsSupported(feature, version, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetNamespaceURI(nsAString & aNamespaceURI) { return _to GetNamespaceURI(aNamespaceURI); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrefix(nsAString & aPrefix) { return _to GetPrefix(aPrefix); } \
  NS_SCRIPTABLE NS_IMETHOD SetPrefix(const nsAString & aPrefix) { return _to SetPrefix(aPrefix); } \
  NS_SCRIPTABLE NS_IMETHOD GetLocalName(nsAString & aLocalName) { return _to GetLocalName(aLocalName); } \
  NS_SCRIPTABLE NS_IMETHOD HasAttributes(PRBool *_retval) { return _to HasAttributes(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMNODE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetNodeName(nsAString & aNodeName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNodeName(aNodeName); } \
  NS_SCRIPTABLE NS_IMETHOD GetNodeValue(nsAString & aNodeValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNodeValue(aNodeValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetNodeValue(const nsAString & aNodeValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNodeValue(aNodeValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetNodeType(PRUint16 *aNodeType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNodeType(aNodeType); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentNode(nsIDOMNode * *aParentNode) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentNode(aParentNode); } \
  NS_SCRIPTABLE NS_IMETHOD GetChildNodes(nsIDOMNodeList * *aChildNodes) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChildNodes(aChildNodes); } \
  NS_SCRIPTABLE NS_IMETHOD GetFirstChild(nsIDOMNode * *aFirstChild) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFirstChild(aFirstChild); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastChild(nsIDOMNode * *aLastChild) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLastChild(aLastChild); } \
  NS_SCRIPTABLE NS_IMETHOD GetPreviousSibling(nsIDOMNode * *aPreviousSibling) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPreviousSibling(aPreviousSibling); } \
  NS_SCRIPTABLE NS_IMETHOD GetNextSibling(nsIDOMNode * *aNextSibling) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNextSibling(aNextSibling); } \
  NS_SCRIPTABLE NS_IMETHOD GetAttributes(nsIDOMNamedNodeMap * *aAttributes) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAttributes(aAttributes); } \
  NS_SCRIPTABLE NS_IMETHOD GetOwnerDocument(nsIDOMDocument * *aOwnerDocument) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOwnerDocument(aOwnerDocument); } \
  NS_SCRIPTABLE NS_IMETHOD InsertBefore(nsIDOMNode *newChild, nsIDOMNode *refChild, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->InsertBefore(newChild, refChild, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ReplaceChild(nsIDOMNode *newChild, nsIDOMNode *oldChild, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReplaceChild(newChild, oldChild, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveChild(nsIDOMNode *oldChild, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveChild(oldChild, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AppendChild(nsIDOMNode *newChild, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->AppendChild(newChild, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HasChildNodes(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->HasChildNodes(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CloneNode(PRBool deep, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CloneNode(deep, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Normalize(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Normalize(); } \
  NS_SCRIPTABLE NS_IMETHOD IsSupported(const nsAString & feature, const nsAString & version, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsSupported(feature, version, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetNamespaceURI(nsAString & aNamespaceURI) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNamespaceURI(aNamespaceURI); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrefix(nsAString & aPrefix) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPrefix(aPrefix); } \
  NS_SCRIPTABLE NS_IMETHOD SetPrefix(const nsAString & aPrefix) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPrefix(aPrefix); } \
  NS_SCRIPTABLE NS_IMETHOD GetLocalName(nsAString & aLocalName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLocalName(aLocalName); } \
  NS_SCRIPTABLE NS_IMETHOD HasAttributes(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->HasAttributes(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMNode : public nsIDOMNode
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMNODE

  nsDOMNode();

private:
  ~nsDOMNode();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMNode, nsIDOMNode)

nsDOMNode::nsDOMNode()
{
  /* member initializers and constructor code */
}

nsDOMNode::~nsDOMNode()
{
  /* destructor code */
}

/* readonly attribute DOMString nodeName; */
NS_IMETHODIMP nsDOMNode::GetNodeName(nsAString & aNodeName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString nodeValue; */
NS_IMETHODIMP nsDOMNode::GetNodeValue(nsAString & aNodeValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMNode::SetNodeValue(const nsAString & aNodeValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned short nodeType; */
NS_IMETHODIMP nsDOMNode::GetNodeType(PRUint16 *aNodeType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNode parentNode; */
NS_IMETHODIMP nsDOMNode::GetParentNode(nsIDOMNode * *aParentNode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNodeList childNodes; */
NS_IMETHODIMP nsDOMNode::GetChildNodes(nsIDOMNodeList * *aChildNodes)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNode firstChild; */
NS_IMETHODIMP nsDOMNode::GetFirstChild(nsIDOMNode * *aFirstChild)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNode lastChild; */
NS_IMETHODIMP nsDOMNode::GetLastChild(nsIDOMNode * *aLastChild)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNode previousSibling; */
NS_IMETHODIMP nsDOMNode::GetPreviousSibling(nsIDOMNode * *aPreviousSibling)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNode nextSibling; */
NS_IMETHODIMP nsDOMNode::GetNextSibling(nsIDOMNode * *aNextSibling)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNamedNodeMap attributes; */
NS_IMETHODIMP nsDOMNode::GetAttributes(nsIDOMNamedNodeMap * *aAttributes)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMDocument ownerDocument; */
NS_IMETHODIMP nsDOMNode::GetOwnerDocument(nsIDOMDocument * *aOwnerDocument)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode insertBefore (in nsIDOMNode newChild, in nsIDOMNode refChild)  raises (DOMException); */
NS_IMETHODIMP nsDOMNode::InsertBefore(nsIDOMNode *newChild, nsIDOMNode *refChild, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode replaceChild (in nsIDOMNode newChild, in nsIDOMNode oldChild)  raises (DOMException); */
NS_IMETHODIMP nsDOMNode::ReplaceChild(nsIDOMNode *newChild, nsIDOMNode *oldChild, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode removeChild (in nsIDOMNode oldChild)  raises (DOMException); */
NS_IMETHODIMP nsDOMNode::RemoveChild(nsIDOMNode *oldChild, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode appendChild (in nsIDOMNode newChild)  raises (DOMException); */
NS_IMETHODIMP nsDOMNode::AppendChild(nsIDOMNode *newChild, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean hasChildNodes (); */
NS_IMETHODIMP nsDOMNode::HasChildNodes(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode cloneNode (in boolean deep); */
NS_IMETHODIMP nsDOMNode::CloneNode(PRBool deep, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void normalize (); */
NS_IMETHODIMP nsDOMNode::Normalize()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isSupported (in DOMString feature, in DOMString version); */
NS_IMETHODIMP nsDOMNode::IsSupported(const nsAString & feature, const nsAString & version, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString namespaceURI; */
NS_IMETHODIMP nsDOMNode::GetNamespaceURI(nsAString & aNamespaceURI)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString prefix; */
NS_IMETHODIMP nsDOMNode::GetPrefix(nsAString & aPrefix)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMNode::SetPrefix(const nsAString & aPrefix)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute DOMString localName; */
NS_IMETHODIMP nsDOMNode::GetLocalName(nsAString & aLocalName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean hasAttributes (); */
NS_IMETHODIMP nsDOMNode::HasAttributes(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMNode_h__ */
