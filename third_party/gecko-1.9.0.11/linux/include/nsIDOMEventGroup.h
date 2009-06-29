/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/events/nsIDOMEventGroup.idl
 */

#ifndef __gen_nsIDOMEventGroup_h__
#define __gen_nsIDOMEventGroup_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMEventGroup */
#define NS_IDOMEVENTGROUP_IID_STR "33347bee-6620-4841-8152-36091ae80c7e"

#define NS_IDOMEVENTGROUP_IID \
  {0x33347bee, 0x6620, 0x4841, \
    { 0x81, 0x52, 0x36, 0x09, 0x1a, 0xe8, 0x0c, 0x7e }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMEventGroup : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMEVENTGROUP_IID)

  /**
 * The nsIDOMEventTarget interface is the interface implemented by all
 * event targets in the Document Object Model.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-3-Events/
 */
  /* boolean isSameEventGroup (in nsIDOMEventGroup other); */
  NS_SCRIPTABLE NS_IMETHOD IsSameEventGroup(nsIDOMEventGroup *other, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMEventGroup, NS_IDOMEVENTGROUP_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMEVENTGROUP \
  NS_SCRIPTABLE NS_IMETHOD IsSameEventGroup(nsIDOMEventGroup *other, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMEVENTGROUP(_to) \
  NS_SCRIPTABLE NS_IMETHOD IsSameEventGroup(nsIDOMEventGroup *other, PRBool *_retval) { return _to IsSameEventGroup(other, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMEVENTGROUP(_to) \
  NS_SCRIPTABLE NS_IMETHOD IsSameEventGroup(nsIDOMEventGroup *other, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsSameEventGroup(other, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMEventGroup : public nsIDOMEventGroup
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMEVENTGROUP

  nsDOMEventGroup();

private:
  ~nsDOMEventGroup();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMEventGroup, nsIDOMEventGroup)

nsDOMEventGroup::nsDOMEventGroup()
{
  /* member initializers and constructor code */
}

nsDOMEventGroup::~nsDOMEventGroup()
{
  /* destructor code */
}

/* boolean isSameEventGroup (in nsIDOMEventGroup other); */
NS_IMETHODIMP nsDOMEventGroup::IsSameEventGroup(nsIDOMEventGroup *other, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMEventGroup_h__ */
