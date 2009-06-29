/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/security/manager/ssl/public/nsICRLInfo.idl
 */

#ifndef __gen_nsICRLInfo_h__
#define __gen_nsICRLInfo_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsICRLInfo */
#define NS_ICRLINFO_IID_STR "c185d920-4a3e-11d5-ba27-00108303b117"

#define NS_ICRLINFO_IID \
  {0xc185d920, 0x4a3e, 0x11d5, \
    { 0xba, 0x27, 0x00, 0x10, 0x83, 0x03, 0xb1, 0x17 }}

/**
 * Information on a Certificate Revocation List (CRL)
 * issued by a Aertificate Authority (CA).
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsICRLInfo : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ICRLINFO_IID)

  /**
   *  The issuing CA's organization.
   */
  /* readonly attribute AString organization; */
  NS_SCRIPTABLE NS_IMETHOD GetOrganization(nsAString & aOrganization) = 0;

  /**
   *  The issuing CA's organizational unit.
   */
  /* readonly attribute AString organizationalUnit; */
  NS_SCRIPTABLE NS_IMETHOD GetOrganizationalUnit(nsAString & aOrganizationalUnit) = 0;

  /**
   *  The time this CRL was created at.
   */
  /* readonly attribute PRTime lastUpdate; */
  NS_SCRIPTABLE NS_IMETHOD GetLastUpdate(PRTime *aLastUpdate) = 0;

  /**
   *  The time the suggested next update for this CRL.
   */
  /* readonly attribute PRTime nextUpdate; */
  NS_SCRIPTABLE NS_IMETHOD GetNextUpdate(PRTime *aNextUpdate) = 0;

  /**
   *  lastUpdate formatted as a human readable string
   *  formatted according to the environment locale.
   */
  /* readonly attribute AString lastUpdateLocale; */
  NS_SCRIPTABLE NS_IMETHOD GetLastUpdateLocale(nsAString & aLastUpdateLocale) = 0;

  /**
   *  nextUpdate formatted as a human readable string
   *  formatted according to the environment locale.
   */
  /* readonly attribute AString nextUpdateLocale; */
  NS_SCRIPTABLE NS_IMETHOD GetNextUpdateLocale(nsAString & aNextUpdateLocale) = 0;

  /**
   *  The key identifying the CRL in the database.
   */
  /* readonly attribute AString nameInDb; */
  NS_SCRIPTABLE NS_IMETHOD GetNameInDb(nsAString & aNameInDb) = 0;

  /**
   *  The URL this CRL was last fetched from.
   */
  /* readonly attribute AUTF8String lastFetchURL; */
  NS_SCRIPTABLE NS_IMETHOD GetLastFetchURL(nsACString & aLastFetchURL) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsICRLInfo, NS_ICRLINFO_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSICRLINFO \
  NS_SCRIPTABLE NS_IMETHOD GetOrganization(nsAString & aOrganization); \
  NS_SCRIPTABLE NS_IMETHOD GetOrganizationalUnit(nsAString & aOrganizationalUnit); \
  NS_SCRIPTABLE NS_IMETHOD GetLastUpdate(PRTime *aLastUpdate); \
  NS_SCRIPTABLE NS_IMETHOD GetNextUpdate(PRTime *aNextUpdate); \
  NS_SCRIPTABLE NS_IMETHOD GetLastUpdateLocale(nsAString & aLastUpdateLocale); \
  NS_SCRIPTABLE NS_IMETHOD GetNextUpdateLocale(nsAString & aNextUpdateLocale); \
  NS_SCRIPTABLE NS_IMETHOD GetNameInDb(nsAString & aNameInDb); \
  NS_SCRIPTABLE NS_IMETHOD GetLastFetchURL(nsACString & aLastFetchURL); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSICRLINFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetOrganization(nsAString & aOrganization) { return _to GetOrganization(aOrganization); } \
  NS_SCRIPTABLE NS_IMETHOD GetOrganizationalUnit(nsAString & aOrganizationalUnit) { return _to GetOrganizationalUnit(aOrganizationalUnit); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastUpdate(PRTime *aLastUpdate) { return _to GetLastUpdate(aLastUpdate); } \
  NS_SCRIPTABLE NS_IMETHOD GetNextUpdate(PRTime *aNextUpdate) { return _to GetNextUpdate(aNextUpdate); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastUpdateLocale(nsAString & aLastUpdateLocale) { return _to GetLastUpdateLocale(aLastUpdateLocale); } \
  NS_SCRIPTABLE NS_IMETHOD GetNextUpdateLocale(nsAString & aNextUpdateLocale) { return _to GetNextUpdateLocale(aNextUpdateLocale); } \
  NS_SCRIPTABLE NS_IMETHOD GetNameInDb(nsAString & aNameInDb) { return _to GetNameInDb(aNameInDb); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastFetchURL(nsACString & aLastFetchURL) { return _to GetLastFetchURL(aLastFetchURL); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSICRLINFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetOrganization(nsAString & aOrganization) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOrganization(aOrganization); } \
  NS_SCRIPTABLE NS_IMETHOD GetOrganizationalUnit(nsAString & aOrganizationalUnit) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOrganizationalUnit(aOrganizationalUnit); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastUpdate(PRTime *aLastUpdate) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLastUpdate(aLastUpdate); } \
  NS_SCRIPTABLE NS_IMETHOD GetNextUpdate(PRTime *aNextUpdate) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNextUpdate(aNextUpdate); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastUpdateLocale(nsAString & aLastUpdateLocale) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLastUpdateLocale(aLastUpdateLocale); } \
  NS_SCRIPTABLE NS_IMETHOD GetNextUpdateLocale(nsAString & aNextUpdateLocale) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNextUpdateLocale(aNextUpdateLocale); } \
  NS_SCRIPTABLE NS_IMETHOD GetNameInDb(nsAString & aNameInDb) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNameInDb(aNameInDb); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastFetchURL(nsACString & aLastFetchURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLastFetchURL(aLastFetchURL); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsCRLInfo : public nsICRLInfo
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSICRLINFO

  nsCRLInfo();

private:
  ~nsCRLInfo();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsCRLInfo, nsICRLInfo)

nsCRLInfo::nsCRLInfo()
{
  /* member initializers and constructor code */
}

nsCRLInfo::~nsCRLInfo()
{
  /* destructor code */
}

/* readonly attribute AString organization; */
NS_IMETHODIMP nsCRLInfo::GetOrganization(nsAString & aOrganization)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString organizationalUnit; */
NS_IMETHODIMP nsCRLInfo::GetOrganizationalUnit(nsAString & aOrganizationalUnit)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute PRTime lastUpdate; */
NS_IMETHODIMP nsCRLInfo::GetLastUpdate(PRTime *aLastUpdate)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute PRTime nextUpdate; */
NS_IMETHODIMP nsCRLInfo::GetNextUpdate(PRTime *aNextUpdate)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString lastUpdateLocale; */
NS_IMETHODIMP nsCRLInfo::GetLastUpdateLocale(nsAString & aLastUpdateLocale)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString nextUpdateLocale; */
NS_IMETHODIMP nsCRLInfo::GetNextUpdateLocale(nsAString & aNextUpdateLocale)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString nameInDb; */
NS_IMETHODIMP nsCRLInfo::GetNameInDb(nsAString & aNameInDb)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AUTF8String lastFetchURL; */
NS_IMETHODIMP nsCRLInfo::GetLastFetchURL(nsACString & aLastFetchURL)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsICRLInfo_h__ */
