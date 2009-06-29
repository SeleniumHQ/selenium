/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/xpcom/ds/nsIProperties.idl
 */

#ifndef __gen_nsIProperties_h__
#define __gen_nsIProperties_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIProperties */
#define NS_IPROPERTIES_IID_STR "78650582-4e93-4b60-8e85-26ebd3eb14ca"

#define NS_IPROPERTIES_IID \
  {0x78650582, 0x4e93, 0x4b60, \
    { 0x8e, 0x85, 0x26, 0xeb, 0xd3, 0xeb, 0x14, 0xca }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIProperties : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IPROPERTIES_IID)

  /**
     * Gets a property with a given name. 
     *
     * @return NS_ERROR_FAILURE if a property with that name doesn't exist.
     * @return NS_ERROR_NO_INTERFACE if the found property fails to QI to the 
     * given iid.
     */
  /* void get (in string prop, in nsIIDRef iid, [iid_is (iid), retval] out nsQIResult result); */
  NS_SCRIPTABLE NS_IMETHOD Get(const char *prop, const nsIID & iid, void * *result) = 0;

  /**
     * Sets a property with a given name to a given value. 
     */
  /* void set (in string prop, in nsISupports value); */
  NS_SCRIPTABLE NS_IMETHOD Set(const char *prop, nsISupports *value) = 0;

  /**
     * Returns true if the property with the given name exists.
     */
  /* boolean has (in string prop); */
  NS_SCRIPTABLE NS_IMETHOD Has(const char *prop, PRBool *_retval) = 0;

  /**
     * Undefines a property.
     * @return NS_ERROR_FAILURE if a property with that name doesn't
     * already exist.
     */
  /* void undefine (in string prop); */
  NS_SCRIPTABLE NS_IMETHOD Undefine(const char *prop) = 0;

  /**
     *  Returns an array of the keys.
     */
  /* void getKeys (out PRUint32 count, [array, size_is (count), retval] out string keys); */
  NS_SCRIPTABLE NS_IMETHOD GetKeys(PRUint32 *count, char ***keys) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIProperties, NS_IPROPERTIES_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIPROPERTIES \
  NS_SCRIPTABLE NS_IMETHOD Get(const char *prop, const nsIID & iid, void * *result); \
  NS_SCRIPTABLE NS_IMETHOD Set(const char *prop, nsISupports *value); \
  NS_SCRIPTABLE NS_IMETHOD Has(const char *prop, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Undefine(const char *prop); \
  NS_SCRIPTABLE NS_IMETHOD GetKeys(PRUint32 *count, char ***keys); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIPROPERTIES(_to) \
  NS_SCRIPTABLE NS_IMETHOD Get(const char *prop, const nsIID & iid, void * *result) { return _to Get(prop, iid, result); } \
  NS_SCRIPTABLE NS_IMETHOD Set(const char *prop, nsISupports *value) { return _to Set(prop, value); } \
  NS_SCRIPTABLE NS_IMETHOD Has(const char *prop, PRBool *_retval) { return _to Has(prop, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Undefine(const char *prop) { return _to Undefine(prop); } \
  NS_SCRIPTABLE NS_IMETHOD GetKeys(PRUint32 *count, char ***keys) { return _to GetKeys(count, keys); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIPROPERTIES(_to) \
  NS_SCRIPTABLE NS_IMETHOD Get(const char *prop, const nsIID & iid, void * *result) { return !_to ? NS_ERROR_NULL_POINTER : _to->Get(prop, iid, result); } \
  NS_SCRIPTABLE NS_IMETHOD Set(const char *prop, nsISupports *value) { return !_to ? NS_ERROR_NULL_POINTER : _to->Set(prop, value); } \
  NS_SCRIPTABLE NS_IMETHOD Has(const char *prop, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Has(prop, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Undefine(const char *prop) { return !_to ? NS_ERROR_NULL_POINTER : _to->Undefine(prop); } \
  NS_SCRIPTABLE NS_IMETHOD GetKeys(PRUint32 *count, char ***keys) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetKeys(count, keys); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsProperties : public nsIProperties
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPROPERTIES

  nsProperties();

private:
  ~nsProperties();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsProperties, nsIProperties)

nsProperties::nsProperties()
{
  /* member initializers and constructor code */
}

nsProperties::~nsProperties()
{
  /* destructor code */
}

/* void get (in string prop, in nsIIDRef iid, [iid_is (iid), retval] out nsQIResult result); */
NS_IMETHODIMP nsProperties::Get(const char *prop, const nsIID & iid, void * *result)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void set (in string prop, in nsISupports value); */
NS_IMETHODIMP nsProperties::Set(const char *prop, nsISupports *value)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean has (in string prop); */
NS_IMETHODIMP nsProperties::Has(const char *prop, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void undefine (in string prop); */
NS_IMETHODIMP nsProperties::Undefine(const char *prop)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getKeys (out PRUint32 count, [array, size_is (count), retval] out string keys); */
NS_IMETHODIMP nsProperties::GetKeys(PRUint32 *count, char ***keys)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIProperties_h__ */
