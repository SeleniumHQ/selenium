/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/modules/libpref/public/nsIPrefBranch.idl
 */

#ifndef __gen_nsIPrefBranch_h__
#define __gen_nsIPrefBranch_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIPrefBranch */
#define NS_IPREFBRANCH_IID_STR "56c35506-f14b-11d3-99d3-ddbfac2ccf65"

#define NS_IPREFBRANCH_IID \
  {0x56c35506, 0xf14b, 0x11d3, \
    { 0x99, 0xd3, 0xdd, 0xbf, 0xac, 0x2c, 0xcf, 0x65 }}

/**
 * The nsIPrefBranch interface is used to manipulate the preferences data. This
 * object may be obtained from the preferences service (nsIPrefService) and
 * used to get and set default and/or user preferences across the application.
 *
 * This object is created with a "root" value which describes the base point in
 * the preferences "tree" from which this "branch" stems. Preferences are
 * accessed off of this root by using just the final portion of the preference.
 * For example, if this object is created with the root "browser.startup.",
 * the preferences "browser.startup.page", "browser.startup.homepage",
 * and "browser.startup.homepage_override" can be accessed by simply passing
 * "page", "homepage", or "homepage_override" to the various Get/Set methods.
 *
 * @see nsIPrefService
 * 
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIPrefBranch : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IPREFBRANCH_IID)

  /**
   * Values describing the basic preference types.
   *
   * @see getPrefType
   */
  enum { PREF_INVALID = 0 };

  enum { PREF_STRING = 32 };

  enum { PREF_INT = 64 };

  enum { PREF_BOOL = 128 };

  /**
   * Called to get the root on which this branch is based, such as
   * "browser.startup."
   */
  /* readonly attribute string root; */
  NS_SCRIPTABLE NS_IMETHOD GetRoot(char * *aRoot) = 0;

  /**
   * Called to determine the type of a specific preference.
   *
   * @param aPrefName The preference to get the type of.
   *
   * @return long     A value representing the type of the preference. This
   *                  value will be PREF_STRING, PREF_INT, or PREF_BOOL.
   */
  /* long getPrefType (in string aPrefName); */
  NS_SCRIPTABLE NS_IMETHOD GetPrefType(const char *aPrefName, PRInt32 *_retval) = 0;

  /**
   * Called to get the state of an individual boolean preference.
   *
   * @param aPrefName The boolean preference to get the state of.
   *
   * @return boolean  The value of the requested boolean preference.
   *
   * @see setBoolPref
   */
  /* boolean getBoolPref (in string aPrefName); */
  NS_SCRIPTABLE NS_IMETHOD GetBoolPref(const char *aPrefName, PRBool *_retval) = 0;

  /**
   * Called to set the state of an individual boolean preference.
   *
   * @param aPrefName The boolean preference to set the state of.
   * @param aValue    The boolean value to set the preference to.
   *
   * @return NS_OK The value was successfully set.
   * @return Other The value was not set or is the wrong type.
   *
   * @see getBoolPref
   */
  /* void setBoolPref (in string aPrefName, in long aValue); */
  NS_SCRIPTABLE NS_IMETHOD SetBoolPref(const char *aPrefName, PRInt32 aValue) = 0;

  /**
   * Called to get the state of an individual string preference.
   *
   * @param aPrefName The string preference to retrieve.
   *
   * @return string   The value of the requested string preference.
   *
   * @see setCharPref
   */
  /* string getCharPref (in string aPrefName); */
  NS_SCRIPTABLE NS_IMETHOD GetCharPref(const char *aPrefName, char **_retval) = 0;

  /**
   * Called to set the state of an individual string preference.
   *
   * @param aPrefName The string preference to set.
   * @param aValue    The string value to set the preference to.
   *
   * @return NS_OK The value was successfully set.
   * @return Other The value was not set or is the wrong type.
   *
   * @see getCharPref
   */
  /* void setCharPref (in string aPrefName, in string aValue); */
  NS_SCRIPTABLE NS_IMETHOD SetCharPref(const char *aPrefName, const char *aValue) = 0;

  /**
   * Called to get the state of an individual integer preference.
   *
   * @param aPrefName The integer preference to get the value of.
   *
   * @return long     The value of the requested integer preference.
   *
   * @see setIntPref
   */
  /* long getIntPref (in string aPrefName); */
  NS_SCRIPTABLE NS_IMETHOD GetIntPref(const char *aPrefName, PRInt32 *_retval) = 0;

  /**
   * Called to set the state of an individual integer preference.
   *
   * @param aPrefName The integer preference to set the value of.
   * @param aValue    The integer value to set the preference to.
   *
   * @return NS_OK The value was successfully set.
   * @return Other The value was not set or is the wrong type.
   *
   * @see getIntPref
   */
  /* void setIntPref (in string aPrefName, in long aValue); */
  NS_SCRIPTABLE NS_IMETHOD SetIntPref(const char *aPrefName, PRInt32 aValue) = 0;

  /**
   * Called to get the state of an individual complex preference. A complex
   * preference is a preference which represents an XPCOM object that can not
   * be easily represented using a standard boolean, integer or string value.
   *
   * @param aPrefName The complex preference to get the value of.
   * @param aType     The XPCOM interface that this complex preference
   *                  represents. Interfaces currently supported are:
   *                    - nsILocalFile
   *                    - nsISupportsString (UniChar)
   *                    - nsIPrefLocalizedString (Localized UniChar)
   *                    - nsIFileSpec (deprecated - to be removed eventually)
   * @param aValue    The XPCOM object into which to the complex preference 
   *                  value should be retrieved.
   *
   * @return NS_OK The value was successfully retrieved.
   * @return Other The value does not exist or is the wrong type.
   *
   * @see setComplexValue
   */
  /* void getComplexValue (in string aPrefName, in nsIIDRef aType, [iid_is (aType), retval] out nsQIResult aValue); */
  NS_SCRIPTABLE NS_IMETHOD GetComplexValue(const char *aPrefName, const nsIID & aType, void * *aValue) = 0;

  /**
   * Called to set the state of an individual complex preference. A complex
   * preference is a preference which represents an XPCOM object that can not
   * be easily represented using a standard boolean, integer or string value.
   *
   * @param aPrefName The complex preference to set the value of.
   * @param aType     The XPCOM interface that this complex preference
   *                  represents. Interfaces currently supported are:
   *                    - nsILocalFile
   *                    - nsISupportsString (UniChar)
   *                    - nsIPrefLocalizedString (Localized UniChar)
   *                    - nsIFileSpec (deprecated - to be removed eventually)
   * @param aValue    The XPCOM object from which to set the complex preference 
   *                  value.
   *
   * @return NS_OK The value was successfully set.
   * @return Other The value was not set or is the wrong type.
   *
   * @see getComplexValue
   */
  /* void setComplexValue (in string aPrefName, in nsIIDRef aType, in nsISupports aValue); */
  NS_SCRIPTABLE NS_IMETHOD SetComplexValue(const char *aPrefName, const nsIID & aType, nsISupports *aValue) = 0;

  /**
   * Called to clear a user set value from a specific preference. This will, in
   * effect, reset the value to the default value. If no default value exists
   * the preference will cease to exist.
   *
   * @param aPrefName The preference to be cleared.
   *
   * @note
   * This method does nothing if this object is a default branch.
   *
   * @return NS_OK The user preference was successfully cleared.
   * @return Other The preference does not exist or have a user set value.
   */
  /* void clearUserPref (in string aPrefName); */
  NS_SCRIPTABLE NS_IMETHOD ClearUserPref(const char *aPrefName) = 0;

  /**
   * Called to lock a specific preference. Locking a preference will cause the
   * preference service to always return the default value regardless of
   * whether there is a user set value or not.
   *
   * @param aPrefName The preference to be locked.
   *
   * @note
   * This method can be called on either a default or user branch but, in
   * effect, always operates on the default branch.
   *
   * @return NS_OK The preference was successfully locked.
   * @return Other The preference does not exist or an error occurred.
   *
   * @see unlockPref
   */
  /* void lockPref (in string aPrefName); */
  NS_SCRIPTABLE NS_IMETHOD LockPref(const char *aPrefName) = 0;

  /**
   * Called to check if a specific preference has a user value associated to
   * it.
   *
   * @param aPrefName The preference to be tested.
   *
   * @note
   * This method can be called on either a default or user branch but, in
   * effect, always operates on the user branch.
   *
   * @note
   * If a preference was manually set to a value that equals the default value,
   * then the preference no longer has a user set value, i.e. it is
   * considered reset to its default value.
   * In particular, this method will return false for such a preference and
   * the preference will not be saved to a file by nsIPrefService.savePrefFile.
   *
   * @return boolean  true  The preference has a user set value.
   *                  false The preference only has a default value.
   */
  /* boolean prefHasUserValue (in string aPrefName); */
  NS_SCRIPTABLE NS_IMETHOD PrefHasUserValue(const char *aPrefName, PRBool *_retval) = 0;

  /**
   * Called to check if a specific preference is locked. If a preference is
   * locked calling its Get method will always return the default value.
   *
   * @param aPrefName The preference to be tested.
   *
   * @note
   * This method can be called on either a default or user branch but, in
   * effect, always operates on the default branch.
   *
   * @return boolean  true  The preference is locked.
   *                  false The preference is not locked.
   *
   * @see lockPref
   * @see unlockPref
   */
  /* boolean prefIsLocked (in string aPrefName); */
  NS_SCRIPTABLE NS_IMETHOD PrefIsLocked(const char *aPrefName, PRBool *_retval) = 0;

  /**
   * Called to unlock a specific preference. Unlocking a previously locked 
   * preference allows the preference service to once again return the user set
   * value of the preference.
   *
   * @param aPrefName The preference to be unlocked.
   *
   * @note
   * This method can be called on either a default or user branch but, in
   * effect, always operates on the default branch.
   *
   * @return NS_OK The preference was successfully unlocked.
   * @return Other The preference does not exist or an error occurred.
   *
   * @see lockPref
   */
  /* void unlockPref (in string aPrefName); */
  NS_SCRIPTABLE NS_IMETHOD UnlockPref(const char *aPrefName) = 0;

  /**
   * Called to remove all of the preferences referenced by this branch.
   *
   * @param aStartingAt The point on the branch at which to start the deleting
   *                    preferences. Pass in "" to remove all preferences
   *                    referenced by this branch.
   *
   * @note
   * This method can be called on either a default or user branch but, in
   * effect, always operates on both.
   *
   * @return NS_OK The preference(s) were successfully removed.
   * @return Other The preference(s) do not exist or an error occurred.
   */
  /* void deleteBranch (in string aStartingAt); */
  NS_SCRIPTABLE NS_IMETHOD DeleteBranch(const char *aStartingAt) = 0;

  /**
   * Returns an array of strings representing the child preferences of the
   * root of this branch.
   * 
   * @param aStartingAt The point on the branch at which to start enumerating
   *                    the child preferences. Pass in "" to enumerate all
   *                    preferences referenced by this branch.
   * @param aCount      Receives the number of elements in the array.
   * @param aChildArray Receives the array of child preferences.
   *
   * @note
   * This method can be called on either a default or user branch but, in
   * effect, always operates on both.
   *
   * @return NS_OK The preference list was successfully retrieved.
   * @return Other The preference(s) do not exist or an error occurred.
   */
  /* void getChildList (in string aStartingAt, out unsigned long aCount, [array, size_is (aCount), retval] out string aChildArray); */
  NS_SCRIPTABLE NS_IMETHOD GetChildList(const char *aStartingAt, PRUint32 *aCount, char ***aChildArray) = 0;

  /**
   * Called to reset all of the preferences referenced by this branch to their
   * default values.
   *
   * @param aStartingAt The point on the branch at which to start the resetting
   *                    preferences to their default values. Pass in "" to
   *                    reset all preferences referenced by this branch.
   *
   * @note
   * This method can be called on either a default or user branch but, in
   * effect, always operates on the user branch.
   *
   * @return NS_OK The preference(s) were successfully reset.
   * @return Other The preference(s) do not exist or an error occurred.
   */
  /* void resetBranch (in string aStartingAt); */
  NS_SCRIPTABLE NS_IMETHOD ResetBranch(const char *aStartingAt) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIPrefBranch, NS_IPREFBRANCH_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIPREFBRANCH \
  NS_SCRIPTABLE NS_IMETHOD GetRoot(char * *aRoot); \
  NS_SCRIPTABLE NS_IMETHOD GetPrefType(const char *aPrefName, PRInt32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetBoolPref(const char *aPrefName, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetBoolPref(const char *aPrefName, PRInt32 aValue); \
  NS_SCRIPTABLE NS_IMETHOD GetCharPref(const char *aPrefName, char **_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetCharPref(const char *aPrefName, const char *aValue); \
  NS_SCRIPTABLE NS_IMETHOD GetIntPref(const char *aPrefName, PRInt32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetIntPref(const char *aPrefName, PRInt32 aValue); \
  NS_SCRIPTABLE NS_IMETHOD GetComplexValue(const char *aPrefName, const nsIID & aType, void * *aValue); \
  NS_SCRIPTABLE NS_IMETHOD SetComplexValue(const char *aPrefName, const nsIID & aType, nsISupports *aValue); \
  NS_SCRIPTABLE NS_IMETHOD ClearUserPref(const char *aPrefName); \
  NS_SCRIPTABLE NS_IMETHOD LockPref(const char *aPrefName); \
  NS_SCRIPTABLE NS_IMETHOD PrefHasUserValue(const char *aPrefName, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD PrefIsLocked(const char *aPrefName, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD UnlockPref(const char *aPrefName); \
  NS_SCRIPTABLE NS_IMETHOD DeleteBranch(const char *aStartingAt); \
  NS_SCRIPTABLE NS_IMETHOD GetChildList(const char *aStartingAt, PRUint32 *aCount, char ***aChildArray); \
  NS_SCRIPTABLE NS_IMETHOD ResetBranch(const char *aStartingAt); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIPREFBRANCH(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetRoot(char * *aRoot) { return _to GetRoot(aRoot); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrefType(const char *aPrefName, PRInt32 *_retval) { return _to GetPrefType(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetBoolPref(const char *aPrefName, PRBool *_retval) { return _to GetBoolPref(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetBoolPref(const char *aPrefName, PRInt32 aValue) { return _to SetBoolPref(aPrefName, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetCharPref(const char *aPrefName, char **_retval) { return _to GetCharPref(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetCharPref(const char *aPrefName, const char *aValue) { return _to SetCharPref(aPrefName, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetIntPref(const char *aPrefName, PRInt32 *_retval) { return _to GetIntPref(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetIntPref(const char *aPrefName, PRInt32 aValue) { return _to SetIntPref(aPrefName, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetComplexValue(const char *aPrefName, const nsIID & aType, void * *aValue) { return _to GetComplexValue(aPrefName, aType, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetComplexValue(const char *aPrefName, const nsIID & aType, nsISupports *aValue) { return _to SetComplexValue(aPrefName, aType, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD ClearUserPref(const char *aPrefName) { return _to ClearUserPref(aPrefName); } \
  NS_SCRIPTABLE NS_IMETHOD LockPref(const char *aPrefName) { return _to LockPref(aPrefName); } \
  NS_SCRIPTABLE NS_IMETHOD PrefHasUserValue(const char *aPrefName, PRBool *_retval) { return _to PrefHasUserValue(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD PrefIsLocked(const char *aPrefName, PRBool *_retval) { return _to PrefIsLocked(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD UnlockPref(const char *aPrefName) { return _to UnlockPref(aPrefName); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteBranch(const char *aStartingAt) { return _to DeleteBranch(aStartingAt); } \
  NS_SCRIPTABLE NS_IMETHOD GetChildList(const char *aStartingAt, PRUint32 *aCount, char ***aChildArray) { return _to GetChildList(aStartingAt, aCount, aChildArray); } \
  NS_SCRIPTABLE NS_IMETHOD ResetBranch(const char *aStartingAt) { return _to ResetBranch(aStartingAt); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIPREFBRANCH(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetRoot(char * *aRoot) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRoot(aRoot); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrefType(const char *aPrefName, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPrefType(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetBoolPref(const char *aPrefName, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBoolPref(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetBoolPref(const char *aPrefName, PRInt32 aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBoolPref(aPrefName, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetCharPref(const char *aPrefName, char **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCharPref(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetCharPref(const char *aPrefName, const char *aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCharPref(aPrefName, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetIntPref(const char *aPrefName, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIntPref(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetIntPref(const char *aPrefName, PRInt32 aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetIntPref(aPrefName, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetComplexValue(const char *aPrefName, const nsIID & aType, void * *aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetComplexValue(aPrefName, aType, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetComplexValue(const char *aPrefName, const nsIID & aType, nsISupports *aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetComplexValue(aPrefName, aType, aValue); } \
  NS_SCRIPTABLE NS_IMETHOD ClearUserPref(const char *aPrefName) { return !_to ? NS_ERROR_NULL_POINTER : _to->ClearUserPref(aPrefName); } \
  NS_SCRIPTABLE NS_IMETHOD LockPref(const char *aPrefName) { return !_to ? NS_ERROR_NULL_POINTER : _to->LockPref(aPrefName); } \
  NS_SCRIPTABLE NS_IMETHOD PrefHasUserValue(const char *aPrefName, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->PrefHasUserValue(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD PrefIsLocked(const char *aPrefName, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->PrefIsLocked(aPrefName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD UnlockPref(const char *aPrefName) { return !_to ? NS_ERROR_NULL_POINTER : _to->UnlockPref(aPrefName); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteBranch(const char *aStartingAt) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteBranch(aStartingAt); } \
  NS_SCRIPTABLE NS_IMETHOD GetChildList(const char *aStartingAt, PRUint32 *aCount, char ***aChildArray) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChildList(aStartingAt, aCount, aChildArray); } \
  NS_SCRIPTABLE NS_IMETHOD ResetBranch(const char *aStartingAt) { return !_to ? NS_ERROR_NULL_POINTER : _to->ResetBranch(aStartingAt); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsPrefBranch : public nsIPrefBranch
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPREFBRANCH

  nsPrefBranch();

private:
  ~nsPrefBranch();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsPrefBranch, nsIPrefBranch)

nsPrefBranch::nsPrefBranch()
{
  /* member initializers and constructor code */
}

nsPrefBranch::~nsPrefBranch()
{
  /* destructor code */
}

/* readonly attribute string root; */
NS_IMETHODIMP nsPrefBranch::GetRoot(char * *aRoot)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* long getPrefType (in string aPrefName); */
NS_IMETHODIMP nsPrefBranch::GetPrefType(const char *aPrefName, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean getBoolPref (in string aPrefName); */
NS_IMETHODIMP nsPrefBranch::GetBoolPref(const char *aPrefName, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setBoolPref (in string aPrefName, in long aValue); */
NS_IMETHODIMP nsPrefBranch::SetBoolPref(const char *aPrefName, PRInt32 aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* string getCharPref (in string aPrefName); */
NS_IMETHODIMP nsPrefBranch::GetCharPref(const char *aPrefName, char **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setCharPref (in string aPrefName, in string aValue); */
NS_IMETHODIMP nsPrefBranch::SetCharPref(const char *aPrefName, const char *aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* long getIntPref (in string aPrefName); */
NS_IMETHODIMP nsPrefBranch::GetIntPref(const char *aPrefName, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setIntPref (in string aPrefName, in long aValue); */
NS_IMETHODIMP nsPrefBranch::SetIntPref(const char *aPrefName, PRInt32 aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getComplexValue (in string aPrefName, in nsIIDRef aType, [iid_is (aType), retval] out nsQIResult aValue); */
NS_IMETHODIMP nsPrefBranch::GetComplexValue(const char *aPrefName, const nsIID & aType, void * *aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setComplexValue (in string aPrefName, in nsIIDRef aType, in nsISupports aValue); */
NS_IMETHODIMP nsPrefBranch::SetComplexValue(const char *aPrefName, const nsIID & aType, nsISupports *aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void clearUserPref (in string aPrefName); */
NS_IMETHODIMP nsPrefBranch::ClearUserPref(const char *aPrefName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void lockPref (in string aPrefName); */
NS_IMETHODIMP nsPrefBranch::LockPref(const char *aPrefName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean prefHasUserValue (in string aPrefName); */
NS_IMETHODIMP nsPrefBranch::PrefHasUserValue(const char *aPrefName, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean prefIsLocked (in string aPrefName); */
NS_IMETHODIMP nsPrefBranch::PrefIsLocked(const char *aPrefName, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void unlockPref (in string aPrefName); */
NS_IMETHODIMP nsPrefBranch::UnlockPref(const char *aPrefName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteBranch (in string aStartingAt); */
NS_IMETHODIMP nsPrefBranch::DeleteBranch(const char *aStartingAt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getChildList (in string aStartingAt, out unsigned long aCount, [array, size_is (aCount), retval] out string aChildArray); */
NS_IMETHODIMP nsPrefBranch::GetChildList(const char *aStartingAt, PRUint32 *aCount, char ***aChildArray)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void resetBranch (in string aStartingAt); */
NS_IMETHODIMP nsPrefBranch::ResetBranch(const char *aStartingAt)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

#define NS_PREFBRANCH_CONTRACTID "@mozilla.org/preferencesbranch;1"
#define NS_PREFBRANCH_CLASSNAME "Preferences Branch"

#endif /* __gen_nsIPrefBranch_h__ */
