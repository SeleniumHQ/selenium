/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/profile/public/nsIProfileChangeStatus.idl
 */

#ifndef __gen_nsIProfileChangeStatus_h__
#define __gen_nsIProfileChangeStatus_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
   /**
    * nsIObserver topics for profile changing. Profile changing happens in phases
    * in the order given below. An observer may register separately for each phase
    * of the process depending on its needs. The subject passed to the observer's
    * Observe() method can be QI'd to an nsIProfileChangeStatus.
    *
    * "profile-approve-change"
    *   Called before a profile change is attempted. Typically,
    *   the application level observer will ask the user if
    *   he/she wants to stop all network activity, close all open
    *   windows, etc. If the user says NO, the observer should
    *   call the subject's vetoChange(). If any observer does
    *   this, the profile will not be changed.
    *
    * "profile-change-teardown"
    *   All async activity must be stopped in this phase. Typically,
    *   the application level observer will close all open windows.
    *   This is the last phase in which the subject's vetoChange()
    *   method may still be called. 
    *   The next notification will be either 
    *   profile-change-teardown-veto or profile-before-change.
    *
    * "profile-change-teardown-veto"
    *   This notification will only be sent, if the profile change 
    *   was vetoed during the profile-change-teardown phase.
    *   This allows components to bring back required resources,
    *   that were tore down on profile-change-teardown.
    *
    * "profile-before-change"
    *   Called before the profile has changed. Use this notification
    *   to prepare for the profile going away. If a component is
    *   holding any state which needs to be flushed to a profile-relative
    *   location, it should be done here.
    *
    * "profile-do-change"
    *   Called after the profile has changed. Do the work to
    *   respond to having a new profile. Any change which
    *   affects others must be done in this phase.
    *
    * "profile-after-change"
    *   Called after the profile has changed. Use this notification
    *   to make changes that are dependent on what some other listener
    *   did during its profile-do-change. For example, to respond to
    *   new preferences. 
    *
    * "profile-initial-state"
    *   Called after all phases of a change have completed. Typically
    *   in this phase, an application level observer will open a new window.
    *
    * Contexts for profile changes. These are passed as the someData param to the
    * observer's Observe() method.
    
    * "startup"
    *   Going from no profile to a profile.
    *
    *   The following topics happen in this context:
    *       profile-do-change
    *       profile-after-change
    *
    * "shutdown-persist"
    *   The user is logging out and whatever data the observer stores
    *   for the current profile should be released from memory and
    *   saved to disk.
    *
    * "shutdown-cleanse"
    *   The user is logging out and whatever data the observer stores
    *   for the current profile should be released from memory and
    *   deleted from disk.
    *
    *   The following topics happen in both shutdown contexts:
    *       profile-approve-change
    *       profile-change-teardown
    *       profile-before-change
    *
    * "switch"
    *   Going from one profile to another.
    *
    *   All of the above topics happen in a profile switch.
    *
    */  

/* starting interface:    nsIProfileChangeStatus */
#define NS_IPROFILECHANGESTATUS_IID_STR "2f977d43-5485-11d4-87e2-0010a4e75ef2"

#define NS_IPROFILECHANGESTATUS_IID \
  {0x2f977d43, 0x5485, 0x11d4, \
    { 0x87, 0xe2, 0x00, 0x10, 0xa4, 0xe7, 0x5e, 0xf2 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIProfileChangeStatus : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IPROFILECHANGESTATUS_IID)

  /* void vetoChange (); */
  NS_SCRIPTABLE NS_IMETHOD VetoChange(void) = 0;

  /**
    * Called by a profile change observer when a fatal error
    * occurred during the attempt to switch the profile.
    *
    * The profile should be considered in an unsafe condition,
    * and the profile manager should inform the user and
    * exit immediately.
    *
    */
  /* void changeFailed (); */
  NS_SCRIPTABLE NS_IMETHOD ChangeFailed(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIProfileChangeStatus, NS_IPROFILECHANGESTATUS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIPROFILECHANGESTATUS \
  NS_SCRIPTABLE NS_IMETHOD VetoChange(void); \
  NS_SCRIPTABLE NS_IMETHOD ChangeFailed(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIPROFILECHANGESTATUS(_to) \
  NS_SCRIPTABLE NS_IMETHOD VetoChange(void) { return _to VetoChange(); } \
  NS_SCRIPTABLE NS_IMETHOD ChangeFailed(void) { return _to ChangeFailed(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIPROFILECHANGESTATUS(_to) \
  NS_SCRIPTABLE NS_IMETHOD VetoChange(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->VetoChange(); } \
  NS_SCRIPTABLE NS_IMETHOD ChangeFailed(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->ChangeFailed(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsProfileChangeStatus : public nsIProfileChangeStatus
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPROFILECHANGESTATUS

  nsProfileChangeStatus();

private:
  ~nsProfileChangeStatus();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsProfileChangeStatus, nsIProfileChangeStatus)

nsProfileChangeStatus::nsProfileChangeStatus()
{
  /* member initializers and constructor code */
}

nsProfileChangeStatus::~nsProfileChangeStatus()
{
  /* destructor code */
}

/* void vetoChange (); */
NS_IMETHODIMP nsProfileChangeStatus::VetoChange()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void changeFailed (); */
NS_IMETHODIMP nsProfileChangeStatus::ChangeFailed()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIProfileChangeStatus_h__ */
