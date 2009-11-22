/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM nsIAccessibleDocument.idl
 */

#ifndef __gen_nsIAccessibleDocument_18_h__
#define __gen_nsIAccessibleDocument_18_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIAccessible; /* forward declaration */

class nsIAccessNode; /* forward declaration */

class nsIDOMDocument; /* forward declaration */

class nsIDOMNode; /* forward declaration */

class nsIDOMWindow; /* forward declaration */


/* starting interface:    nsIAccessibleDocument */
#define NS_IACCESSIBLEDOCUMENT_18_IID_STR "8781fc88-355f-4439-881f-6504a0a1ceb6"

#define NS_IACCESSIBLEDOCUMENT_18_IID \
  {0x8781fc88, 0x355f, 0x4439, \
    { 0x88, 0x1f, 0x65, 0x04, 0xa0, 0xa1, 0xce, 0xb6 }}

/**
 * An interface for in-process accessibility clients
 * that wish to retrieve information about a document.
 * When accessibility is turned on in Gecko,
 * there is an nsIAccessibleDocument for each document
 * whether it is XUL, HTML or whatever.
 * You can QueryInterface to nsIAccessibleDocument from
 * the nsIAccessible or nsIAccessNode for the root node
 * of a document. You can also get one from 
 * nsIAccessNode::GetAccessibleDocument() or 
 * nsIAccessibleEvent::GetAccessibleDocument()
 *
 * @status UNDER_REVIEW
 */
class NS_NO_VTABLE nsIAccessibleDocument_18 : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IACCESSIBLEDOCUMENT_18_IID)

  /**
   * The URL of the document
   */
  /* readonly attribute AString URL; */
  NS_IMETHOD GetURL(nsAString & aURL) = 0;

  /**
   * The title of the document, as specified in the document.
   */
  /* readonly attribute AString title; */
  NS_IMETHOD GetTitle(nsAString & aTitle) = 0;

  /**
   * The mime type of the document
   */
  /* readonly attribute AString mimeType; */
  NS_IMETHOD GetMimeType(nsAString & aMimeType) = 0;

  /**
   * The doc type of the document, as specified in the document.
   */
  /* readonly attribute AString docType; */
  NS_IMETHOD GetDocType(nsAString & aDocType) = 0;

  /**
   * True if the document is live in an editor.
   * False if the document is being displayed but not edited. 
   * If a <div> is contentEditable, then it has its own document, 
   * with isEditable == true.
   */
  /* readonly attribute boolean isEditable; */
  NS_IMETHOD GetIsEditable(PRBool *aIsEditable) = 0;

  /**
   * The nsIDOMDocument interface associated with this document.
   */
  /* readonly attribute nsIDOMDocument document; */
  NS_IMETHOD GetDocument(nsIDOMDocument * *aDocument) = 0;

  /**
   * The nsIDOMWindow that the document resides in.
   */
  /* readonly attribute nsIDOMWindow window; */
  NS_IMETHOD GetWindow(nsIDOMWindow * *aWindow) = 0;

  /* readonly attribute nsIAccessible caretAccessible; */
  NS_IMETHOD GetCaretAccessible(nsIAccessible * *aCaretAccessible) = 0;

  /**
   * The namespace for each ID that is handed back.
   */
  /* AString getNameSpaceURIForID (in short nameSpaceID); */
  NS_IMETHOD GetNameSpaceURIForID(PRInt16 nameSpaceID, nsAString & _retval) = 0;

  /**
   * The window handle for the OS window the document is being displayed in.
   * For example, in Windows you can static cast it to an HWND.
   */
  /* [noscript] readonly attribute voidPtr windowHandle; */
  NS_IMETHOD GetWindowHandle(void * *aWindowHandle) = 0;

  /**
   * Returns the access node cached by this document
   * @param aUniqueID The unique ID used to cache the node.
   *                  This matches up with the uniqueID attribute on
   *                  nsIAccessNode.
   * @return The nsIAccessNode cached for this particular unique ID.
   */
  /* [noscript] nsIAccessNode getCachedAccessNode (in voidPtr aUniqueID); */
  NS_IMETHOD GetCachedAccessNode(void * aUniqueID, nsIAccessNode **_retval) = 0;

  /**
   * Returns the first accessible parent of a DOM node.
   * Guaranteed not to return nsnull if the DOM node is in a document.
   * @param aDOMNode The DOM node we need an accessible for.
   * @return An first nsIAccessible found by crawling up the DOM node
   *         to the document root.
   */
  /* nsIAccessible getAccessibleInParentChain (in nsIDOMNode aDOMNode); */
  NS_IMETHOD GetAccessibleInParentChain(nsIDOMNode *aDOMNode, nsIAccessible **_retval) = 0;

};

NS_DEFINE_STATIC_IID_ACCESSOR(nsIAccessibleDocument_18, NS_IACCESSIBLEDOCUMENT_18_IID)


