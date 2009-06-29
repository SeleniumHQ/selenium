/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/js/src/xpconnect/idl/mozIJSSubScriptLoader.idl
 */

#ifndef __gen_mozIJSSubScriptLoader_h__
#define __gen_mozIJSSubScriptLoader_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    mozIJSSubScriptLoader */
#define MOZIJSSUBSCRIPTLOADER_IID_STR "8792d77e-1dd2-11b2-ac7f-9bc9be4f2916"

#define MOZIJSSUBSCRIPTLOADER_IID \
  {0x8792d77e, 0x1dd2, 0x11b2, \
    { 0xac, 0x7f, 0x9b, 0xc9, 0xbe, 0x4f, 0x29, 0x16 }}

class NS_NO_VTABLE NS_SCRIPTABLE mozIJSSubScriptLoader : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(MOZIJSSUBSCRIPTLOADER_IID)

  /**
     * This method should only be called from JS!
     * In JS, the signature looks like:
     * rv loadSubScript (url [, obj]);
     * @param url the url if the sub-script, it MUST be either a file:,
     *            resource:, or chrome: url, and MUST be local.
     * @param obj an optional object to evaluate the script onto, it
     *            defaults to the global object of the caller.
     * @retval rv the value returned by the sub-script
     */
  /* void loadSubScript (in wstring url); */
  NS_SCRIPTABLE NS_IMETHOD LoadSubScript(const PRUnichar *url) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(mozIJSSubScriptLoader, MOZIJSSUBSCRIPTLOADER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_MOZIJSSUBSCRIPTLOADER \
  NS_SCRIPTABLE NS_IMETHOD LoadSubScript(const PRUnichar *url); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_MOZIJSSUBSCRIPTLOADER(_to) \
  NS_SCRIPTABLE NS_IMETHOD LoadSubScript(const PRUnichar *url) { return _to LoadSubScript(url); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_MOZIJSSUBSCRIPTLOADER(_to) \
  NS_SCRIPTABLE NS_IMETHOD LoadSubScript(const PRUnichar *url) { return !_to ? NS_ERROR_NULL_POINTER : _to->LoadSubScript(url); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public mozIJSSubScriptLoader
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_MOZIJSSUBSCRIPTLOADER

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, mozIJSSubScriptLoader)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* void loadSubScript (in wstring url); */
NS_IMETHODIMP _MYCLASS_::LoadSubScript(const PRUnichar *url)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_mozIJSSubScriptLoader_h__ */
