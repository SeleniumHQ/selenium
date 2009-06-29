/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/profile/public/nsIProfile.idl
 */

#ifndef __gen_nsIProfile_h__
#define __gen_nsIProfile_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsIFile_h__
#include "nsIFile.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
      
#define NS_PROFILE_CID                                 \
  { /* {02b0625b-e7f3-11d2-9f5a-006008a6efe9} */       \
    0x02b0625b,                                        \
    0xe7f3,                                            \
    0x11d2,                                            \
    { 0x9f, 0x5a, 0x00, 0x60, 0x08, 0xa6, 0xef, 0xe9 } \
  }
#define NS_PROFILE_CONTRACTID	\
	"@mozilla.org/profile/manager;1"
#define NS_PROFILE_STARTUP_CATEGORY \
        "profile-startup-category"

/* starting interface:    nsIProfile */
#define NS_IPROFILE_IID_STR "02b0625a-e7f3-11d2-9f5a-006008a6efe9"

#define NS_IPROFILE_IID \
  {0x02b0625a, 0xe7f3, 0x11d2, \
    { 0x9f, 0x5a, 0x00, 0x60, 0x08, 0xa6, 0xef, 0xe9 }}

/**
 * nsIProfile
 * 
 * @status FROZEN
 * @version 1.0
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIProfile : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IPROFILE_IID)

  /* readonly attribute long profileCount; */
  NS_SCRIPTABLE NS_IMETHOD GetProfileCount(PRInt32 *aProfileCount) = 0;

  /* void getProfileList (out unsigned long length, [array, size_is (length), retval] out wstring profileNames); */
  NS_SCRIPTABLE NS_IMETHOD GetProfileList(PRUint32 *length, PRUnichar ***profileNames) = 0;

  /* boolean profileExists (in wstring profileName); */
  NS_SCRIPTABLE NS_IMETHOD ProfileExists(const PRUnichar *profileName, PRBool *_retval) = 0;

  /* attribute wstring currentProfile; */
  NS_SCRIPTABLE NS_IMETHOD GetCurrentProfile(PRUnichar * *aCurrentProfile) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCurrentProfile(const PRUnichar * aCurrentProfile) = 0;

  enum { SHUTDOWN_PERSIST = 1U };

  enum { SHUTDOWN_CLEANSE = 2U };

  /* void shutDownCurrentProfile (in unsigned long shutDownType); */
  NS_SCRIPTABLE NS_IMETHOD ShutDownCurrentProfile(PRUint32 shutDownType) = 0;

  /* void createNewProfile (in wstring profileName, in wstring nativeProfileDir, in wstring langcode, in boolean useExistingDir); */
  NS_SCRIPTABLE NS_IMETHOD CreateNewProfile(const PRUnichar *profileName, const PRUnichar *nativeProfileDir, const PRUnichar *langcode, PRBool useExistingDir) = 0;

  /* void renameProfile (in wstring oldName, in wstring newName); */
  NS_SCRIPTABLE NS_IMETHOD RenameProfile(const PRUnichar *oldName, const PRUnichar *newName) = 0;

  /* void deleteProfile (in wstring name, in boolean canDeleteFiles); */
  NS_SCRIPTABLE NS_IMETHOD DeleteProfile(const PRUnichar *name, PRBool canDeleteFiles) = 0;

  /* void cloneProfile (in wstring profileName); */
  NS_SCRIPTABLE NS_IMETHOD CloneProfile(const PRUnichar *profileName) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIProfile, NS_IPROFILE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIPROFILE \
  NS_SCRIPTABLE NS_IMETHOD GetProfileCount(PRInt32 *aProfileCount); \
  NS_SCRIPTABLE NS_IMETHOD GetProfileList(PRUint32 *length, PRUnichar ***profileNames); \
  NS_SCRIPTABLE NS_IMETHOD ProfileExists(const PRUnichar *profileName, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentProfile(PRUnichar * *aCurrentProfile); \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentProfile(const PRUnichar * aCurrentProfile); \
  NS_SCRIPTABLE NS_IMETHOD ShutDownCurrentProfile(PRUint32 shutDownType); \
  NS_SCRIPTABLE NS_IMETHOD CreateNewProfile(const PRUnichar *profileName, const PRUnichar *nativeProfileDir, const PRUnichar *langcode, PRBool useExistingDir); \
  NS_SCRIPTABLE NS_IMETHOD RenameProfile(const PRUnichar *oldName, const PRUnichar *newName); \
  NS_SCRIPTABLE NS_IMETHOD DeleteProfile(const PRUnichar *name, PRBool canDeleteFiles); \
  NS_SCRIPTABLE NS_IMETHOD CloneProfile(const PRUnichar *profileName); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIPROFILE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetProfileCount(PRInt32 *aProfileCount) { return _to GetProfileCount(aProfileCount); } \
  NS_SCRIPTABLE NS_IMETHOD GetProfileList(PRUint32 *length, PRUnichar ***profileNames) { return _to GetProfileList(length, profileNames); } \
  NS_SCRIPTABLE NS_IMETHOD ProfileExists(const PRUnichar *profileName, PRBool *_retval) { return _to ProfileExists(profileName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentProfile(PRUnichar * *aCurrentProfile) { return _to GetCurrentProfile(aCurrentProfile); } \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentProfile(const PRUnichar * aCurrentProfile) { return _to SetCurrentProfile(aCurrentProfile); } \
  NS_SCRIPTABLE NS_IMETHOD ShutDownCurrentProfile(PRUint32 shutDownType) { return _to ShutDownCurrentProfile(shutDownType); } \
  NS_SCRIPTABLE NS_IMETHOD CreateNewProfile(const PRUnichar *profileName, const PRUnichar *nativeProfileDir, const PRUnichar *langcode, PRBool useExistingDir) { return _to CreateNewProfile(profileName, nativeProfileDir, langcode, useExistingDir); } \
  NS_SCRIPTABLE NS_IMETHOD RenameProfile(const PRUnichar *oldName, const PRUnichar *newName) { return _to RenameProfile(oldName, newName); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteProfile(const PRUnichar *name, PRBool canDeleteFiles) { return _to DeleteProfile(name, canDeleteFiles); } \
  NS_SCRIPTABLE NS_IMETHOD CloneProfile(const PRUnichar *profileName) { return _to CloneProfile(profileName); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIPROFILE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetProfileCount(PRInt32 *aProfileCount) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetProfileCount(aProfileCount); } \
  NS_SCRIPTABLE NS_IMETHOD GetProfileList(PRUint32 *length, PRUnichar ***profileNames) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetProfileList(length, profileNames); } \
  NS_SCRIPTABLE NS_IMETHOD ProfileExists(const PRUnichar *profileName, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ProfileExists(profileName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentProfile(PRUnichar * *aCurrentProfile) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCurrentProfile(aCurrentProfile); } \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentProfile(const PRUnichar * aCurrentProfile) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCurrentProfile(aCurrentProfile); } \
  NS_SCRIPTABLE NS_IMETHOD ShutDownCurrentProfile(PRUint32 shutDownType) { return !_to ? NS_ERROR_NULL_POINTER : _to->ShutDownCurrentProfile(shutDownType); } \
  NS_SCRIPTABLE NS_IMETHOD CreateNewProfile(const PRUnichar *profileName, const PRUnichar *nativeProfileDir, const PRUnichar *langcode, PRBool useExistingDir) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateNewProfile(profileName, nativeProfileDir, langcode, useExistingDir); } \
  NS_SCRIPTABLE NS_IMETHOD RenameProfile(const PRUnichar *oldName, const PRUnichar *newName) { return !_to ? NS_ERROR_NULL_POINTER : _to->RenameProfile(oldName, newName); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteProfile(const PRUnichar *name, PRBool canDeleteFiles) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteProfile(name, canDeleteFiles); } \
  NS_SCRIPTABLE NS_IMETHOD CloneProfile(const PRUnichar *profileName) { return !_to ? NS_ERROR_NULL_POINTER : _to->CloneProfile(profileName); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsProfile : public nsIProfile
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPROFILE

  nsProfile();

private:
  ~nsProfile();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsProfile, nsIProfile)

nsProfile::nsProfile()
{
  /* member initializers and constructor code */
}

nsProfile::~nsProfile()
{
  /* destructor code */
}

/* readonly attribute long profileCount; */
NS_IMETHODIMP nsProfile::GetProfileCount(PRInt32 *aProfileCount)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getProfileList (out unsigned long length, [array, size_is (length), retval] out wstring profileNames); */
NS_IMETHODIMP nsProfile::GetProfileList(PRUint32 *length, PRUnichar ***profileNames)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean profileExists (in wstring profileName); */
NS_IMETHODIMP nsProfile::ProfileExists(const PRUnichar *profileName, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute wstring currentProfile; */
NS_IMETHODIMP nsProfile::GetCurrentProfile(PRUnichar * *aCurrentProfile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsProfile::SetCurrentProfile(const PRUnichar * aCurrentProfile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void shutDownCurrentProfile (in unsigned long shutDownType); */
NS_IMETHODIMP nsProfile::ShutDownCurrentProfile(PRUint32 shutDownType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void createNewProfile (in wstring profileName, in wstring nativeProfileDir, in wstring langcode, in boolean useExistingDir); */
NS_IMETHODIMP nsProfile::CreateNewProfile(const PRUnichar *profileName, const PRUnichar *nativeProfileDir, const PRUnichar *langcode, PRBool useExistingDir)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void renameProfile (in wstring oldName, in wstring newName); */
NS_IMETHODIMP nsProfile::RenameProfile(const PRUnichar *oldName, const PRUnichar *newName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteProfile (in wstring name, in boolean canDeleteFiles); */
NS_IMETHODIMP nsProfile::DeleteProfile(const PRUnichar *name, PRBool canDeleteFiles)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void cloneProfile (in wstring profileName); */
NS_IMETHODIMP nsProfile::CloneProfile(const PRUnichar *profileName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIProfile_h__ */
