/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/core/nsIDOMDOMException.idl
 */

#ifndef __gen_nsIDOMDOMException_h__
#define __gen_nsIDOMDOMException_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMDOMException */
#define NS_IDOMDOMEXCEPTION_IID_STR "a6cf910a-15b3-11d2-932e-00805f8add32"

#define NS_IDOMDOMEXCEPTION_IID \
  {0xa6cf910a, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

/**
 * In general, DOM methods return specific error values in ordinary
 * processing situations, such as out-of-bound errors.
 * However, DOM operations can raise exceptions in "exceptional"
 * circumstances, i.e., when an operation is impossible to perform
 * (either for logical reasons, because data is lost, or because the
 * implementation has become unstable)
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-3-Core/
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMDOMException : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMDOMEXCEPTION_IID)

  enum { INDEX_SIZE_ERR = 1U };

  enum { DOMSTRING_SIZE_ERR = 2U };

  enum { HIERARCHY_REQUEST_ERR = 3U };

  enum { WRONG_DOCUMENT_ERR = 4U };

  enum { INVALID_CHARACTER_ERR = 5U };

  enum { NO_DATA_ALLOWED_ERR = 6U };

  enum { NO_MODIFICATION_ALLOWED_ERR = 7U };

  enum { NOT_FOUND_ERR = 8U };

  enum { NOT_SUPPORTED_ERR = 9U };

  enum { INUSE_ATTRIBUTE_ERR = 10U };

  enum { INVALID_STATE_ERR = 11U };

  enum { SYNTAX_ERR = 12U };

  enum { INVALID_MODIFICATION_ERR = 13U };

  enum { NAMESPACE_ERR = 14U };

  enum { INVALID_ACCESS_ERR = 15U };

  enum { VALIDATION_ERR = 16U };

  enum { TYPE_MISMATCH_ERR = 17U };

  /* readonly attribute unsigned long code; */
  NS_SCRIPTABLE NS_IMETHOD GetCode(PRUint32 *aCode) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMDOMException, NS_IDOMDOMEXCEPTION_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMDOMEXCEPTION \
  NS_SCRIPTABLE NS_IMETHOD GetCode(PRUint32 *aCode); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMDOMEXCEPTION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCode(PRUint32 *aCode) { return _to GetCode(aCode); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMDOMEXCEPTION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCode(PRUint32 *aCode) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCode(aCode); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMDOMException : public nsIDOMDOMException
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMDOMEXCEPTION

  nsDOMDOMException();

private:
  ~nsDOMDOMException();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMDOMException, nsIDOMDOMException)

nsDOMDOMException::nsDOMDOMException()
{
  /* member initializers and constructor code */
}

nsDOMDOMException::~nsDOMDOMException()
{
  /* destructor code */
}

/* readonly attribute unsigned long code; */
NS_IMETHODIMP nsDOMDOMException::GetCode(PRUint32 *aCode)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMDOMException_h__ */
