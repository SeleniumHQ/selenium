/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/docshell/shistory/public/nsISHistoryListener.idl
 */

#ifndef __gen_nsISHistoryListener_h__
#define __gen_nsISHistoryListener_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIURI; /* forward declaration */


/* starting interface:    nsISHistoryListener */
#define NS_ISHISTORYLISTENER_IID_STR "3b07f591-e8e1-11d4-9882-00c04fa02f40"

#define NS_ISHISTORYLISTENER_IID \
  {0x3b07f591, 0xe8e1, 0x11d4, \
    { 0x98, 0x82, 0x00, 0xc0, 0x4f, 0xa0, 0x2f, 0x40 }}

/**
 * nsISHistoryListener defines the interface one can implement to receive
 * notifications about activities in session history and to be able to
 * cancel them.
 *
 * A session history listener will be notified when pages are added, removed
 * and loaded from session history. It can prevent any action (except adding
 * a new session history entry) from happening by returning false from the
 * corresponding callback method.
 *
 * A session history listener can be registered on a particular nsISHistory
 * instance via the nsISHistory::addSHistoryListener() method.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISHistoryListener : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISHISTORYLISTENER_IID)

  /**
   * Called when a new document is added to session history. New documents are
   * added to session history by docshell when new pages are loaded in a frame
   * or content area, for example via nsIWebNavigation::loadURI()
   *
   * @param aNewURI     The URI of the document to be added to session history.
   */
  /* void OnHistoryNewEntry (in nsIURI aNewURI); */
  NS_SCRIPTABLE NS_IMETHOD OnHistoryNewEntry(nsIURI *aNewURI) = 0;

  /**
   * Called when navigating to a previous session history entry, for example
   * due to a nsIWebNavigation::goBack() call.
   *
   * @param aBackURI    The URI of the session history entry being navigated to.
   * @return            Whether the operation can proceed.
   */
  /* boolean OnHistoryGoBack (in nsIURI aBackURI); */
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGoBack(nsIURI *aBackURI, PRBool *_retval) = 0;

  /**
   * Called when navigating to a next session history entry, for example
   * due to a nsIWebNavigation::goForward() call.
   *
   * @param aForwardURI   The URI of the session history entry being navigated to.
   * @return              Whether the operation can proceed.
   */
  /* boolean OnHistoryGoForward (in nsIURI aForwardURI); */
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGoForward(nsIURI *aForwardURI, PRBool *_retval) = 0;

  /** 
   * Called when the current document is reloaded, for example due to a
   * nsIWebNavigation::reload() call.
   *
   * @param aReloadURI    The URI of the document to be reloaded.
   * @param aReloadFlags  Flags that indicate how the document is to be 
   *                      refreshed. See constants on the nsIWebNavigation
   *                      interface.
   * @return              Whether the operation can proceed.
   *
   * @see  nsIWebNavigation
   */
  /* boolean OnHistoryReload (in nsIURI aReloadURI, in unsigned long aReloadFlags); */
  NS_SCRIPTABLE NS_IMETHOD OnHistoryReload(nsIURI *aReloadURI, PRUint32 aReloadFlags, PRBool *_retval) = 0;

  /**
   * Called when navigating to a session history entry by index, for example,
   * when nsIWebNavigation::gotoIndex() is called.
   *
   * @param aIndex        The index in session history of the entry to be loaded.
   * @param aGotoURI      The URI of the session history entry to be loaded.
   * @return              Whether the operation can proceed.
   */
  /* boolean OnHistoryGotoIndex (in long aIndex, in nsIURI aGotoURI); */
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGotoIndex(PRInt32 aIndex, nsIURI *aGotoURI, PRBool *_retval) = 0;

  /**
   * Called when entries are removed from session history. Entries can be
   * removed from session history for various reasons, for example to control
   * the memory usage of the browser, to prevent users from loading documents
   * from history, to erase evidence of prior page loads, etc.
   *
   * To purge documents from session history call nsISHistory::PurgeHistory()
   *
   * @param aNumEntries   The number of entries to be removed from session history.
   * @return              Whether the operation can proceed.
   */
  /* boolean OnHistoryPurge (in long aNumEntries); */
  NS_SCRIPTABLE NS_IMETHOD OnHistoryPurge(PRInt32 aNumEntries, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISHistoryListener, NS_ISHISTORYLISTENER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISHISTORYLISTENER \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryNewEntry(nsIURI *aNewURI); \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGoBack(nsIURI *aBackURI, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGoForward(nsIURI *aForwardURI, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryReload(nsIURI *aReloadURI, PRUint32 aReloadFlags, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGotoIndex(PRInt32 aIndex, nsIURI *aGotoURI, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryPurge(PRInt32 aNumEntries, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISHISTORYLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryNewEntry(nsIURI *aNewURI) { return _to OnHistoryNewEntry(aNewURI); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGoBack(nsIURI *aBackURI, PRBool *_retval) { return _to OnHistoryGoBack(aBackURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGoForward(nsIURI *aForwardURI, PRBool *_retval) { return _to OnHistoryGoForward(aForwardURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryReload(nsIURI *aReloadURI, PRUint32 aReloadFlags, PRBool *_retval) { return _to OnHistoryReload(aReloadURI, aReloadFlags, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGotoIndex(PRInt32 aIndex, nsIURI *aGotoURI, PRBool *_retval) { return _to OnHistoryGotoIndex(aIndex, aGotoURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryPurge(PRInt32 aNumEntries, PRBool *_retval) { return _to OnHistoryPurge(aNumEntries, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISHISTORYLISTENER(_to) \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryNewEntry(nsIURI *aNewURI) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnHistoryNewEntry(aNewURI); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGoBack(nsIURI *aBackURI, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnHistoryGoBack(aBackURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGoForward(nsIURI *aForwardURI, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnHistoryGoForward(aForwardURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryReload(nsIURI *aReloadURI, PRUint32 aReloadFlags, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnHistoryReload(aReloadURI, aReloadFlags, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryGotoIndex(PRInt32 aIndex, nsIURI *aGotoURI, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnHistoryGotoIndex(aIndex, aGotoURI, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OnHistoryPurge(PRInt32 aNumEntries, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OnHistoryPurge(aNumEntries, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSHistoryListener : public nsISHistoryListener
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISHISTORYLISTENER

  nsSHistoryListener();

private:
  ~nsSHistoryListener();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSHistoryListener, nsISHistoryListener)

nsSHistoryListener::nsSHistoryListener()
{
  /* member initializers and constructor code */
}

nsSHistoryListener::~nsSHistoryListener()
{
  /* destructor code */
}

/* void OnHistoryNewEntry (in nsIURI aNewURI); */
NS_IMETHODIMP nsSHistoryListener::OnHistoryNewEntry(nsIURI *aNewURI)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean OnHistoryGoBack (in nsIURI aBackURI); */
NS_IMETHODIMP nsSHistoryListener::OnHistoryGoBack(nsIURI *aBackURI, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean OnHistoryGoForward (in nsIURI aForwardURI); */
NS_IMETHODIMP nsSHistoryListener::OnHistoryGoForward(nsIURI *aForwardURI, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean OnHistoryReload (in nsIURI aReloadURI, in unsigned long aReloadFlags); */
NS_IMETHODIMP nsSHistoryListener::OnHistoryReload(nsIURI *aReloadURI, PRUint32 aReloadFlags, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean OnHistoryGotoIndex (in long aIndex, in nsIURI aGotoURI); */
NS_IMETHODIMP nsSHistoryListener::OnHistoryGotoIndex(PRInt32 aIndex, nsIURI *aGotoURI, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean OnHistoryPurge (in long aNumEntries); */
NS_IMETHODIMP nsSHistoryListener::OnHistoryPurge(PRInt32 aNumEntries, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsISHistoryListener_h__ */
