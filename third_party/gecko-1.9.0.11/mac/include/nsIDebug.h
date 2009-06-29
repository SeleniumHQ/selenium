/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/xpcom/base/nsIDebug.idl
 */

#ifndef __gen_nsIDebug_h__
#define __gen_nsIDebug_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDebug */
#define NS_IDEBUG_IID_STR "3bf0c3d7-3bd9-4cf2-a971-33572c503e1e"

#define NS_IDEBUG_IID \
  {0x3bf0c3d7, 0x3bd9, 0x4cf2, \
    { 0xa9, 0x71, 0x33, 0x57, 0x2c, 0x50, 0x3e, 0x1e }}

/**
 * @status DEPRECATED  Replaced by the NS_DebugBreak function.
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIDebug : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDEBUG_IID)

  /* void assertion (in string aStr, in string aExpr, in string aFile, in long aLine); */
  NS_SCRIPTABLE NS_IMETHOD Assertion(const char *aStr, const char *aExpr, const char *aFile, PRInt32 aLine) = 0;

  /* void warning (in string aStr, in string aFile, in long aLine); */
  NS_SCRIPTABLE NS_IMETHOD Warning(const char *aStr, const char *aFile, PRInt32 aLine) = 0;

  /* void break (in string aFile, in long aLine); */
  NS_SCRIPTABLE NS_IMETHOD Break(const char *aFile, PRInt32 aLine) = 0;

  /* void abort (in string aFile, in long aLine); */
  NS_SCRIPTABLE NS_IMETHOD Abort(const char *aFile, PRInt32 aLine) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDebug, NS_IDEBUG_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDEBUG \
  NS_SCRIPTABLE NS_IMETHOD Assertion(const char *aStr, const char *aExpr, const char *aFile, PRInt32 aLine); \
  NS_SCRIPTABLE NS_IMETHOD Warning(const char *aStr, const char *aFile, PRInt32 aLine); \
  NS_SCRIPTABLE NS_IMETHOD Break(const char *aFile, PRInt32 aLine); \
  NS_SCRIPTABLE NS_IMETHOD Abort(const char *aFile, PRInt32 aLine); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDEBUG(_to) \
  NS_SCRIPTABLE NS_IMETHOD Assertion(const char *aStr, const char *aExpr, const char *aFile, PRInt32 aLine) { return _to Assertion(aStr, aExpr, aFile, aLine); } \
  NS_SCRIPTABLE NS_IMETHOD Warning(const char *aStr, const char *aFile, PRInt32 aLine) { return _to Warning(aStr, aFile, aLine); } \
  NS_SCRIPTABLE NS_IMETHOD Break(const char *aFile, PRInt32 aLine) { return _to Break(aFile, aLine); } \
  NS_SCRIPTABLE NS_IMETHOD Abort(const char *aFile, PRInt32 aLine) { return _to Abort(aFile, aLine); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDEBUG(_to) \
  NS_SCRIPTABLE NS_IMETHOD Assertion(const char *aStr, const char *aExpr, const char *aFile, PRInt32 aLine) { return !_to ? NS_ERROR_NULL_POINTER : _to->Assertion(aStr, aExpr, aFile, aLine); } \
  NS_SCRIPTABLE NS_IMETHOD Warning(const char *aStr, const char *aFile, PRInt32 aLine) { return !_to ? NS_ERROR_NULL_POINTER : _to->Warning(aStr, aFile, aLine); } \
  NS_SCRIPTABLE NS_IMETHOD Break(const char *aFile, PRInt32 aLine) { return !_to ? NS_ERROR_NULL_POINTER : _to->Break(aFile, aLine); } \
  NS_SCRIPTABLE NS_IMETHOD Abort(const char *aFile, PRInt32 aLine) { return !_to ? NS_ERROR_NULL_POINTER : _to->Abort(aFile, aLine); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDebug : public nsIDebug
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDEBUG

  nsDebug();

private:
  ~nsDebug();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDebug, nsIDebug)

nsDebug::nsDebug()
{
  /* member initializers and constructor code */
}

nsDebug::~nsDebug()
{
  /* destructor code */
}

/* void assertion (in string aStr, in string aExpr, in string aFile, in long aLine); */
NS_IMETHODIMP nsDebug::Assertion(const char *aStr, const char *aExpr, const char *aFile, PRInt32 aLine)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void warning (in string aStr, in string aFile, in long aLine); */
NS_IMETHODIMP nsDebug::Warning(const char *aStr, const char *aFile, PRInt32 aLine)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void break (in string aFile, in long aLine); */
NS_IMETHODIMP nsDebug::Break(const char *aFile, PRInt32 aLine)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void abort (in string aFile, in long aLine); */
NS_IMETHODIMP nsDebug::Abort(const char *aFile, PRInt32 aLine)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDebug_h__ */
