/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/core/nsIDOMCDATASection.idl
 */

#ifndef __gen_nsIDOMCDATASection_h__
#define __gen_nsIDOMCDATASection_h__


#ifndef __gen_nsIDOMText_h__
#include "nsIDOMText.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMCDATASection */
#define NS_IDOMCDATASECTION_IID_STR "a6cf9071-15b3-11d2-932e-00805f8add32"

#define NS_IDOMCDATASECTION_IID \
  {0xa6cf9071, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMCDATASection : public nsIDOMText {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMCDATASECTION_IID)

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMCDATASection, NS_IDOMCDATASECTION_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMCDATASECTION \
  /* no methods! */

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMCDATASECTION(_to) \
  /* no methods! */

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMCDATASECTION(_to) \
  /* no methods! */

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMCDATASection : public nsIDOMCDATASection
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMCDATASECTION

  nsDOMCDATASection();

private:
  ~nsDOMCDATASection();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMCDATASection, nsIDOMCDATASection)

nsDOMCDATASection::nsDOMCDATASection()
{
  /* member initializers and constructor code */
}

nsDOMCDATASection::~nsDOMCDATASection()
{
  /* destructor code */
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMCDATASection_h__ */
