/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM cpp/webdriver-firefox/nsINativeIME.idl
 */

#ifndef __gen_nsINativeIME_h__
#define __gen_nsINativeIME_h__


#ifndef __gen_nsIArray_h__
#include "nsIArray.h"
#endif

#ifndef __gen_nsIMutableArray_h__
#include "nsIMutableArray.h"
#endif

#ifndef __gen_nsISupportsPrimitives_h__
#include "nsISupportsPrimitives.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsINativeIME */
#define NS_INATIVEIME_IID_STR "475d9d96-c3d7-4f93-bb30-69b04a39ba04"

#define NS_INATIVEIME_IID \
  {0x475d9d96, 0xc3d7, 0x4f93, \
    { 0xbb, 0x30, 0x69, 0xb0, 0x4a, 0x39, 0xba, 0x04 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsINativeIME : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_INATIVEIME_IID)

  /* void imeGetAvailableEngines (out nsIArray enginesList); */
  NS_SCRIPTABLE NS_IMETHOD ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM) = 0;

  /* void imeActivateEngine (in string engine, out boolean activationSucceeded); */
  NS_SCRIPTABLE NS_IMETHOD ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM) = 0;

  /* void imeIsActivated (out boolean isActive); */
  NS_SCRIPTABLE NS_IMETHOD ImeIsActivated(PRBool *isActive NS_OUTPARAM) = 0;

  /* void imeGetActiveEngine (out AString activeEngine); */
  NS_SCRIPTABLE NS_IMETHOD ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM) = 0;

  /* void imeDeactivate (); */
  NS_SCRIPTABLE NS_IMETHOD ImeDeactivate(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsINativeIME, NS_INATIVEIME_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSINATIVEIME \
  NS_SCRIPTABLE NS_IMETHOD ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD ImeIsActivated(PRBool *isActive NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM); \
  NS_SCRIPTABLE NS_IMETHOD ImeDeactivate(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSINATIVEIME(_to) \
  NS_SCRIPTABLE NS_IMETHOD ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM) { return _to ImeGetAvailableEngines(enginesList); } \
  NS_SCRIPTABLE NS_IMETHOD ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM) { return _to ImeActivateEngine(engine, activationSucceeded); } \
  NS_SCRIPTABLE NS_IMETHOD ImeIsActivated(PRBool *isActive NS_OUTPARAM) { return _to ImeIsActivated(isActive); } \
  NS_SCRIPTABLE NS_IMETHOD ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM) { return _to ImeGetActiveEngine(activeEngine); } \
  NS_SCRIPTABLE NS_IMETHOD ImeDeactivate(void) { return _to ImeDeactivate(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSINATIVEIME(_to) \
  NS_SCRIPTABLE NS_IMETHOD ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeGetAvailableEngines(enginesList); } \
  NS_SCRIPTABLE NS_IMETHOD ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeActivateEngine(engine, activationSucceeded); } \
  NS_SCRIPTABLE NS_IMETHOD ImeIsActivated(PRBool *isActive NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeIsActivated(isActive); } \
  NS_SCRIPTABLE NS_IMETHOD ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeGetActiveEngine(activeEngine); } \
  NS_SCRIPTABLE NS_IMETHOD ImeDeactivate(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->ImeDeactivate(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsNativeIME : public nsINativeIME
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSINATIVEIME

  nsNativeIME();

private:
  ~nsNativeIME();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsNativeIME, nsINativeIME)

nsNativeIME::nsNativeIME()
{
  /* member initializers and constructor code */
}

nsNativeIME::~nsNativeIME()
{
  /* destructor code */
}

/* void imeGetAvailableEngines (out nsIArray enginesList); */
NS_IMETHODIMP nsNativeIME::ImeGetAvailableEngines(nsIArray **enginesList NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void imeActivateEngine (in string engine, out boolean activationSucceeded); */
NS_IMETHODIMP nsNativeIME::ImeActivateEngine(const char *engine, PRBool *activationSucceeded NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void imeIsActivated (out boolean isActive); */
NS_IMETHODIMP nsNativeIME::ImeIsActivated(PRBool *isActive NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void imeGetActiveEngine (out AString activeEngine); */
NS_IMETHODIMP nsNativeIME::ImeGetActiveEngine(nsAString & activeEngine NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void imeDeactivate (); */
NS_IMETHODIMP nsNativeIME::ImeDeactivate()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsINativeIME_h__ */
