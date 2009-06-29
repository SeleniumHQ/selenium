/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/base/nsIDOMBarProp.idl
 */

#ifndef __gen_nsIDOMBarProp_h__
#define __gen_nsIDOMBarProp_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMBarProp */
#define NS_IDOMBARPROP_IID_STR "9eb2c150-1d56-11d3-8221-0060083a0bcf"

#define NS_IDOMBARPROP_IID \
  {0x9eb2c150, 0x1d56, 0x11d3, \
    { 0x82, 0x21, 0x00, 0x60, 0x08, 0x3a, 0x0b, 0xcf }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMBarProp : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMBARPROP_IID)

  /**
 * The nsIDOMBarProp interface is the interface for controlling and
 * accessing the visibility of certain UI items (scrollbars, menubars,
 * toolbars, ...) through the DOM.
 *
 * @status FROZEN
 */
  /* attribute boolean visible; */
  NS_SCRIPTABLE NS_IMETHOD GetVisible(PRBool *aVisible) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVisible(PRBool aVisible) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMBarProp, NS_IDOMBARPROP_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMBARPROP \
  NS_SCRIPTABLE NS_IMETHOD GetVisible(PRBool *aVisible); \
  NS_SCRIPTABLE NS_IMETHOD SetVisible(PRBool aVisible); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMBARPROP(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetVisible(PRBool *aVisible) { return _to GetVisible(aVisible); } \
  NS_SCRIPTABLE NS_IMETHOD SetVisible(PRBool aVisible) { return _to SetVisible(aVisible); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMBARPROP(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetVisible(PRBool *aVisible) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVisible(aVisible); } \
  NS_SCRIPTABLE NS_IMETHOD SetVisible(PRBool aVisible) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVisible(aVisible); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMBarProp : public nsIDOMBarProp
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMBARPROP

  nsDOMBarProp();

private:
  ~nsDOMBarProp();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMBarProp, nsIDOMBarProp)

nsDOMBarProp::nsDOMBarProp()
{
  /* member initializers and constructor code */
}

nsDOMBarProp::~nsDOMBarProp()
{
  /* destructor code */
}

/* attribute boolean visible; */
NS_IMETHODIMP nsDOMBarProp::GetVisible(PRBool *aVisible)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMBarProp::SetVisible(PRBool aVisible)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMBarProp_h__ */
