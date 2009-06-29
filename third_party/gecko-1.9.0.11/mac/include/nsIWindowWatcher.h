/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/embedding/components/windowwatcher/public/nsIWindowWatcher.idl
 */

#ifndef __gen_nsIWindowWatcher_h__
#define __gen_nsIWindowWatcher_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIDOMWindow; /* forward declaration */

class nsIObserver; /* forward declaration */

class nsIPrompt; /* forward declaration */

class nsIAuthPrompt; /* forward declaration */

class nsISimpleEnumerator; /* forward declaration */

class nsIWebBrowserChrome; /* forward declaration */

class nsIWindowCreator; /* forward declaration */


/* starting interface:    nsIWindowWatcher */
#define NS_IWINDOWWATCHER_IID_STR "002286a8-494b-43b3-8ddd-49e3fc50622b"

#define NS_IWINDOWWATCHER_IID \
  {0x002286a8, 0x494b, 0x43b3, \
    { 0x8d, 0xdd, 0x49, 0xe3, 0xfc, 0x50, 0x62, 0x2b }}

/**
 * nsIWindowWatcher is the keeper of Gecko/DOM Windows. It maintains
 * a list of open top-level windows, and allows some operations on them.

 * Usage notes:

 *   This component has an |activeWindow| property. Clients may expect
 * this property to be always current, so to properly integrate this component
 * the application will need to keep it current by setting the property
 * as the active window changes.
 *   This component should not keep a (XPCOM) reference to any windows;
 * the implementation will claim no ownership. Windows must notify
 * this component when they are created or destroyed, so only a weak
 * reference is kept. Note that there is no interface for such notifications
 * (not a public one, anyway). This is taken care of both in Mozilla and
 * by common embedding code. Embedding clients need do nothing special
 * about that requirement.
 *   This component must be initialized at application startup by calling
 * setWindowCreator.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWindowWatcher : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWINDOWWATCHER_IID)

  /** Create a new window. It will automatically be added to our list
      (via addWindow()).
      @param aParent parent window, if any. Null if no parent.  If it is
             impossible to get to an nsIWebBrowserChrome from aParent, this
             method will effectively act as if aParent were null.
      @param aURL url to which to open the new window. Must already be
             escaped, if applicable. can be null.
      @param aName window name from JS window.open. can be null.  If a window
             with this name already exists, the openWindow call may just load
             aUrl in it (if aUrl is not null) and return it.
      @param aFeatures window features from JS window.open. can be null.
      @param aArguments extra argument(s) to the new window, to be attached
             as the |arguments| property. An nsISupportsArray will be
             unwound into multiple arguments (but not recursively!).
             can be null.
      @return the new window

      @note This method may examine the JS context stack for purposes of
            determining the security context to use for the search for a given
            window named aName.
      @note This method should try to set the default charset for the new
            window to the default charset of aParent.  This is not guaranteed,
            however.
      @note This method may dispatch a "toplevel-window-ready" notification
            via nsIObserverService if the window did not already exist.
  */
  /* nsIDOMWindow openWindow (in nsIDOMWindow aParent, in string aUrl, in string aName, in string aFeatures, in nsISupports aArguments); */
  NS_SCRIPTABLE NS_IMETHOD OpenWindow(nsIDOMWindow *aParent, const char *aUrl, const char *aName, const char *aFeatures, nsISupports *aArguments, nsIDOMWindow **_retval) = 0;

  /** Clients of this service can register themselves to be notified
      when a window is opened or closed (added to or removed from this
      service). This method adds an aObserver to the list of objects
      to be notified.
      @param aObserver the object to be notified when windows are
                       opened or closed. Its Observe method will be
                       called with the following parameters:

      aObserver::Observe interprets its parameters so:
      aSubject the window being opened or closed, sent as an nsISupports
               which can be QIed to an nsIDOMWindow.
      aTopic   a wstring, either "domwindowopened" or "domwindowclosed".
      someData not used.
  */
  /* void registerNotification (in nsIObserver aObserver); */
  NS_SCRIPTABLE NS_IMETHOD RegisterNotification(nsIObserver *aObserver) = 0;

  /** Clients of this service can register themselves to be notified
      when a window is opened or closed (added to or removed from this
      service). This method removes an aObserver from the list of objects
      to be notified.
      @param aObserver the observer to be removed.
  */
  /* void unregisterNotification (in nsIObserver aObserver); */
  NS_SCRIPTABLE NS_IMETHOD UnregisterNotification(nsIObserver *aObserver) = 0;

  /** Get an iterator for currently open windows in the order they were opened,
      guaranteeing that each will be visited exactly once.
      @return an enumerator which will itself return nsISupports objects which
              can be QIed to an nsIDOMWindow
  */
  /* nsISimpleEnumerator getWindowEnumerator (); */
  NS_SCRIPTABLE NS_IMETHOD GetWindowEnumerator(nsISimpleEnumerator **_retval) = 0;

  /** Return a newly created nsIPrompt implementation.
      @param aParent the parent window used for posing alerts. can be null.
      @return a new nsIPrompt object
  */
  /* nsIPrompt getNewPrompter (in nsIDOMWindow aParent); */
  NS_SCRIPTABLE NS_IMETHOD GetNewPrompter(nsIDOMWindow *aParent, nsIPrompt **_retval) = 0;

  /** Return a newly created nsIAuthPrompt implementation.
      @param aParent the parent window used for posing alerts. can be null.
      @return a new nsIAuthPrompt object
  */
  /* nsIAuthPrompt getNewAuthPrompter (in nsIDOMWindow aParent); */
  NS_SCRIPTABLE NS_IMETHOD GetNewAuthPrompter(nsIDOMWindow *aParent, nsIAuthPrompt **_retval) = 0;

  /** Set the window creator callback. It must be filled in by the app.
      openWindow will use it to create new windows.
      @param creator the callback. if null, the callback will be cleared
                     and window creation capabilities lost.
  */
  /* void setWindowCreator (in nsIWindowCreator creator); */
  NS_SCRIPTABLE NS_IMETHOD SetWindowCreator(nsIWindowCreator *creator) = 0;

  /** Retrieve the chrome window mapped to the given DOM window. Window
      Watcher keeps a list of all top-level DOM windows currently open,
      along with their corresponding chrome interfaces. Since DOM Windows
      lack a (public) means of retrieving their corresponding chrome,
      this method will do that.
      @param aWindow the DOM window whose chrome window the caller needs
      @return the corresponding chrome window
  */
  /* nsIWebBrowserChrome getChromeForWindow (in nsIDOMWindow aWindow); */
  NS_SCRIPTABLE NS_IMETHOD GetChromeForWindow(nsIDOMWindow *aWindow, nsIWebBrowserChrome **_retval) = 0;

  /**
      Retrieve an existing window (or frame).
      @param aTargetName the window name
      @param aCurrentWindow a starting point in the window hierarchy to
                            begin the search.  If null, each toplevel window
                            will be searched.

      Note: This method will search all open windows for any window or
      frame with the given window name. Make sure you understand the
      security implications of this before using this method!
  */
  /* nsIDOMWindow getWindowByName (in wstring aTargetName, in nsIDOMWindow aCurrentWindow); */
  NS_SCRIPTABLE NS_IMETHOD GetWindowByName(const PRUnichar *aTargetName, nsIDOMWindow *aCurrentWindow, nsIDOMWindow **_retval) = 0;

  /** The Watcher serves as a global storage facility for the current active
      (frontmost non-floating-palette-type) window, storing and returning
      it on demand. Users must keep this attribute current, including after
      the topmost window is closed. This attribute obviously can return null
      if no windows are open, but should otherwise always return a valid
      window.
  */
  /* attribute nsIDOMWindow activeWindow; */
  NS_SCRIPTABLE NS_IMETHOD GetActiveWindow(nsIDOMWindow * *aActiveWindow) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetActiveWindow(nsIDOMWindow * aActiveWindow) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWindowWatcher, NS_IWINDOWWATCHER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWINDOWWATCHER \
  NS_SCRIPTABLE NS_IMETHOD OpenWindow(nsIDOMWindow *aParent, const char *aUrl, const char *aName, const char *aFeatures, nsISupports *aArguments, nsIDOMWindow **_retval); \
  NS_SCRIPTABLE NS_IMETHOD RegisterNotification(nsIObserver *aObserver); \
  NS_SCRIPTABLE NS_IMETHOD UnregisterNotification(nsIObserver *aObserver); \
  NS_SCRIPTABLE NS_IMETHOD GetWindowEnumerator(nsISimpleEnumerator **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetNewPrompter(nsIDOMWindow *aParent, nsIPrompt **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetNewAuthPrompter(nsIDOMWindow *aParent, nsIAuthPrompt **_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetWindowCreator(nsIWindowCreator *creator); \
  NS_SCRIPTABLE NS_IMETHOD GetChromeForWindow(nsIDOMWindow *aWindow, nsIWebBrowserChrome **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetWindowByName(const PRUnichar *aTargetName, nsIDOMWindow *aCurrentWindow, nsIDOMWindow **_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetActiveWindow(nsIDOMWindow * *aActiveWindow); \
  NS_SCRIPTABLE NS_IMETHOD SetActiveWindow(nsIDOMWindow * aActiveWindow); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWINDOWWATCHER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenWindow(nsIDOMWindow *aParent, const char *aUrl, const char *aName, const char *aFeatures, nsISupports *aArguments, nsIDOMWindow **_retval) { return _to OpenWindow(aParent, aUrl, aName, aFeatures, aArguments, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RegisterNotification(nsIObserver *aObserver) { return _to RegisterNotification(aObserver); } \
  NS_SCRIPTABLE NS_IMETHOD UnregisterNotification(nsIObserver *aObserver) { return _to UnregisterNotification(aObserver); } \
  NS_SCRIPTABLE NS_IMETHOD GetWindowEnumerator(nsISimpleEnumerator **_retval) { return _to GetWindowEnumerator(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetNewPrompter(nsIDOMWindow *aParent, nsIPrompt **_retval) { return _to GetNewPrompter(aParent, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetNewAuthPrompter(nsIDOMWindow *aParent, nsIAuthPrompt **_retval) { return _to GetNewAuthPrompter(aParent, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetWindowCreator(nsIWindowCreator *creator) { return _to SetWindowCreator(creator); } \
  NS_SCRIPTABLE NS_IMETHOD GetChromeForWindow(nsIDOMWindow *aWindow, nsIWebBrowserChrome **_retval) { return _to GetChromeForWindow(aWindow, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetWindowByName(const PRUnichar *aTargetName, nsIDOMWindow *aCurrentWindow, nsIDOMWindow **_retval) { return _to GetWindowByName(aTargetName, aCurrentWindow, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetActiveWindow(nsIDOMWindow * *aActiveWindow) { return _to GetActiveWindow(aActiveWindow); } \
  NS_SCRIPTABLE NS_IMETHOD SetActiveWindow(nsIDOMWindow * aActiveWindow) { return _to SetActiveWindow(aActiveWindow); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWINDOWWATCHER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenWindow(nsIDOMWindow *aParent, const char *aUrl, const char *aName, const char *aFeatures, nsISupports *aArguments, nsIDOMWindow **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OpenWindow(aParent, aUrl, aName, aFeatures, aArguments, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD RegisterNotification(nsIObserver *aObserver) { return !_to ? NS_ERROR_NULL_POINTER : _to->RegisterNotification(aObserver); } \
  NS_SCRIPTABLE NS_IMETHOD UnregisterNotification(nsIObserver *aObserver) { return !_to ? NS_ERROR_NULL_POINTER : _to->UnregisterNotification(aObserver); } \
  NS_SCRIPTABLE NS_IMETHOD GetWindowEnumerator(nsISimpleEnumerator **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWindowEnumerator(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetNewPrompter(nsIDOMWindow *aParent, nsIPrompt **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNewPrompter(aParent, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetNewAuthPrompter(nsIDOMWindow *aParent, nsIAuthPrompt **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNewAuthPrompter(aParent, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetWindowCreator(nsIWindowCreator *creator) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetWindowCreator(creator); } \
  NS_SCRIPTABLE NS_IMETHOD GetChromeForWindow(nsIDOMWindow *aWindow, nsIWebBrowserChrome **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChromeForWindow(aWindow, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetWindowByName(const PRUnichar *aTargetName, nsIDOMWindow *aCurrentWindow, nsIDOMWindow **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWindowByName(aTargetName, aCurrentWindow, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetActiveWindow(nsIDOMWindow * *aActiveWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetActiveWindow(aActiveWindow); } \
  NS_SCRIPTABLE NS_IMETHOD SetActiveWindow(nsIDOMWindow * aActiveWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetActiveWindow(aActiveWindow); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWindowWatcher : public nsIWindowWatcher
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWINDOWWATCHER

  nsWindowWatcher();

private:
  ~nsWindowWatcher();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWindowWatcher, nsIWindowWatcher)

nsWindowWatcher::nsWindowWatcher()
{
  /* member initializers and constructor code */
}

nsWindowWatcher::~nsWindowWatcher()
{
  /* destructor code */
}

/* nsIDOMWindow openWindow (in nsIDOMWindow aParent, in string aUrl, in string aName, in string aFeatures, in nsISupports aArguments); */
NS_IMETHODIMP nsWindowWatcher::OpenWindow(nsIDOMWindow *aParent, const char *aUrl, const char *aName, const char *aFeatures, nsISupports *aArguments, nsIDOMWindow **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void registerNotification (in nsIObserver aObserver); */
NS_IMETHODIMP nsWindowWatcher::RegisterNotification(nsIObserver *aObserver)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void unregisterNotification (in nsIObserver aObserver); */
NS_IMETHODIMP nsWindowWatcher::UnregisterNotification(nsIObserver *aObserver)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsISimpleEnumerator getWindowEnumerator (); */
NS_IMETHODIMP nsWindowWatcher::GetWindowEnumerator(nsISimpleEnumerator **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIPrompt getNewPrompter (in nsIDOMWindow aParent); */
NS_IMETHODIMP nsWindowWatcher::GetNewPrompter(nsIDOMWindow *aParent, nsIPrompt **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIAuthPrompt getNewAuthPrompter (in nsIDOMWindow aParent); */
NS_IMETHODIMP nsWindowWatcher::GetNewAuthPrompter(nsIDOMWindow *aParent, nsIAuthPrompt **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setWindowCreator (in nsIWindowCreator creator); */
NS_IMETHODIMP nsWindowWatcher::SetWindowCreator(nsIWindowCreator *creator)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIWebBrowserChrome getChromeForWindow (in nsIDOMWindow aWindow); */
NS_IMETHODIMP nsWindowWatcher::GetChromeForWindow(nsIDOMWindow *aWindow, nsIWebBrowserChrome **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIDOMWindow getWindowByName (in wstring aTargetName, in nsIDOMWindow aCurrentWindow); */
NS_IMETHODIMP nsWindowWatcher::GetWindowByName(const PRUnichar *aTargetName, nsIDOMWindow *aCurrentWindow, nsIDOMWindow **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDOMWindow activeWindow; */
NS_IMETHODIMP nsWindowWatcher::GetActiveWindow(nsIDOMWindow * *aActiveWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWindowWatcher::SetActiveWindow(nsIDOMWindow * aActiveWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

// {002286a8-494b-43b3-8ddd-49e3fc50622b}
#define NS_WINDOWWATCHER_IID \
 {0x002286a8, 0x494b, 0x43b3, {0x8d, 0xdd, 0x49, 0xe3, 0xfc, 0x50, 0x62, 0x2b}}
#define NS_WINDOWWATCHER_CONTRACTID "@mozilla.org/embedcomp/window-watcher;1"

#endif /* __gen_nsIWindowWatcher_h__ */