/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIACCESSIBLEDOCUMENT_18 \
  NS_IMETHOD GetURL(nsAString & aURL); \
  NS_IMETHOD GetTitle(nsAString & aTitle); \
  NS_IMETHOD GetMimeType(nsAString & aMimeType); \
  NS_IMETHOD GetDocType(nsAString & aDocType); \
  NS_IMETHOD GetIsEditable(PRBool *aIsEditable); \
  NS_IMETHOD GetDocument(nsIDOMDocument * *aDocument); \
  NS_IMETHOD GetWindow(nsIDOMWindow * *aWindow); \
  NS_IMETHOD GetCaretAccessible(nsIAccessible * *aCaretAccessible); \
  NS_IMETHOD GetNameSpaceURIForID(PRInt16 nameSpaceID, nsAString & _retval); \
  NS_IMETHOD GetWindowHandle(void * *aWindowHandle); \
  NS_IMETHOD GetCachedAccessNode(void * aUniqueID, nsIAccessNode **_retval); \
  NS_IMETHOD GetAccessibleInParentChain(nsIDOMNode *aDOMNode, nsIAccessible **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIACCESSIBLEDOCUMENT_18(_to) \
  NS_IMETHOD GetURL(nsAString & aURL) { return _to GetURL(aURL); } \
  NS_IMETHOD GetTitle(nsAString & aTitle) { return _to GetTitle(aTitle); } \
  NS_IMETHOD GetMimeType(nsAString & aMimeType) { return _to GetMimeType(aMimeType); } \
  NS_IMETHOD GetDocType(nsAString & aDocType) { return _to GetDocType(aDocType); } \
  NS_IMETHOD GetIsEditable(PRBool *aIsEditable) { return _to GetIsEditable(aIsEditable); } \
  NS_IMETHOD GetDocument(nsIDOMDocument * *aDocument) { return _to GetDocument(aDocument); } \
  NS_IMETHOD GetWindow(nsIDOMWindow * *aWindow) { return _to GetWindow(aWindow); } \
  NS_IMETHOD GetCaretAccessible(nsIAccessible * *aCaretAccessible) { return _to GetCaretAccessible(aCaretAccessible); } \
  NS_IMETHOD GetNameSpaceURIForID(PRInt16 nameSpaceID, nsAString & _retval) { return _to GetNameSpaceURIForID(nameSpaceID, _retval); } \
  NS_IMETHOD GetWindowHandle(void * *aWindowHandle) { return _to GetWindowHandle(aWindowHandle); } \
  NS_IMETHOD GetCachedAccessNode(void * aUniqueID, nsIAccessNode **_retval) { return _to GetCachedAccessNode(aUniqueID, _retval); } \
  NS_IMETHOD GetAccessibleInParentChain(nsIDOMNode *aDOMNode, nsIAccessible **_retval) { return _to GetAccessibleInParentChain(aDOMNode, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIACCESSIBLEDOCUMENT_18(_to) \
  NS_IMETHOD GetURL(nsAString & aURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetURL(aURL); } \
  NS_IMETHOD GetTitle(nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_IMETHOD GetMimeType(nsAString & aMimeType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMimeType(aMimeType); } \
  NS_IMETHOD GetDocType(nsAString & aDocType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDocType(aDocType); } \
  NS_IMETHOD GetIsEditable(PRBool *aIsEditable) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsEditable(aIsEditable); } \
  NS_IMETHOD GetDocument(nsIDOMDocument * *aDocument) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDocument(aDocument); } \
  NS_IMETHOD GetWindow(nsIDOMWindow * *aWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWindow(aWindow); } \
  NS_IMETHOD GetCaretAccessible(nsIAccessible * *aCaretAccessible) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCaretAccessible(aCaretAccessible); } \
  NS_IMETHOD GetNameSpaceURIForID(PRInt16 nameSpaceID, nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNameSpaceURIForID(nameSpaceID, _retval); } \
  NS_IMETHOD GetWindowHandle(void * *aWindowHandle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWindowHandle(aWindowHandle); } \
  NS_IMETHOD GetCachedAccessNode(void * aUniqueID, nsIAccessNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCachedAccessNode(aUniqueID, _retval); } \
  NS_IMETHOD GetAccessibleInParentChain(nsIDOMNode *aDOMNode, nsIAccessible **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAccessibleInParentChain(aDOMNode, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsAccessibleDocument : public nsIAccessibleDocument
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIACCESSIBLEDOCUMENT

  nsAccessibleDocument();

private:
  ~nsAccessibleDocument();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsAccessibleDocument, nsIAccessibleDocument)

nsAccessibleDocument::nsAccessibleDocument()
{
  /* member initializers and constructor code */
}

nsAccessibleDocument::~nsAccessibleDocument()
{
  /* destructor code */
}

/* readonly attribute AString URL; */
NS_IMETHODIMP nsAccessibleDocument::GetURL(nsAString & aURL)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString title; */
NS_IMETHODIMP nsAccessibleDocument::GetTitle(nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString mimeType; */
NS_IMETHODIMP nsAccessibleDocument::GetMimeType(nsAString & aMimeType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString docType; */
NS_IMETHODIMP nsAccessibleDocument::GetDocType(nsAString & aDocType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean isEditable; */
NS_IMETHODIMP nsAccessibleDocument::GetIsEditable(PRBool *aIsEditable)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMDocument document; */
NS_IMETHODIMP nsAccessibleDocument::GetDocument(nsIDOMDocument * *aDocument)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMWindow window; */
NS_IMETHODIMP nsAccessibleDocument::GetWindow(nsIDOMWindow * *aWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIAccessible caretAccessible; */
NS_IMETHODIMP nsAccessibleDocument::GetCaretAccessible(nsIAccessible * *aCaretAccessible)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* AString getNameSpaceURIForID (in short nameSpaceID); */
NS_IMETHODIMP nsAccessibleDocument::GetNameSpaceURIForID(PRInt16 nameSpaceID, nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] readonly attribute voidPtr windowHandle; */
NS_IMETHODIMP nsAccessibleDocument::GetWindowHandle(void * *aWindowHandle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] nsIAccessNode getCachedAccessNode (in voidPtr aUniqueID); */
NS_IMETHODIMP nsAccessibleDocument::GetCachedAccessNode(void * aUniqueID, nsIAccessNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIAccessible getAccessibleInParentChain (in nsIDOMNode aDOMNode); */
NS_IMETHODIMP nsAccessibleDocument::GetAccessibleInParentChain(nsIDOMNode *aDOMNode, nsIAccessible **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIAccessibleDocument_18_h__ */
