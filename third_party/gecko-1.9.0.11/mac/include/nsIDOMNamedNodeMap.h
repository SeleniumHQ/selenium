/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/core/nsIDOMNamedNodeMap.idl
 */

#ifndef __gen_nsIDOMNamedNodeMap_h__
#define __gen_nsIDOMNamedNodeMap_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMNamedNodeMap */
#define NS_IDOMNAMEDNODEMAP_IID_STR "a6cf907b-15b3-11d2-932e-00805f8add32"

#define NS_IDOMNAMEDNODEMAP_IID \
  {0xa6cf907b, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMNamedNodeMap : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMNAMEDNODEMAP_IID)

  /**
 * Objects implementing the nsIDOMNamedNodeMap interface are used to 
 * represent collections of nodes that can be accessed by name.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Core/
 *
 * @status FROZEN
 */
  /* nsIDOMNode getNamedItem (in DOMString name); */
  NS_SCRIPTABLE NS_IMETHOD GetNamedItem(const nsAString & name, nsIDOMNode **_retval) = 0;

  /* nsIDOMNode setNamedItem (in nsIDOMNode arg)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetNamedItem(nsIDOMNode *arg, nsIDOMNode **_retval) = 0;

  /* nsIDOMNode removeNamedItem (in DOMString name)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD RemoveNamedItem(const nsAString & name, nsIDOMNode **_retval) = 0;

  /* nsIDOMNode item (in unsigned long index); */
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval) = 0;

  /* readonly attribute unsigned long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) = 0;

  /* nsIDOMNode getNamedItemNS (in DOMString namespaceURI, in DOMString localName); */
  NS_SCRIPTABLE NS_IMETHOD GetNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval) = 0;

  /* nsIDOMNode setNamedItemNS (in nsIDOMNode arg)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD SetNamedItemNS(nsIDOMNode *arg, nsIDOMNode **_retval) = 0;

  /* nsIDOMNode removeNamedItemNS (in DOMString namespaceURI, in DOMString localName)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD RemoveNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMNamedNodeMap, NS_IDOMNAMEDNODEMAP_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMNAMEDNODEMAP \
  NS_SCRIPTABLE NS_IMETHOD GetNamedItem(const nsAString & name, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetNamedItem(nsIDOMNode *arg, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD RemoveNamedItem(const nsAString & name, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength); \
  NS_SCRIPTABLE NS_IMETHOD GetNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetNamedItemNS(nsIDOMNode *arg, nsIDOMNode **_retval); \
  NS_SCRIPTABLE NS_IMETHOD RemoveNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMNAMEDNODEMAP(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetNamedItem(const nsAString & name, nsIDOMNode **_retval) { return _to GetNamedItem(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetNamedItem(nsIDOMNode *arg, nsIDOMNode **_retval) { return _to SetNamedItem(arg, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveNamedItem(const nsAString & name, nsIDOMNode **_retval) { return _to RemoveNamedItem(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval) { return _to Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return _to GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval) { return _to GetNamedItemNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetNamedItemNS(nsIDOMNode *arg, nsIDOMNode **_retval) { return _to SetNamedItemNS(arg, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval) { return _to RemoveNamedItemNS(namespaceURI, localName, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMNAMEDNODEMAP(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetNamedItem(const nsAString & name, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNamedItem(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetNamedItem(nsIDOMNode *arg, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNamedItem(arg, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveNamedItem(const nsAString & name, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveNamedItem(name, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNamedItemNS(namespaceURI, localName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetNamedItemNS(nsIDOMNode *arg, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNamedItemNS(arg, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveNamedItemNS(namespaceURI, localName, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMNamedNodeMap : public nsIDOMNamedNodeMap
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMNAMEDNODEMAP

  nsDOMNamedNodeMap();

private:
  ~nsDOMNamedNodeMap();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMNamedNodeMap, nsIDOMNamedNodeMap)

nsDOMNamedNodeMap::nsDOMNamedNodeMap()
{
  /* member initializers and constructor code */
}

nsDOMNamedNodeMap::~nsDOMNamedNodeMap()
{
  /* destructor code */
}

/* nsIDOMNode getNamedItem (in DOMString name); */
NS_IMETHODIMP nsDOMNamedNodeMap::GetNamedItem(const nsAString & name, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode setNamedItem (in nsIDOMNode arg)  raises (DOMException); */
NS_IMETHODIMP nsDOMNamedNodeMap::SetNamedItem(nsIDOMNode *arg, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode removeNamedItem (in DOMString name)  raises (DOMException); */
NS_IMETHODIMP nsDOMNamedNodeMap::RemoveNamedItem(const nsAString & name, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode item (in unsigned long index); */
NS_IMETHODIMP nsDOMNamedNodeMap::Item(PRUint32 index, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned long length; */
NS_IMETHODIMP nsDOMNamedNodeMap::GetLength(PRUint32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode getNamedItemNS (in DOMString namespaceURI, in DOMString localName); */
NS_IMETHODIMP nsDOMNamedNodeMap::GetNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode setNamedItemNS (in nsIDOMNode arg)  raises (DOMException); */
NS_IMETHODIMP nsDOMNamedNodeMap::SetNamedItemNS(nsIDOMNode *arg, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMNode removeNamedItemNS (in DOMString namespaceURI, in DOMString localName)  raises (DOMException); */
NS_IMETHODIMP nsDOMNamedNodeMap::RemoveNamedItemNS(const nsAString & namespaceURI, const nsAString & localName, nsIDOMNode **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMNamedNodeMap_h__ */
