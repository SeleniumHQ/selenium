/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/security/manager/ssl/public/nsICertificateDialogs.idl
 */

#ifndef __gen_nsICertificateDialogs_h__
#define __gen_nsICertificateDialogs_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIInterfaceRequestor; /* forward declaration */

class nsIX509Cert; /* forward declaration */

class nsICRLInfo; /* forward declaration */


/* starting interface:    nsICertificateDialogs */
#define NS_ICERTIFICATEDIALOGS_IID_STR "a03ca940-09be-11d5-ac5d-000064657374"

#define NS_ICERTIFICATEDIALOGS_IID \
  {0xa03ca940, 0x09be, 0x11d5, \
    { 0xac, 0x5d, 0x00, 0x00, 0x64, 0x65, 0x73, 0x74 }}

/**
 * Functions that implement user interface dialogs to manage certificates.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsICertificateDialogs : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ICERTIFICATEDIALOGS_IID)

  /**
   *  UI shown when a user is asked to download a new CA cert.
   *  Provides user with ability to choose trust settings for the cert.
   *  Asks the user to grant permission to import the certificate.
   *
   *  @param ctx A user interface context.
   *  @param cert The certificate that is about to get installed.
   *  @param trust a bit mask of trust flags, 
   *               see nsIX509CertDB for possible values.
   *
   *  @return true if the user allows to import the certificate.
   */
  /* boolean confirmDownloadCACert (in nsIInterfaceRequestor ctx, in nsIX509Cert cert, out unsigned long trust); */
  NS_SCRIPTABLE NS_IMETHOD ConfirmDownloadCACert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert, PRUint32 *trust, PRBool *_retval) = 0;

  /**
   *  UI shown when a web site has delivered a CA certificate to
   *  be imported, but the certificate is already contained in the
   *  user's storage.
   *
   *  @param ctx A user interface context.
   */
  /* void notifyCACertExists (in nsIInterfaceRequestor ctx); */
  NS_SCRIPTABLE NS_IMETHOD NotifyCACertExists(nsIInterfaceRequestor *ctx) = 0;

  /**
   *  UI shown when a user's personal certificate is going to be
   *  exported to a backup file.
   *  The implementation of this dialog should make sure 
   *  to prompt the user to type the password twice in order to
   *  confirm correct input.
   *  The wording in the dialog should also motivate the user 
   *  to enter a strong password.
   *
   *  @param ctx A user interface context.
   *  @param password The password provided by the user.
   *
   *  @return false if the user requests to cancel.
   */
  /* boolean setPKCS12FilePassword (in nsIInterfaceRequestor ctx, out AString password); */
  NS_SCRIPTABLE NS_IMETHOD SetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval) = 0;

  /**
   *  UI shown when a user is about to restore a personal
   *  certificate from a backup file.
   *  The user is requested to enter the password
   *  that was used in the past to protect that backup file.
   *
   *  @param ctx A user interface context.
   *  @param password The password provided by the user.
   *
   *  @return false if the user requests to cancel.
   */
  /* boolean getPKCS12FilePassword (in nsIInterfaceRequestor ctx, out AString password); */
  NS_SCRIPTABLE NS_IMETHOD GetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval) = 0;

  /**
   *  UI shown when a certificate needs to be shown to the user.
   *  The implementation should try to display as many attributes
   *  as possible.
   *
   *  @param ctx A user interface context.
   *  @param cert The certificate to be shown to the user.
   */
  /* void viewCert (in nsIInterfaceRequestor ctx, in nsIX509Cert cert); */
  NS_SCRIPTABLE NS_IMETHOD ViewCert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert) = 0;

  /**
   *  UI shown after a Certificate Revocation List (CRL) has been
   *  successfully imported.
   *
   *  @param ctx A user interface context.
   *  @param crl Information describing the CRL that was imported.
   */
  /* void crlImportStatusDialog (in nsIInterfaceRequestor ctx, in nsICRLInfo crl); */
  NS_SCRIPTABLE NS_IMETHOD CrlImportStatusDialog(nsIInterfaceRequestor *ctx, nsICRLInfo *crl) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsICertificateDialogs, NS_ICERTIFICATEDIALOGS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSICERTIFICATEDIALOGS \
  NS_SCRIPTABLE NS_IMETHOD ConfirmDownloadCACert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert, PRUint32 *trust, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD NotifyCACertExists(nsIInterfaceRequestor *ctx); \
  NS_SCRIPTABLE NS_IMETHOD SetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD ViewCert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert); \
  NS_SCRIPTABLE NS_IMETHOD CrlImportStatusDialog(nsIInterfaceRequestor *ctx, nsICRLInfo *crl); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSICERTIFICATEDIALOGS(_to) \
  NS_SCRIPTABLE NS_IMETHOD ConfirmDownloadCACert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert, PRUint32 *trust, PRBool *_retval) { return _to ConfirmDownloadCACert(ctx, cert, trust, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NotifyCACertExists(nsIInterfaceRequestor *ctx) { return _to NotifyCACertExists(ctx); } \
  NS_SCRIPTABLE NS_IMETHOD SetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval) { return _to SetPKCS12FilePassword(ctx, password, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval) { return _to GetPKCS12FilePassword(ctx, password, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ViewCert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert) { return _to ViewCert(ctx, cert); } \
  NS_SCRIPTABLE NS_IMETHOD CrlImportStatusDialog(nsIInterfaceRequestor *ctx, nsICRLInfo *crl) { return _to CrlImportStatusDialog(ctx, crl); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSICERTIFICATEDIALOGS(_to) \
  NS_SCRIPTABLE NS_IMETHOD ConfirmDownloadCACert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert, PRUint32 *trust, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ConfirmDownloadCACert(ctx, cert, trust, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD NotifyCACertExists(nsIInterfaceRequestor *ctx) { return !_to ? NS_ERROR_NULL_POINTER : _to->NotifyCACertExists(ctx); } \
  NS_SCRIPTABLE NS_IMETHOD SetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPKCS12FilePassword(ctx, password, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPKCS12FilePassword(ctx, password, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ViewCert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert) { return !_to ? NS_ERROR_NULL_POINTER : _to->ViewCert(ctx, cert); } \
  NS_SCRIPTABLE NS_IMETHOD CrlImportStatusDialog(nsIInterfaceRequestor *ctx, nsICRLInfo *crl) { return !_to ? NS_ERROR_NULL_POINTER : _to->CrlImportStatusDialog(ctx, crl); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsCertificateDialogs : public nsICertificateDialogs
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSICERTIFICATEDIALOGS

  nsCertificateDialogs();

private:
  ~nsCertificateDialogs();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsCertificateDialogs, nsICertificateDialogs)

nsCertificateDialogs::nsCertificateDialogs()
{
  /* member initializers and constructor code */
}

nsCertificateDialogs::~nsCertificateDialogs()
{
  /* destructor code */
}

/* boolean confirmDownloadCACert (in nsIInterfaceRequestor ctx, in nsIX509Cert cert, out unsigned long trust); */
NS_IMETHODIMP nsCertificateDialogs::ConfirmDownloadCACert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert, PRUint32 *trust, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void notifyCACertExists (in nsIInterfaceRequestor ctx); */
NS_IMETHODIMP nsCertificateDialogs::NotifyCACertExists(nsIInterfaceRequestor *ctx)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean setPKCS12FilePassword (in nsIInterfaceRequestor ctx, out AString password); */
NS_IMETHODIMP nsCertificateDialogs::SetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean getPKCS12FilePassword (in nsIInterfaceRequestor ctx, out AString password); */
NS_IMETHODIMP nsCertificateDialogs::GetPKCS12FilePassword(nsIInterfaceRequestor *ctx, nsAString & password, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void viewCert (in nsIInterfaceRequestor ctx, in nsIX509Cert cert); */
NS_IMETHODIMP nsCertificateDialogs::ViewCert(nsIInterfaceRequestor *ctx, nsIX509Cert *cert)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void crlImportStatusDialog (in nsIInterfaceRequestor ctx, in nsICRLInfo crl); */
NS_IMETHODIMP nsCertificateDialogs::CrlImportStatusDialog(nsIInterfaceRequestor *ctx, nsICRLInfo *crl)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

#define NS_CERTIFICATEDIALOGS_CONTRACTID "@mozilla.org/nsCertificateDialogs;1"

#endif /* __gen_nsICertificateDialogs_h__ */
