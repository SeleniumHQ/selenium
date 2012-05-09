/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM cpp/webdriver-firefox/nsINativeKeyboard.idl
 */

#ifndef __gen_nsINativeKeyboard_h__
#define __gen_nsINativeKeyboard_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsISupportsPrimitives_h__
#include "nsISupportsPrimitives.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsINativeKeyboard */
#define NS_INATIVEKEYBOARD_IID_STR "50380a2d-ab4f-4b3f-9a27-cc7dbba07ee7"

#define NS_INATIVEKEYBOARD_IID \
  {0x50380a2d, 0xab4f, 0x4b3f, \
    { 0x9a, 0x27, 0xcc, 0x7d, 0xbb, 0xa0, 0x7e, 0xe7 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsINativeKeyboard : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_INATIVEKEYBOARD_IID)

  /* void sendKeys (in nsISupports aNode, in wstring value, in boolean releaseModifiers); */
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value, PRBool releaseModifiers) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsINativeKeyboard, NS_INATIVEKEYBOARD_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSINATIVEKEYBOARD \
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value, PRBool releaseModifiers); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSINATIVEKEYBOARD(_to) \
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value, PRBool releaseModifiers) { return _to SendKeys(aNode, value, releaseModifiers); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSINATIVEKEYBOARD(_to) \
  NS_SCRIPTABLE NS_IMETHOD SendKeys(nsISupports *aNode, const PRUnichar *value, PRBool releaseModifiers) { return !_to ? NS_ERROR_NULL_POINTER : _to->SendKeys(aNode, value, releaseModifiers); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsNativeKeyboard : public nsINativeKeyboard
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSINATIVEKEYBOARD

  nsNativeKeyboard();

private:
  ~nsNativeKeyboard();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsNativeKeyboard, nsINativeKeyboard)

nsNativeKeyboard::nsNativeKeyboard()
{
  /* member initializers and constructor code */
}

nsNativeKeyboard::~nsNativeKeyboard()
{
  /* destructor code */
}

/* void sendKeys (in nsISupports aNode, in wstring value, in boolean releaseModifiers); */
NS_IMETHODIMP nsNativeKeyboard::SendKeys(nsISupports *aNode, const PRUnichar *value, PRBool releaseModifiers)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsINativeKeyboard_h__ */
