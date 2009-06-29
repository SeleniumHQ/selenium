/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/range/nsIDOMRange.idl
 */

#ifndef __gen_nsIDOMRange_h__
#define __gen_nsIDOMRange_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMRange */
#define NS_IDOMRANGE_IID_STR "a6cf90ce-15b3-11d2-932e-00805f8add32"

#define NS_IDOMRANGE_IID \
  {0xa6cf90ce, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMRange : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMRANGE_IID)

  /**
 * The nsIDOMRange interface is an interface to a DOM range object.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Traversal-Range/
 *
 * @status FROZEN
 */
  /* readonly attribute nsIDOMNode startContainer; */
  NS_SCRIPTABLE NS_IMETHOD GetStartContainer(nsIDOMNode * *aStartContainer) = 0;

  /* readonly attribute long startOffset; */
  NS_SCRIPTABLE NS_IMETHOD GetStartOffset(PRInt32 *aStartOffset) = 0;

  /* readonly attribute nsIDOMNode endContainer; */
  NS_SCRIPTABLE NS_IMETHOD GetEndContainer(nsIDOMNode * *aEndContainer) = 0;

  /* readonly attribute long endOffset; */
  NS_SCRIPTABLE NS_IMETHOD GetEndOffset(PRInt32 *aEndOffset) = 0;

  /* readonly attribute boolean collapsed; */
  NS_SCRIPTABLE NS_IMETHOD GetCollapsed(PRBool *aCollapsed) = 0;

  /* readonly attribute nsIDOMNode commonAncestorContainer; */
  NS_SCRIPTABLE NS_IMETHOD GetCommonAncestorContainer(nsIDOMNode * *aCommonAncestorContainer) = 0;

  /* void setStart (in nsIDOMNode refNode, in long offset)  raises (RangeException, DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetStart(nsIDOMNode *refNode, PRInt32 offset) = 0;

  /* void setEnd (in nsIDOMNode refNode, in long offset)  raises (RangeException, DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetEnd(nsIDOMNode *refNode, PRInt32 offset) = 0;

  /* void setStartBefore (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetStartBefore(nsIDOMNode *refNode) = 0;

  /* void setStartAfter (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetStartAfter(nsIDOMNode *refNode) = 0;

  /* void setEndBefore (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetEndBefore(nsIDOMNode *refNode) = 0;

  /* void setEndAfter (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetEndAfter(nsIDOMNode *refNode) = 0;

  /* void collapse (in boolean toStart)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD Collapse(PRBool toStart) = 0;

  /* void selectNode (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SelectNode(nsIDOMNode *refNode) = 0;

  /* void selectNodeContents (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SelectNodeContents(nsIDOMNode *refNode) = 0;

  enum { START_TO_START = 0U };

  enum { START_TO_END = 1U };

  enum { END_TO_END = 2U };

  enum { END_TO_START = 3U };

  /* short compareBoundaryPoints (in unsigned short how, in nsIDOMRange sourceRange)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CompareBoundaryPoints(PRUint16 how, nsIDOMRange *sourceRange, PRInt16 *_retval) = 0;

  /* void deleteContents ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD DeleteContents(void) = 0;

  /* nsIDOMDocumentFragment extractContents ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD ExtractContents(nsIDOMDocumentFragment **_retval) = 0;

  /* nsIDOMDocumentFragment cloneContents ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CloneContents(nsIDOMDocumentFragment **_retval) = 0;

  /* void insertNode (in nsIDOMNode newNode)  raises (DOMException, RangeException); */
  NS_SCRIPTABLE NS_IMETHOD InsertNode(nsIDOMNode *newNode) = 0;

  /* void surroundContents (in nsIDOMNode newParent)  raises (DOMException, RangeException); */
  NS_SCRIPTABLE NS_IMETHOD SurroundContents(nsIDOMNode *newParent) = 0;

  /* nsIDOMRange cloneRange ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CloneRange(nsIDOMRange **_retval) = 0;

  /* DOMString toString ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD ToString(nsAString & _retval) = 0;

  /* void detach ()  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD Detach(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMRange, NS_IDOMRANGE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMRANGE \
  NS_SCRIPTABLE NS_IMETHOD GetStartContainer(nsIDOMNode * *aStartContainer); \
  NS_SCRIPTABLE NS_IMETHOD GetStartOffset(PRInt32 *aStartOffset); \
  NS_SCRIPTABLE NS_IMETHOD GetEndContainer(nsIDOMNode * *aEndContainer); \
  NS_SCRIPTABLE NS_IMETHOD GetEndOffset(PRInt32 *aEndOffset); \
  NS_SCRIPTABLE NS_IMETHOD GetCollapsed(PRBool *aCollapsed); \
  NS_SCRIPTABLE NS_IMETHOD GetCommonAncestorContainer(nsIDOMNode * *aCommonAncestorContainer); \
  NS_SCRIPTABLE NS_IMETHOD SetStart(nsIDOMNode *refNode, PRInt32 offset); \
  NS_SCRIPTABLE NS_IMETHOD SetEnd(nsIDOMNode *refNode, PRInt32 offset); \
  NS_SCRIPTABLE NS_IMETHOD SetStartBefore(nsIDOMNode *refNode); \
  NS_SCRIPTABLE NS_IMETHOD SetStartAfter(nsIDOMNode *refNode); \
  NS_SCRIPTABLE NS_IMETHOD SetEndBefore(nsIDOMNode *refNode); \
  NS_SCRIPTABLE NS_IMETHOD SetEndAfter(nsIDOMNode *refNode); \
  NS_SCRIPTABLE NS_IMETHOD Collapse(PRBool toStart); \
  NS_SCRIPTABLE NS_IMETHOD SelectNode(nsIDOMNode *refNode); \
  NS_SCRIPTABLE NS_IMETHOD SelectNodeContents(nsIDOMNode *refNode); \
  NS_SCRIPTABLE NS_IMETHOD CompareBoundaryPoints(PRUint16 how, nsIDOMRange *sourceRange, PRInt16 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD DeleteContents(void); \
  NS_SCRIPTABLE NS_IMETHOD ExtractContents(nsIDOMDocumentFragment **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CloneContents(nsIDOMDocumentFragment **_retval); \
  NS_SCRIPTABLE NS_IMETHOD InsertNode(nsIDOMNode *newNode); \
  NS_SCRIPTABLE NS_IMETHOD SurroundContents(nsIDOMNode *newParent); \
  NS_SCRIPTABLE NS_IMETHOD CloneRange(nsIDOMRange **_retval); \
  NS_SCRIPTABLE NS_IMETHOD ToString(nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD Detach(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMRANGE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetStartContainer(nsIDOMNode * *aStartContainer) { return _to GetStartContainer(aStartContainer); } \
  NS_SCRIPTABLE NS_IMETHOD GetStartOffset(PRInt32 *aStartOffset) { return _to GetStartOffset(aStartOffset); } \
  NS_SCRIPTABLE NS_IMETHOD GetEndContainer(nsIDOMNode * *aEndContainer) { return _to GetEndContainer(aEndContainer); } \
  NS_SCRIPTABLE NS_IMETHOD GetEndOffset(PRInt32 *aEndOffset) { return _to GetEndOffset(aEndOffset); } \
  NS_SCRIPTABLE NS_IMETHOD GetCollapsed(PRBool *aCollapsed) { return _to GetCollapsed(aCollapsed); } \
  NS_SCRIPTABLE NS_IMETHOD GetCommonAncestorContainer(nsIDOMNode * *aCommonAncestorContainer) { return _to GetCommonAncestorContainer(aCommonAncestorContainer); } \
  NS_SCRIPTABLE NS_IMETHOD SetStart(nsIDOMNode *refNode, PRInt32 offset) { return _to SetStart(refNode, offset); } \
  NS_SCRIPTABLE NS_IMETHOD SetEnd(nsIDOMNode *refNode, PRInt32 offset) { return _to SetEnd(refNode, offset); } \
  NS_SCRIPTABLE NS_IMETHOD SetStartBefore(nsIDOMNode *refNode) { return _to SetStartBefore(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD SetStartAfter(nsIDOMNode *refNode) { return _to SetStartAfter(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD SetEndBefore(nsIDOMNode *refNode) { return _to SetEndBefore(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD SetEndAfter(nsIDOMNode *refNode) { return _to SetEndAfter(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD Collapse(PRBool toStart) { return _to Collapse(toStart); } \
  NS_SCRIPTABLE NS_IMETHOD SelectNode(nsIDOMNode *refNode) { return _to SelectNode(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD SelectNodeContents(nsIDOMNode *refNode) { return _to SelectNodeContents(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD CompareBoundaryPoints(PRUint16 how, nsIDOMRange *sourceRange, PRInt16 *_retval) { return _to CompareBoundaryPoints(how, sourceRange, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteContents(void) { return _to DeleteContents(); } \
  NS_SCRIPTABLE NS_IMETHOD ExtractContents(nsIDOMDocumentFragment **_retval) { return _to ExtractContents(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CloneContents(nsIDOMDocumentFragment **_retval) { return _to CloneContents(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD InsertNode(nsIDOMNode *newNode) { return _to InsertNode(newNode); } \
  NS_SCRIPTABLE NS_IMETHOD SurroundContents(nsIDOMNode *newParent) { return _to SurroundContents(newParent); } \
  NS_SCRIPTABLE NS_IMETHOD CloneRange(nsIDOMRange **_retval) { return _to CloneRange(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(nsAString & _retval) { return _to ToString(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD Detach(void) { return _to Detach(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMRANGE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetStartContainer(nsIDOMNode * *aStartContainer) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetStartContainer(aStartContainer); } \
  NS_SCRIPTABLE NS_IMETHOD GetStartOffset(PRInt32 *aStartOffset) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetStartOffset(aStartOffset); } \
  NS_SCRIPTABLE NS_IMETHOD GetEndContainer(nsIDOMNode * *aEndContainer) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEndContainer(aEndContainer); } \
  NS_SCRIPTABLE NS_IMETHOD GetEndOffset(PRInt32 *aEndOffset) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEndOffset(aEndOffset); } \
  NS_SCRIPTABLE NS_IMETHOD GetCollapsed(PRBool *aCollapsed) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCollapsed(aCollapsed); } \
  NS_SCRIPTABLE NS_IMETHOD GetCommonAncestorContainer(nsIDOMNode * *aCommonAncestorContainer) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCommonAncestorContainer(aCommonAncestorContainer); } \
  NS_SCRIPTABLE NS_IMETHOD SetStart(nsIDOMNode *refNode, PRInt32 offset) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetStart(refNode, offset); } \
  NS_SCRIPTABLE NS_IMETHOD SetEnd(nsIDOMNode *refNode, PRInt32 offset) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetEnd(refNode, offset); } \
  NS_SCRIPTABLE NS_IMETHOD SetStartBefore(nsIDOMNode *refNode) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetStartBefore(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD SetStartAfter(nsIDOMNode *refNode) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetStartAfter(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD SetEndBefore(nsIDOMNode *refNode) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetEndBefore(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD SetEndAfter(nsIDOMNode *refNode) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetEndAfter(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD Collapse(PRBool toStart) { return !_to ? NS_ERROR_NULL_POINTER : _to->Collapse(toStart); } \
  NS_SCRIPTABLE NS_IMETHOD SelectNode(nsIDOMNode *refNode) { return !_to ? NS_ERROR_NULL_POINTER : _to->SelectNode(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD SelectNodeContents(nsIDOMNode *refNode) { return !_to ? NS_ERROR_NULL_POINTER : _to->SelectNodeContents(refNode); } \
  NS_SCRIPTABLE NS_IMETHOD CompareBoundaryPoints(PRUint16 how, nsIDOMRange *sourceRange, PRInt16 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CompareBoundaryPoints(how, sourceRange, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteContents(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteContents(); } \
  NS_SCRIPTABLE NS_IMETHOD ExtractContents(nsIDOMDocumentFragment **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ExtractContents(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CloneContents(nsIDOMDocumentFragment **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CloneContents(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD InsertNode(nsIDOMNode *newNode) { return !_to ? NS_ERROR_NULL_POINTER : _to->InsertNode(newNode); } \
  NS_SCRIPTABLE NS_IMETHOD SurroundContents(nsIDOMNode *newParent) { return !_to ? NS_ERROR_NULL_POINTER : _to->SurroundContents(newParent); } \
  NS_SCRIPTABLE NS_IMETHOD CloneRange(nsIDOMRange **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CloneRange(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD ToString(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToString(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD Detach(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Detach(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMRange : public nsIDOMRange
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMRANGE

  nsDOMRange();

private:
  ~nsDOMRange();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMRange, nsIDOMRange)

nsDOMRange::nsDOMRange()
{
  /* member initializers and constructor code */
}

