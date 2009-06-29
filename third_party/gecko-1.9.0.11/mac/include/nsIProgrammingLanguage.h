/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/xpcom/base/nsIProgrammingLanguage.idl
 */

#ifndef __gen_nsIProgrammingLanguage_h__
#define __gen_nsIProgrammingLanguage_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
#ifdef XP_OS2 // OS2 has UNKNOWN problems :)
#undef UNKNOWN
#endif

/* starting interface:    nsIProgrammingLanguage */
#define NS_IPROGRAMMINGLANGUAGE_IID_STR "ea604e90-40ba-11d5-90bb-0010a4e73d9a"

#define NS_IPROGRAMMINGLANGUAGE_IID \
  {0xea604e90, 0x40ba, 0x11d5, \
    { 0x90, 0xbb, 0x00, 0x10, 0xa4, 0xe7, 0x3d, 0x9a }}

/**
 * Enumeration of Programming Languages
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIProgrammingLanguage : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IPROGRAMMINGLANGUAGE_IID)

  /**
     * Identifiers for programming languages.
     */
  enum { UNKNOWN = 0U };

  enum { CPLUSPLUS = 1U };

  enum { JAVASCRIPT = 2U };

  enum { PYTHON = 3U };

  enum { PERL = 4U };

  enum { JAVA = 5U };

  enum { ZX81_BASIC = 6U };

  enum { JAVASCRIPT2 = 7U };

  enum { RUBY = 8U };

  enum { PHP = 9U };

  enum { TCL = 10U };

  enum { MAX = 10U };

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIProgrammingLanguage, NS_IPROGRAMMINGLANGUAGE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIPROGRAMMINGLANGUAGE \

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIPROGRAMMINGLANGUAGE(_to) \

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIPROGRAMMINGLANGUAGE(_to) \

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsProgrammingLanguage : public nsIProgrammingLanguage
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPROGRAMMINGLANGUAGE

  nsProgrammingLanguage();

private:
  ~nsProgrammingLanguage();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsProgrammingLanguage, nsIProgrammingLanguage)

nsProgrammingLanguage::nsProgrammingLanguage()
{
  /* member initializers and constructor code */
}

nsProgrammingLanguage::~nsProgrammingLanguage()
{
  /* destructor code */
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIProgrammingLanguage_h__ */
