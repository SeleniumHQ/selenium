#include "build_environment.h"

#ifndef GECKO_19_COMPATIBILITY

#ifndef BUILD_ON_UNIX
#define MOZ_NO_MOZALLOC
#include <mozilla-config.h>
#endif

#include <xpcom-config.h>
#undef HAVE_CPP_CHAR16_T

#else // Gecko 1.9
#ifdef BUILD_ON_UNIX
#include <xpcom-config.h>
#endif
#endif

#include "errorcodes.h"
#include "interactions.h"
#include "logging.h"
#include "native_events.h"
#include "native_mouse.h"
#include "native_keyboard.h"
#include "native_ime.h"

#ifndef GECKO_19_COMPATIBILITY
#include "mozilla/ModuleUtils.h"
#else
#include "nsIGenericFactory.h"
#endif

#include "nsIComponentManager.h"
#include "nsComponentManagerUtils.h"
#include <assert.h>

#ifdef BUILD_ON_WINDOWS
#define WD_RESULT LRESULT
#else
#define WD_RESULT int
#endif

#ifdef BUILD_ON_UNIX
#ifdef __cplusplus
extern "C" {
#endif
// include the function declarations to the ignore-no-focus library for Linux.
void notify_of_switch_to_window(PRInt32 windowId);
void notify_of_close_window(PRInt32 windowId);

#ifdef __cplusplus
}
#endif
#endif // BUILD_ON_UNIX


NS_IMPL_ISUPPORTS1(nsNativeEvents, nsINativeEvents)

nsNativeEvents::nsNativeEvents()
{
  LOG(DEBUG) << "Starting up";
}

nsNativeEvents::~nsNativeEvents()
{
}

/* void notifyOfSwitchToWindow (); */
NS_IMETHODIMP nsNativeEvents::NotifyOfSwitchToWindow(PRInt32 windowId)
{
  // This code is only needed for Linux.
#ifdef BUILD_ON_UNIX
  notify_of_switch_to_window(windowId);
#endif // BUILD_ON_UNIX
  return NS_OK;
}

/* void notifyOfCloseWindow (); */
NS_IMETHODIMP nsNativeEvents::NotifyOfCloseWindow(PRInt32 windowId)
{
#ifdef BUILD_ON_UNIX
  notify_of_close_window(windowId);
#endif // BUILD_ON_UNIX
  return NS_OK;
}


/* void hasUnhandledEvents (in nsISupports aNode, out boolean hasEvents); */
NS_IMETHODIMP nsNativeEvents::HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents)
{
  *hasEvents = pending_input_events();
  return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(nsNativeEvents)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsNativeMouse)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsNativeKeyboard)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsNativeIME)

// Common case - build for Gecko SDK 2 and up
#ifndef GECKO_19_COMPATIBILITY

NS_DEFINE_NAMED_CID(EVENTS_CID);
NS_DEFINE_NAMED_CID(MOUSE_CID);
NS_DEFINE_NAMED_CID(KEYBOARD_CID);
NS_DEFINE_NAMED_CID(IME_CID);

static const mozilla::Module::CIDEntry kNativeEventsCIDs[] = {
  { &kEVENTS_CID, false, NULL, nsNativeEventsConstructor },
  { &kMOUSE_CID, false, NULL, nsNativeMouseConstructor },
  { &kKEYBOARD_CID, false, NULL, nsNativeKeyboardConstructor },
  { &kIME_CID, false, NULL, nsNativeIMEConstructor },
  { NULL }
};

static const mozilla::Module::ContractIDEntry kNativeEventsContracts[] = {
  { EVENTS_CONTRACTID, &kEVENTS_CID },
  { MOUSE_CONTRACTID, &kMOUSE_CID },
  { KEYBOARD_CONTRACTID, &kKEYBOARD_CID },
  { IME_CONTRACTID, &kIME_CID },
  { NULL }
};

static const mozilla::Module kNativeEventsModule = {
  mozilla::Module::kVersion,
  kNativeEventsCIDs,
  kNativeEventsContracts,
  NULL
};

NSMODULE_DEFN(nsNativeEvents) = &kNativeEventsModule;

NS_IMPL_MOZILLA192_NSGETMODULE(&kNativeEventsModule)

#else
// Gecko 1.9

static nsModuleComponentInfo components[] =
{
  {
    EVENTS_CLASSNAME, 
    EVENTS_CID,
    EVENTS_CONTRACTID,
    nsNativeEventsConstructor,
  },
  {
    MOUSE_CLASSNAME,
    MOUSE_CID,
    MOUSE_CONTRACTID,
    nsNativeMouseConstructor,
  },
  {
    KEYBOARD_CLASSNAME,
    KEYBOARD_CID,
    KEYBOARD_CONTRACTID,
    nsNativeKeyboardConstructor,
  },
  {
    IME_CLASSNAME,
    IME_CID,
    IME_CONTRACTID,
    nsNativeIMEConstructor,
  }
};

NS_IMPL_NSGETMODULE("NativeEventsModule", components)
#endif