nsDOMRange::~nsDOMRange()
{
  /* destructor code */
}

/* readonly attribute nsIDOMNode startContainer; */
NS_IMETHODIMP nsDOMRange::GetStartContainer(nsIDOMNode * *aStartContainer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long startOffset; */
NS_IMETHODIMP nsDOMRange::GetStartOffset(PRInt32 *aStartOffset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNode endContainer; */
NS_IMETHODIMP nsDOMRange::GetEndContainer(nsIDOMNode * *aEndContainer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long endOffset; */
NS_IMETHODIMP nsDOMRange::GetEndOffset(PRInt32 *aEndOffset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean collapsed; */
NS_IMETHODIMP nsDOMRange::GetCollapsed(PRBool *aCollapsed)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMNode commonAncestorContainer; */
NS_IMETHODIMP nsDOMRange::GetCommonAncestorContainer(nsIDOMNode * *aCommonAncestorContainer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setStart (in nsIDOMNode refNode, in long offset)  raises (RangeException, DOMException); */
NS_IMETHODIMP nsDOMRange::SetStart(nsIDOMNode *refNode, PRInt32 offset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setEnd (in nsIDOMNode refNode, in long offset)  raises (RangeException, DOMException); */
NS_IMETHODIMP nsDOMRange::SetEnd(nsIDOMNode *refNode, PRInt32 offset)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setStartBefore (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
NS_IMETHODIMP nsDOMRange::SetStartBefore(nsIDOMNode *refNode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setStartAfter (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
NS_IMETHODIMP nsDOMRange::SetStartAfter(nsIDOMNode *refNode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setEndBefore (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
NS_IMETHODIMP nsDOMRange::SetEndBefore(nsIDOMNode *refNode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setEndAfter (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
NS_IMETHODIMP nsDOMRange::SetEndAfter(nsIDOMNode *refNode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void collapse (in boolean toStart)  raises (DOMException); */
NS_IMETHODIMP nsDOMRange::Collapse(PRBool toStart)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void selectNode (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
NS_IMETHODIMP nsDOMRange::SelectNode(nsIDOMNode *refNode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void selectNodeContents (in nsIDOMNode refNode)  raises (RangeException, DOMException); */
NS_IMETHODIMP nsDOMRange::SelectNodeContents(nsIDOMNode *refNode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* short compareBoundaryPoints (in unsigned short how, in nsIDOMRange sourceRange)  raises (DOMException); */
NS_IMETHODIMP nsDOMRange::CompareBoundaryPoints(PRUint16 how, nsIDOMRange *sourceRange, PRInt16 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteContents ()  raises (DOMException); */
NS_IMETHODIMP nsDOMRange::DeleteContents()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMDocumentFragment extractContents ()  raises (DOMException); */
NS_IMETHODIMP nsDOMRange::ExtractContents(nsIDOMDocumentFragment **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMDocumentFragment cloneContents ()  raises (DOMException); */
NS_IMETHODIMP nsDOMRange::CloneContents(nsIDOMDocumentFragment **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void insertNode (in nsIDOMNode newNode)  raises (DOMException, RangeException); */
NS_IMETHODIMP nsDOMRange::InsertNode(nsIDOMNode *newNode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void surroundContents (in nsIDOMNode newParent)  raises (DOMException, RangeException); */
NS_IMETHODIMP nsDOMRange::SurroundContents(nsIDOMNode *newParent)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMRange cloneRange ()  raises (DOMException); */
NS_IMETHODIMP nsDOMRange::CloneRange(nsIDOMRange **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* DOMString toString ()  raises (DOMException); */
NS_IMETHODIMP nsDOMRange::ToString(nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void detach ()  raises (DOMException); */
NS_IMETHODIMP nsDOMRange::Detach()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMRange_h__ */
