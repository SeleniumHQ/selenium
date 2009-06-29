/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/security/manager/ssl/public/nsIX509Cert.idl
 */

#ifndef __gen_nsIX509Cert_h__
#define __gen_nsIX509Cert_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIArray; /* forward declaration */

class nsIX509CertValidity; /* forward declaration */

class nsIASN1Object; /* forward declaration */


/* starting interface:    nsIX509Cert */
#define NS_IX509CERT_IID_STR "f0980f60-ee3d-11d4-998b-00b0d02354a0"

#define NS_IX509CERT_IID \
  {0xf0980f60, 0xee3d, 0x11d4, \
    { 0x99, 0x8b, 0x00, 0xb0, 0xd0, 0x23, 0x54, 0xa0 }}

/**
 * This represents a X.509 certificate.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIX509Cert : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IX509CERT_IID)

  /**
   *  A nickname for the certificate.
   */
  /* readonly attribute AString nickname; */
  NS_SCRIPTABLE NS_IMETHOD GetNickname(nsAString & aNickname) = 0;

  /**
   *  The primary email address of the certificate, if present.
   */
  /* readonly attribute AString emailAddress; */
  NS_SCRIPTABLE NS_IMETHOD GetEmailAddress(nsAString & aEmailAddress) = 0;

  /**
   *  Obtain a list of all email addresses
   *  contained in the certificate.
   *
   *  @param length The number of strings in the returned array.
   *  @return An array of email addresses.
   */
  /* void getEmailAddresses (out unsigned long length, [array, size_is (length), retval] out wstring addresses); */
  NS_SCRIPTABLE NS_IMETHOD GetEmailAddresses(PRUint32 *length, PRUnichar ***addresses) = 0;

  /**
   *  Check whether a given address is contained in the certificate.
   *  The comparison will convert the email address to lowercase.
   *  The behaviour for non ASCII characters is undefined.
   *
   *  @param aEmailAddress The address to search for.
   *                
   *  @return True if the address is contained in the certificate.
   */
  /* boolean containsEmailAddress (in AString aEmailAddress); */
  NS_SCRIPTABLE NS_IMETHOD ContainsEmailAddress(const nsAString & aEmailAddress, PRBool *_retval) = 0;

  /**
   *  The subject owning the certificate.
   */
  /* readonly attribute AString subjectName; */
  NS_SCRIPTABLE NS_IMETHOD GetSubjectName(nsAString & aSubjectName) = 0;

  /**
   *  The subject's common name.
   */
  /* readonly attribute AString commonName; */
  NS_SCRIPTABLE NS_IMETHOD GetCommonName(nsAString & aCommonName) = 0;

  /**
   *  The subject's organization.
   */
  /* readonly attribute AString organization; */
  NS_SCRIPTABLE NS_IMETHOD GetOrganization(nsAString & aOrganization) = 0;

  /**
   *  The subject's organizational unit.
   */
  /* readonly attribute AString organizationalUnit; */
  NS_SCRIPTABLE NS_IMETHOD GetOrganizationalUnit(nsAString & aOrganizationalUnit) = 0;

  /**
   *  The fingerprint of the certificate's public key,
   *  calculated using the SHA1 algorithm.
   */
  /* readonly attribute AString sha1Fingerprint; */
  NS_SCRIPTABLE NS_IMETHOD GetSha1Fingerprint(nsAString & aSha1Fingerprint) = 0;

  /**
   *  The fingerprint of the certificate's public key,
   *  calculated using the MD5 algorithm.
   */
  /* readonly attribute AString md5Fingerprint; */
  NS_SCRIPTABLE NS_IMETHOD GetMd5Fingerprint(nsAString & aMd5Fingerprint) = 0;

  /**
   *  A human readable name identifying the hardware or
   *  software token the certificate is stored on.
   */
  /* readonly attribute AString tokenName; */
  NS_SCRIPTABLE NS_IMETHOD GetTokenName(nsAString & aTokenName) = 0;

  /**
   *  The subject identifying the issuer certificate.
   */
  /* readonly attribute AString issuerName; */
  NS_SCRIPTABLE NS_IMETHOD GetIssuerName(nsAString & aIssuerName) = 0;

  /**
   *  The serial number the issuer assigned to this certificate.
   */
  /* readonly attribute AString serialNumber; */
  NS_SCRIPTABLE NS_IMETHOD GetSerialNumber(nsAString & aSerialNumber) = 0;

  /**
   *  The issuer subject's common name.
   */
  /* readonly attribute AString issuerCommonName; */
  NS_SCRIPTABLE NS_IMETHOD GetIssuerCommonName(nsAString & aIssuerCommonName) = 0;

  /**
   *  The issuer subject's organization.
   */
  /* readonly attribute AString issuerOrganization; */
  NS_SCRIPTABLE NS_IMETHOD GetIssuerOrganization(nsAString & aIssuerOrganization) = 0;

  /**
   *  The issuer subject's organizational unit.
   */
  /* readonly attribute AString issuerOrganizationUnit; */
  NS_SCRIPTABLE NS_IMETHOD GetIssuerOrganizationUnit(nsAString & aIssuerOrganizationUnit) = 0;

  /**
   *  The certificate used by the issuer to sign this certificate.
   */
  /* readonly attribute nsIX509Cert issuer; */
  NS_SCRIPTABLE NS_IMETHOD GetIssuer(nsIX509Cert * *aIssuer) = 0;

  /**
   *  This certificate's validity period.
   */
  /* readonly attribute nsIX509CertValidity validity; */
  NS_SCRIPTABLE NS_IMETHOD GetValidity(nsIX509CertValidity * *aValidity) = 0;

  /**
   *  A unique identifier of this certificate within the local storage.
   */
  /* readonly attribute string dbKey; */
  NS_SCRIPTABLE NS_IMETHOD GetDbKey(char * *aDbKey) = 0;

  /**
   *  A human readable identifier to label this certificate.
   */
  /* readonly attribute string windowTitle; */
  NS_SCRIPTABLE NS_IMETHOD GetWindowTitle(char * *aWindowTitle) = 0;

  /**
   *  Constants to classify the type of a certificate.
   */
  enum { UNKNOWN_CERT = 0U };

  enum { CA_CERT = 1U };

  enum { USER_CERT = 2U };

  enum { EMAIL_CERT = 4U };

  enum { SERVER_CERT = 8U };

  /**
   *  Constants for certificate verification results.
   */
  enum { VERIFIED_OK = 0U };

  enum { NOT_VERIFIED_UNKNOWN = 1U };

  enum { CERT_REVOKED = 2U };

  enum { CERT_EXPIRED = 4U };

  enum { CERT_NOT_TRUSTED = 8U };

  enum { ISSUER_NOT_TRUSTED = 16U };

  enum { ISSUER_UNKNOWN = 32U };

  enum { INVALID_CA = 64U };

  enum { USAGE_NOT_ALLOWED = 128U };

  /**
   *  Constants that describe the certified usages of a certificate.
   */
  enum { CERT_USAGE_SSLClient = 0U };

  enum { CERT_USAGE_SSLServer = 1U };

  enum { CERT_USAGE_SSLServerWithStepUp = 2U };

  enum { CERT_USAGE_SSLCA = 3U };

  enum { CERT_USAGE_EmailSigner = 4U };

  enum { CERT_USAGE_EmailRecipient = 5U };

  enum { CERT_USAGE_ObjectSigner = 6U };

  enum { CERT_USAGE_UserCertImport = 7U };

  enum { CERT_USAGE_VerifyCA = 8U };

  enum { CERT_USAGE_ProtectedObjectSigner = 9U };

  enum { CERT_USAGE_StatusResponder = 10U };

  enum { CERT_USAGE_AnyCA = 11U };

  /**
   *  Obtain a list of certificates that contains this certificate 
   *  and the issuing certificates of all involved issuers,
   *  up to the root issuer.
   *
   *  @return The chain of certifficates including the issuers.
   */
  /* nsIArray getChain (); */
  NS_SCRIPTABLE NS_IMETHOD GetChain(nsIArray **_retval) = 0;

  /**
   *  Obtain an array of human readable strings describing
   *  the certificate's certified usages.
   *
   *  @param ignoreOcsp Do not use OCSP even if it is currently activated.
   *  @param verified The certificate verification result, see constants.
   *  @param count The number of human readable usages returned.
   *  @param usages The array of human readable usages.
   */
  /* void getUsagesArray (in boolean ignoreOcsp, out PRUint32 verified, out PRUint32 count, [array, size_is (count)] out wstring usages); */
  NS_SCRIPTABLE NS_IMETHOD GetUsagesArray(PRBool ignoreOcsp, PRUint32 *verified, PRUint32 *count, PRUnichar ***usages) = 0;

  /**
   *  Obtain a single comma separated human readable string describing
   *  the certificate's certified usages.
   *
   *  @param ignoreOcsp Do not use OCSP even if it is currently activated.
   *  @param verified The certificate verification result, see constants.
   *  @param purposes The string listing the usages.
   */
  /* void getUsagesString (in boolean ignoreOcsp, out PRUint32 verified, out AString usages); */
  NS_SCRIPTABLE NS_IMETHOD GetUsagesString(PRBool ignoreOcsp, PRUint32 *verified, nsAString & usages) = 0;

  /**
   *  Verify the certificate for a particular usage.
   *
   *  @return The certificate verification result, see constants.
   */
  /* unsigned long verifyForUsage (in unsigned long usage); */
  NS_SCRIPTABLE NS_IMETHOD VerifyForUsage(PRUint32 usage, PRUint32 *_retval) = 0;

  /**
   *  This is the attribute which describes the ASN1 layout
   *  of the certificate.  This can be used when doing a
   *  "pretty print" of the certificate's ASN1 structure.
   */
  /* readonly attribute nsIASN1Object ASN1Structure; */
  NS_SCRIPTABLE NS_IMETHOD GetASN1Structure(nsIASN1Object * *aASN1Structure) = 0;

  /**
   *  Obtain a raw binary encoding of this certificate
   *  in DER format.
   *
   *  @param length The number of bytes in the binary encoding.
   *  @param data The bytes representing the DER encoded certificate.
   */
  /* void getRawDER (out unsigned long length, [array, size_is (length), retval] out octet data); */
  NS_SCRIPTABLE NS_IMETHOD GetRawDER(PRUint32 *length, PRUint8 **data) = 0;

  /**
   *  Test whether two certificate instances represent the 
   *  same certificate.
   *
   *  @return Whether the certificates are equal
   */
  /* boolean equals (in nsIX509Cert other); */
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIX509Cert *other, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIX509Cert, NS_IX509CERT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIX509CERT \
  NS_SCRIPTABLE NS_IMETHOD GetNickname(nsAString & aNickname); \
  NS_SCRIPTABLE NS_IMETHOD GetEmailAddress(nsAString & aEmailAddress); \
  NS_SCRIPTABLE NS_IMETHOD GetEmailAddresses(PRUint32 *length, PRUnichar ***addresses); \
  NS_SCRIPTABLE NS_IMETHOD ContainsEmailAddress(const nsAString & aEmailAddress, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetSubjectName(nsAString & aSubjectName); \
  NS_SCRIPTABLE NS_IMETHOD GetCommonName(nsAString & aCommonName); \
  NS_SCRIPTABLE NS_IMETHOD GetOrganization(nsAString & aOrganization); \
  NS_SCRIPTABLE NS_IMETHOD GetOrganizationalUnit(nsAString & aOrganizationalUnit); \
  NS_SCRIPTABLE NS_IMETHOD GetSha1Fingerprint(nsAString & aSha1Fingerprint); \
  NS_SCRIPTABLE NS_IMETHOD GetMd5Fingerprint(nsAString & aMd5Fingerprint); \
  NS_SCRIPTABLE NS_IMETHOD GetTokenName(nsAString & aTokenName); \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerName(nsAString & aIssuerName); \
  NS_SCRIPTABLE NS_IMETHOD GetSerialNumber(nsAString & aSerialNumber); \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerCommonName(nsAString & aIssuerCommonName); \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerOrganization(nsAString & aIssuerOrganization); \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerOrganizationUnit(nsAString & aIssuerOrganizationUnit); \
  NS_SCRIPTABLE NS_IMETHOD GetIssuer(nsIX509Cert * *aIssuer); \
  NS_SCRIPTABLE NS_IMETHOD GetValidity(nsIX509CertValidity * *aValidity); \
  NS_SCRIPTABLE NS_IMETHOD GetDbKey(char * *aDbKey); \
  NS_SCRIPTABLE NS_IMETHOD GetWindowTitle(char * *aWindowTitle); \
  NS_SCRIPTABLE NS_IMETHOD GetChain(nsIArray **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetUsagesArray(PRBool ignoreOcsp, PRUint32 *verified, PRUint32 *count, PRUnichar ***usages); \
  NS_SCRIPTABLE NS_IMETHOD GetUsagesString(PRBool ignoreOcsp, PRUint32 *verified, nsAString & usages); \
  NS_SCRIPTABLE NS_IMETHOD VerifyForUsage(PRUint32 usage, PRUint32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetASN1Structure(nsIASN1Object * *aASN1Structure); \
  NS_SCRIPTABLE NS_IMETHOD GetRawDER(PRUint32 *length, PRUint8 **data); \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIX509Cert *other, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIX509CERT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetNickname(nsAString & aNickname) { return _to GetNickname(aNickname); } \
  NS_SCRIPTABLE NS_IMETHOD GetEmailAddress(nsAString & aEmailAddress) { return _to GetEmailAddress(aEmailAddress); } \
  NS_SCRIPTABLE NS_IMETHOD GetEmailAddresses(PRUint32 *length, PRUnichar ***addresses) { return _to GetEmailAddresses(length, addresses); } \
  NS_SCRIPTABLE NS_IMETHOD ContainsEmailAddress(const nsAString & aEmailAddress, PRBool *_retval) { return _to ContainsEmailAddress(aEmailAddress, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetSubjectName(nsAString & aSubjectName) { return _to GetSubjectName(aSubjectName); } \
  NS_SCRIPTABLE NS_IMETHOD GetCommonName(nsAString & aCommonName) { return _to GetCommonName(aCommonName); } \
  NS_SCRIPTABLE NS_IMETHOD GetOrganization(nsAString & aOrganization) { return _to GetOrganization(aOrganization); } \
  NS_SCRIPTABLE NS_IMETHOD GetOrganizationalUnit(nsAString & aOrganizationalUnit) { return _to GetOrganizationalUnit(aOrganizationalUnit); } \
  NS_SCRIPTABLE NS_IMETHOD GetSha1Fingerprint(nsAString & aSha1Fingerprint) { return _to GetSha1Fingerprint(aSha1Fingerprint); } \
  NS_SCRIPTABLE NS_IMETHOD GetMd5Fingerprint(nsAString & aMd5Fingerprint) { return _to GetMd5Fingerprint(aMd5Fingerprint); } \
  NS_SCRIPTABLE NS_IMETHOD GetTokenName(nsAString & aTokenName) { return _to GetTokenName(aTokenName); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerName(nsAString & aIssuerName) { return _to GetIssuerName(aIssuerName); } \
  NS_SCRIPTABLE NS_IMETHOD GetSerialNumber(nsAString & aSerialNumber) { return _to GetSerialNumber(aSerialNumber); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerCommonName(nsAString & aIssuerCommonName) { return _to GetIssuerCommonName(aIssuerCommonName); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerOrganization(nsAString & aIssuerOrganization) { return _to GetIssuerOrganization(aIssuerOrganization); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerOrganizationUnit(nsAString & aIssuerOrganizationUnit) { return _to GetIssuerOrganizationUnit(aIssuerOrganizationUnit); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuer(nsIX509Cert * *aIssuer) { return _to GetIssuer(aIssuer); } \
  NS_SCRIPTABLE NS_IMETHOD GetValidity(nsIX509CertValidity * *aValidity) { return _to GetValidity(aValidity); } \
  NS_SCRIPTABLE NS_IMETHOD GetDbKey(char * *aDbKey) { return _to GetDbKey(aDbKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetWindowTitle(char * *aWindowTitle) { return _to GetWindowTitle(aWindowTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetChain(nsIArray **_retval) { return _to GetChain(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsagesArray(PRBool ignoreOcsp, PRUint32 *verified, PRUint32 *count, PRUnichar ***usages) { return _to GetUsagesArray(ignoreOcsp, verified, count, usages); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsagesString(PRBool ignoreOcsp, PRUint32 *verified, nsAString & usages) { return _to GetUsagesString(ignoreOcsp, verified, usages); } \
  NS_SCRIPTABLE NS_IMETHOD VerifyForUsage(PRUint32 usage, PRUint32 *_retval) { return _to VerifyForUsage(usage, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetASN1Structure(nsIASN1Object * *aASN1Structure) { return _to GetASN1Structure(aASN1Structure); } \
  NS_SCRIPTABLE NS_IMETHOD GetRawDER(PRUint32 *length, PRUint8 **data) { return _to GetRawDER(length, data); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIX509Cert *other, PRBool *_retval) { return _to Equals(other, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIX509CERT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetNickname(nsAString & aNickname) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNickname(aNickname); } \
  NS_SCRIPTABLE NS_IMETHOD GetEmailAddress(nsAString & aEmailAddress) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEmailAddress(aEmailAddress); } \
  NS_SCRIPTABLE NS_IMETHOD GetEmailAddresses(PRUint32 *length, PRUnichar ***addresses) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEmailAddresses(length, addresses); } \
  NS_SCRIPTABLE NS_IMETHOD ContainsEmailAddress(const nsAString & aEmailAddress, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ContainsEmailAddress(aEmailAddress, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetSubjectName(nsAString & aSubjectName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSubjectName(aSubjectName); } \
  NS_SCRIPTABLE NS_IMETHOD GetCommonName(nsAString & aCommonName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCommonName(aCommonName); } \
  NS_SCRIPTABLE NS_IMETHOD GetOrganization(nsAString & aOrganization) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOrganization(aOrganization); } \
  NS_SCRIPTABLE NS_IMETHOD GetOrganizationalUnit(nsAString & aOrganizationalUnit) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOrganizationalUnit(aOrganizationalUnit); } \
  NS_SCRIPTABLE NS_IMETHOD GetSha1Fingerprint(nsAString & aSha1Fingerprint) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSha1Fingerprint(aSha1Fingerprint); } \
  NS_SCRIPTABLE NS_IMETHOD GetMd5Fingerprint(nsAString & aMd5Fingerprint) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMd5Fingerprint(aMd5Fingerprint); } \
  NS_SCRIPTABLE NS_IMETHOD GetTokenName(nsAString & aTokenName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTokenName(aTokenName); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerName(nsAString & aIssuerName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIssuerName(aIssuerName); } \
  NS_SCRIPTABLE NS_IMETHOD GetSerialNumber(nsAString & aSerialNumber) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSerialNumber(aSerialNumber); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerCommonName(nsAString & aIssuerCommonName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIssuerCommonName(aIssuerCommonName); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerOrganization(nsAString & aIssuerOrganization) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIssuerOrganization(aIssuerOrganization); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuerOrganizationUnit(nsAString & aIssuerOrganizationUnit) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIssuerOrganizationUnit(aIssuerOrganizationUnit); } \
  NS_SCRIPTABLE NS_IMETHOD GetIssuer(nsIX509Cert * *aIssuer) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIssuer(aIssuer); } \
  NS_SCRIPTABLE NS_IMETHOD GetValidity(nsIX509CertValidity * *aValidity) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetValidity(aValidity); } \
  NS_SCRIPTABLE NS_IMETHOD GetDbKey(char * *aDbKey) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDbKey(aDbKey); } \
  NS_SCRIPTABLE NS_IMETHOD GetWindowTitle(char * *aWindowTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWindowTitle(aWindowTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetChain(nsIArray **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChain(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsagesArray(PRBool ignoreOcsp, PRUint32 *verified, PRUint32 *count, PRUnichar ***usages) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUsagesArray(ignoreOcsp, verified, count, usages); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsagesString(PRBool ignoreOcsp, PRUint32 *verified, nsAString & usages) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUsagesString(ignoreOcsp, verified, usages); } \
  NS_SCRIPTABLE NS_IMETHOD VerifyForUsage(PRUint32 usage, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->VerifyForUsage(usage, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetASN1Structure(nsIASN1Object * *aASN1Structure) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetASN1Structure(aASN1Structure); } \
  NS_SCRIPTABLE NS_IMETHOD GetRawDER(PRUint32 *length, PRUint8 **data) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRawDER(length, data); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIX509Cert *other, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Equals(other, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsX509Cert : public nsIX509Cert
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIX509CERT

  nsX509Cert();

private:
  ~nsX509Cert();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsX509Cert, nsIX509Cert)

nsX509Cert::nsX509Cert()
{
  /* member initializers and constructor code */
}

nsX509Cert::~nsX509Cert()
{
  /* destructor code */
}

/* readonly attribute AString nickname; */
NS_IMETHODIMP nsX509Cert::GetNickname(nsAString & aNickname)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString emailAddress; */
NS_IMETHODIMP nsX509Cert::GetEmailAddress(nsAString & aEmailAddress)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getEmailAddresses (out unsigned long length, [array, size_is (length), retval] out wstring addresses); */
NS_IMETHODIMP nsX509Cert::GetEmailAddresses(PRUint32 *length, PRUnichar ***addresses)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean containsEmailAddress (in AString aEmailAddress); */
NS_IMETHODIMP nsX509Cert::ContainsEmailAddress(const nsAString & aEmailAddress, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString subjectName; */
NS_IMETHODIMP nsX509Cert::GetSubjectName(nsAString & aSubjectName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString commonName; */
NS_IMETHODIMP nsX509Cert::GetCommonName(nsAString & aCommonName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString organization; */
NS_IMETHODIMP nsX509Cert::GetOrganization(nsAString & aOrganization)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString organizationalUnit; */
NS_IMETHODIMP nsX509Cert::GetOrganizationalUnit(nsAString & aOrganizationalUnit)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString sha1Fingerprint; */
NS_IMETHODIMP nsX509Cert::GetSha1Fingerprint(nsAString & aSha1Fingerprint)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString md5Fingerprint; */
NS_IMETHODIMP nsX509Cert::GetMd5Fingerprint(nsAString & aMd5Fingerprint)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString tokenName; */
NS_IMETHODIMP nsX509Cert::GetTokenName(nsAString & aTokenName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString issuerName; */
NS_IMETHODIMP nsX509Cert::GetIssuerName(nsAString & aIssuerName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString serialNumber; */
NS_IMETHODIMP nsX509Cert::GetSerialNumber(nsAString & aSerialNumber)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString issuerCommonName; */
NS_IMETHODIMP nsX509Cert::GetIssuerCommonName(nsAString & aIssuerCommonName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString issuerOrganization; */
NS_IMETHODIMP nsX509Cert::GetIssuerOrganization(nsAString & aIssuerOrganization)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString issuerOrganizationUnit; */
NS_IMETHODIMP nsX509Cert::GetIssuerOrganizationUnit(nsAString & aIssuerOrganizationUnit)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIX509Cert issuer; */
NS_IMETHODIMP nsX509Cert::GetIssuer(nsIX509Cert * *aIssuer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIX509CertValidity validity; */
NS_IMETHODIMP nsX509Cert::GetValidity(nsIX509CertValidity * *aValidity)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute string dbKey; */
NS_IMETHODIMP nsX509Cert::GetDbKey(char * *aDbKey)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute string windowTitle; */
NS_IMETHODIMP nsX509Cert::GetWindowTitle(char * *aWindowTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIArray getChain (); */
NS_IMETHODIMP nsX509Cert::GetChain(nsIArray **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getUsagesArray (in boolean ignoreOcsp, out PRUint32 verified, out PRUint32 count, [array, size_is (count)] out wstring usages); */
NS_IMETHODIMP nsX509Cert::GetUsagesArray(PRBool ignoreOcsp, PRUint32 *verified, PRUint32 *count, PRUnichar ***usages)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getUsagesString (in boolean ignoreOcsp, out PRUint32 verified, out AString usages); */
NS_IMETHODIMP nsX509Cert::GetUsagesString(PRBool ignoreOcsp, PRUint32 *verified, nsAString & usages)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* unsigned long verifyForUsage (in unsigned long usage); */
NS_IMETHODIMP nsX509Cert::VerifyForUsage(PRUint32 usage, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIASN1Object ASN1Structure; */
NS_IMETHODIMP nsX509Cert::GetASN1Structure(nsIASN1Object * *aASN1Structure)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getRawDER (out unsigned long length, [array, size_is (length), retval] out octet data); */
NS_IMETHODIMP nsX509Cert::GetRawDER(PRUint32 *length, PRUint8 **data)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean equals (in nsIX509Cert other); */
NS_IMETHODIMP nsX509Cert::Equals(nsIX509Cert *other, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIX509Cert_h__ */
