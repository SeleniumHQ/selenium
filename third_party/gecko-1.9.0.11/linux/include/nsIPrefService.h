/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/modules/libpref/public/nsIPrefService.idl
 */

#ifndef __gen_nsIPrefService_h__
#define __gen_nsIPrefService_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsIPrefBranch_h__
#include "nsIPrefBranch.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIFile; /* forward declaration */


/* starting interface:    nsIPrefService */
#define NS_IPREFSERVICE_IID_STR "decb9cc7-c08f-4ea5-be91-a8fc637ce2d2"

#define NS_IPREFSERVICE_IID \
  {0xdecb9cc7, 0xc08f, 0x4ea5, \
    { 0xbe, 0x91, 0xa8, 0xfc, 0x63, 0x7c, 0xe2, 0xd2 }}

/**
 * The nsIPrefService interface is the main entry point into the back end
 * preferences management library. The preference service is directly
 * responsible for the management of the preferences files and also facilitates
 * access to the preference branch object which allows the direct manipulation
 * of the preferences themselves.
 *
 * @see nsIPrefBranch
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIPrefService : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IPREFSERVICE_IID)

  /**
   * Called to read in the preferences specified in a user preference file.
   *
   * @param aFile The file to be read.
   *
   * @note
   * If nsnull is passed in for the aFile parameter the default preferences
   * file(s) [prefs.js, user.js] will be read and processed.
   *
   * @return NS_OK File was read and processed.
   * @return Other File failed to read or contained invalid data.
   *
   * @see savePrefFile
   * @see nsIFile
   */
  /* void readUserPrefs (in nsIFile aFile); */
  NS_SCRIPTABLE NS_IMETHOD ReadUserPrefs(nsIFile *aFile) = 0;

  /**
   * Called to completely flush and re-initialize the preferences system.
   *
   * @return NS_OK The preference service was re-initialized correctly.
   * @return Other The preference service failed to restart correctly.
   */
  /* void resetPrefs (); */
  NS_SCRIPTABLE NS_IMETHOD ResetPrefs(void) = 0;

  /**
   * Called to reset all preferences with user set values back to the
   * application default values.
   *
   * @return NS_OK Always.
   */
  /* void resetUserPrefs (); */
  NS_SCRIPTABLE NS_IMETHOD ResetUserPrefs(void) = 0;

  /**
   * Called to write current preferences state to a file.
   *
   * @param aFile The file to be written.
   *
   * @note
   * If nsnull is passed in for the aFile parameter the preference data is
   * written out to the current preferences file (usually prefs.js.)
   *
   * @return NS_OK File was written.
   * @return Other File failed to write.
   *
   * @see readUserPrefs
   * @see nsIFile
   */
  /* void savePrefFile (in nsIFile aFile); */
  NS_SCRIPTABLE NS_IMETHOD SavePrefFile(nsIFile *aFile) = 0;

  /**
   * Call to get a Preferences "Branch" which accesses user preference data.
   * Using a Set method on this object will always create or set a user
   * preference value. When using a Get method a user set value will be
   * returned if one exists, otherwise a default value will be returned.
   *
   * @param aPrefRoot The preference "root" on which to base this "branch".
   *                  For example, if the root "browser.startup." is used, the
   *                  branch will be able to easily access the preferences
   *                  "browser.startup.page", "browser.startup.homepage", or
   *                  "browser.startup.homepage_override" by simply requesting
   *                  "page", "homepage", or "homepage_override". nsnull or "" 
   *                  may be used to access to the entire preference "tree".
   *
   * @return nsIPrefBranch The object representing the requested branch.
   *
   * @see getDefaultBranch
   */
  /* nsIPrefBranch getBranch (in string aPrefRoot); */
  NS_SCRIPTABLE NS_IMETHOD GetBranch(const char *aPrefRoot, nsIPrefBranch **_retval) = 0;

  /**
   * Call to get a Preferences "Branch" which accesses only the default 
   * preference data. Using a Set method on this object will always create or
   * set a default preference value. When using a Get method a default value
   * will always be returned.
   *
   * @param aPrefRoot The preference "root" on which to base this "branch".
   *                  For example, if the root "browser.startup." is used, the
   *                  branch will be able to easily access the preferences
   *                  "browser.startup.page", "browser.startup.homepage", or
   *                  "browser.startup.homepage_override" by simply requesting
   *                  "page", "homepage", or "homepage_override". nsnull or "" 
   *                  may be used to access to the entire preference "tree".
   *
   * @note
   * Few consumers will want to create default branch objects. Many of the
   * branch methods do nothing on a default branch because the operations only
   * make sense when applied to user set preferences.
   *
   * @return nsIPrefBranch The object representing the requested default branch.
   *
   * @see getBranch
   */
  /* nsIPrefBranch getDefaultBranch (in string aPrefRoot); */
  NS_SCRIPTABLE NS_IMETHOD GetDefaultBranch(const char *aPrefRoot, nsIPrefBranch **_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIPrefService, NS_IPREFSERVICE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIPREFSERVICE \
  NS_SCRIPTABLE NS_IMETHOD ReadUserPrefs(nsIFile *aFile); \
  NS_SCRIPTABLE NS_IMETHOD ResetPrefs(void); \
  NS_SCRIPTABLE NS_IMETHOD ResetUserPrefs(void); \
  NS_SCRIPTABLE NS_IMETHOD SavePrefFile(nsIFile *aFile); \
  NS_SCRIPTABLE NS_IMETHOD GetBranch(const char *aPrefRoot, nsIPrefBranch **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultBranch(const char *aPrefRoot, nsIPrefBranch **_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIPREFSERVICE(_to) \
  NS_SCRIPTABLE NS_IMETHOD ReadUserPrefs(nsIFile *aFile) { return _to ReadUserPrefs(aFile); } \
  NS_SCRIPTABLE NS_IMETHOD ResetPrefs(void) { return _to ResetPrefs(); } \
  NS_SCRIPTABLE NS_IMETHOD ResetUserPrefs(void) { return _to ResetUserPrefs(); } \
  NS_SCRIPTABLE NS_IMETHOD SavePrefFile(nsIFile *aFile) { return _to SavePrefFile(aFile); } \
  NS_SCRIPTABLE NS_IMETHOD GetBranch(const char *aPrefRoot, nsIPrefBranch **_retval) { return _to GetBranch(aPrefRoot, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultBranch(const char *aPrefRoot, nsIPrefBranch **_retval) { return _to GetDefaultBranch(aPrefRoot, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIPREFSERVICE(_to) \
  NS_SCRIPTABLE NS_IMETHOD ReadUserPrefs(nsIFile *aFile) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadUserPrefs(aFile); } \
  NS_SCRIPTABLE NS_IMETHOD ResetPrefs(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->ResetPrefs(); } \
  NS_SCRIPTABLE NS_IMETHOD ResetUserPrefs(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->ResetUserPrefs(); } \
  NS_SCRIPTABLE NS_IMETHOD SavePrefFile(nsIFile *aFile) { return !_to ? NS_ERROR_NULL_POINTER : _to->SavePrefFile(aFile); } \
  NS_SCRIPTABLE NS_IMETHOD GetBranch(const char *aPrefRoot, nsIPrefBranch **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBranch(aPrefRoot, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDefaultBranch(const char *aPrefRoot, nsIPrefBranch **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDefaultBranch(aPrefRoot, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsPrefService : public nsIPrefService
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPREFSERVICE

  nsPrefService();

private:
  ~nsPrefService();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsPrefService, nsIPrefService)

nsPrefService::nsPrefService()
{
  /* member initializers and constructor code */
}

nsPrefService::~nsPrefService()
{
  /* destructor code */
}

/* void readUserPrefs (in nsIFile aFile); */
NS_IMETHODIMP nsPrefService::ReadUserPrefs(nsIFile *aFile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void resetPrefs (); */
NS_IMETHODIMP nsPrefService::ResetPrefs()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void resetUserPrefs (); */
NS_IMETHODIMP nsPrefService::ResetUserPrefs()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void savePrefFile (in nsIFile aFile); */
NS_IMETHODIMP nsPrefService::SavePrefFile(nsIFile *aFile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIPrefBranch getBranch (in string aPrefRoot); */
NS_IMETHODIMP nsPrefService::GetBranch(const char *aPrefRoot, nsIPrefBranch **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIPrefBranch getDefaultBranch (in string aPrefRoot); */
NS_IMETHODIMP nsPrefService::GetDefaultBranch(const char *aPrefRoot, nsIPrefBranch **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

#define NS_PREFSERVICE_CID                             \
  { /* {1cd91b88-1dd2-11b2-92e1-ed22ed298000} */       \
    0x1cd91b88,                                        \
    0x1dd2,                                            \
    0x11b2,                                            \
    { 0x92, 0xe1, 0xed, 0x22, 0xed, 0x29, 0x80, 0x00 } \
  }
#define NS_PREFSERVICE_CONTRACTID "@mozilla.org/preferences-service;1"
#define NS_PREFSERVICE_CLASSNAME "Preferences Server"
/**
 * Notification sent before reading the default user preferences files.
 */
#define NS_PREFSERVICE_READ_TOPIC_ID "prefservice:before-read-userprefs"
/**
 * Notification sent when resetPrefs has been called, but before the actual
 * reset process occurs.
 */
#define NS_PREFSERVICE_RESET_TOPIC_ID "prefservice:before-reset"
/**
 * Notification sent when after reading app-provided default
 * preferences, but before user profile override defaults or extension
 * defaults are loaded.
 */
#define NS_PREFSERVICE_APPDEFAULTS_TOPIC_ID "prefservice:after-app-defaults"

#endif /* __gen_nsIPrefService_h__ */
