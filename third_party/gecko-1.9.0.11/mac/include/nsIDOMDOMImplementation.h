/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/core/nsIDOMDOMImplementation.idl
 */

#ifndef __gen_nsIDOMDOMImplementation_h__
#define __gen_nsIDOMDOMImplementation_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMDOMImplementation */
#define NS_IDOMDOMIMPLEMENTATION_IID_STR "a6cf9074-15b3-11d2-932e-00805f8add32"

#define NS_IDOMDOMIMPLEMENTATION_IID \
  {0xa6cf9074, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMDOMImplementation : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMDOMIMPLEMENTATION_IID)

  /**
 * The nsIDOMDOMImplementation interface provides a number of methods for 
 * performing operations that are independent of any particular instance 
 * of the document object model.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Core/
 *
 * @status FROZEN
 */
  /* boolean hasFeature (in DOMString feature, in DOMString version); */
  NS_SCRIPTABLE NS_IMETHOD HasFeature(const nsAString & feature, const nsAString & version, PRBool *_retval) = 0;

  /* nsIDOMDocumentType createDocumentType (in DOMString qualifiedName, in DOMString publicId, in DOMString systemId)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateDocumentType(const nsAString & qualifiedName, const nsAString & publicId, const nsAString & systemId, nsIDOMDocumentType **_retval) = 0;

  /* nsIDOMDocument createDocument (in DOMString namespaceURI, in DOMString qualifiedName, in nsIDOMDocumentType doctype)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD CreateDocument(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMDocumentType *doctype, nsIDOMDocument **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMDOMImplementation, NS_IDOMDOMIMPLEMENTATION_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMDOMIMPLEMENTATION \
  NS_SCRIPTABLE NS_IMETHOD HasFeature(const nsAString & feature, const nsAString & version, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateDocumentType(const nsAString & qualifiedName, const nsAString & publicId, const nsAString & systemId, nsIDOMDocumentType **_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateDocument(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMDocumentType *doctype, nsIDOMDocument **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMDOMIMPLEMENTATION(_to) \
  NS_SCRIPTABLE NS_IMETHOD HasFeature(const nsAString & feature, const nsAString & version, PRBool *_retval) { return _to HasFeature(feature, version, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateDocumentType(const nsAString & qualifiedName, const nsAString & publicId, const nsAString & systemId, nsIDOMDocumentType **_retval) { return _to CreateDocumentType(qualifiedName, publicId, systemId, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateDocument(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMDocumentType *doctype, nsIDOMDocument **_retval) { return _to CreateDocument(namespaceURI, qualifiedName, doctype, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMDOMIMPLEMENTATION(_to) \
  NS_SCRIPTABLE NS_IMETHOD HasFeature(const nsAString & feature, const nsAString & version, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->HasFeature(feature, version, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateDocumentType(const nsAString & qualifiedName, const nsAString & publicId, const nsAString & systemId, nsIDOMDocumentType **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateDocumentType(qualifiedName, publicId, systemId, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateDocument(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMDocumentType *doctype, nsIDOMDocument **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateDocument(namespaceURI, qualifiedName, doctype, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMDOMImplementation : public nsIDOMDOMImplementation
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMDOMIMPLEMENTATION

  nsDOMDOMImplementation();

private:
  ~nsDOMDOMImplementation();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMDOMImplementation, nsIDOMDOMImplementation)

nsDOMDOMImplementation::nsDOMDOMImplementation()
{
  /* member initializers and constructor code */
}

nsDOMDOMImplementation::~nsDOMDOMImplementation()
{
  /* destructor code */
}

/* boolean hasFeature (in DOMString feature, in DOMString version); */
NS_IMETHODIMP nsDOMDOMImplementation::HasFeature(const nsAString & feature, const nsAString & version, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMDocumentType createDocumentType (in DOMString qualifiedName, in DOMString publicId, in DOMString systemId)  raises (DOMException); */
NS_IMETHODIMP nsDOMDOMImplementation::CreateDocumentType(const nsAString & qualifiedName, const nsAString & publicId, const nsAString & systemId, nsIDOMDocumentType **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMDocument createDocument (in DOMString namespaceURI, in DOMString qualifiedName, in nsIDOMDocumentType doctype)  raises (DOMException); */
NS_IMETHODIMP nsDOMDOMImplementation::CreateDocument(const nsAString & namespaceURI, const nsAString & qualifiedName, nsIDOMDocumentType *doctype, nsIDOMDocument **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMDOMImplementation_h__ */
