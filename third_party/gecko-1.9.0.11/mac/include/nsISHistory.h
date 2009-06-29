/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/docshell/shistory/public/nsISHistory.idl
 */

#ifndef __gen_nsISHistory_h__
#define __gen_nsISHistory_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIHistoryEntry; /* forward declaration */

class nsISHistoryListener; /* forward declaration */

class nsISimpleEnumerator; /* forward declaration */

#define NS_SHISTORY_CID \
{0x7294fe9c, 0x14d8, 0x11d5, {0x98, 0x82, 0x00, 0xC0, 0x4f, 0xa0, 0x2f, 0x40}}
#define NS_SHISTORY_CONTRACTID "@mozilla.org/browser/shistory;1"

/* starting interface:    nsISHistory */
#define NS_ISHISTORY_IID_STR "9883609f-cdd8-4d83-9b55-868ff08ad433"

#define NS_ISHISTORY_IID \
  {0x9883609f, 0xcdd8, 0x4d83, \
    { 0x9b, 0x55, 0x86, 0x8f, 0xf0, 0x8a, 0xd4, 0x33 }}

/**
 * An interface to the primary properties of the Session History
 * component. In an embedded browser environment, the nsIWebBrowser
 * object creates an instance of session history for each open window.
 * A handle to the session history object can be obtained from
 * nsIWebNavigation. In a non-embedded situation, the  owner of the
 * session history component must create a instance of it and set
 * it in the nsIWebNavigation object.
 * This interface is accessible from javascript. 
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsISHistory : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISHISTORY_IID)

  /**
   * A readonly property of the interface that returns 
   * the number of toplevel documents currently available
   * in session history.
   */
  /* readonly attribute long count; */
  NS_SCRIPTABLE NS_IMETHOD GetCount(PRInt32 *aCount) = 0;

  /**
   * A readonly property of the interface that returns 
   * the index of the current document in session history.
   */
  /* readonly attribute long index; */
  NS_SCRIPTABLE NS_IMETHOD GetIndex(PRInt32 *aIndex) = 0;

  /**
   * A readonly property of the interface that returns 
   * the index of the last document that started to load and
   * didn't finished yet. When document finishes the loading
   * value -1 is returned.
   */
  /* readonly attribute long requestedIndex; */
  NS_SCRIPTABLE NS_IMETHOD GetRequestedIndex(PRInt32 *aRequestedIndex) = 0;

  /**
   * A read/write property of the interface, used to Get/Set
   * the maximum number of toplevel documents, session history 
   * can hold for each instance. 
   */
  /* attribute long maxLength; */
  NS_SCRIPTABLE NS_IMETHOD GetMaxLength(PRInt32 *aMaxLength) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetMaxLength(PRInt32 aMaxLength) = 0;

  /**
   * Called to obtain handle to the history entry at a
   * given index.
   *
   * @param index             The index value whose entry is requested.
   * @param modifyIndex       A boolean flag that indicates if the current
   *                          index of session history should be modified 
   *                          to the parameter index.
   *
   * @return                  <code>NS_OK</code> history entry for 
   *                          the index is obtained successfully.
   *                          <code>NS_ERROR_FAILURE</code> Error in obtaining
   *                          history entry for the given index.
   */
  /* nsIHistoryEntry getEntryAtIndex (in long index, in boolean modifyIndex); */
  NS_SCRIPTABLE NS_IMETHOD GetEntryAtIndex(PRInt32 index, PRBool modifyIndex, nsIHistoryEntry **_retval) = 0;

  /**
   * Called to purge older documents from history.
   * Documents can be removed from session history for various 
   * reasons. For example to  control memory usage of the browser, to 
   * prevent users from loading documents from history, to erase evidence of
   * prior page loads etc...
   *
   * @param numEntries        The number of toplevel documents to be
   *                          purged from history. During purge operation,
   *                          the latest documents are maintained and older 
   *                          'numEntries' documents are removed from history.
   * @throws                  <code>NS_SUCCESS_LOSS_OF_INSIGNIFICANT_DATA</code> Purge was vetod.
   * @throws                  <code>NS_ERROR_FAILURE</code> numEntries is
   *                          invalid or out of bounds with the size of history.
   *                          
   */
  /* void PurgeHistory (in long numEntries); */
  NS_SCRIPTABLE NS_IMETHOD PurgeHistory(PRInt32 numEntries) = 0;

  /**
   * Called to register a listener for the session history component.
   * Listeners are notified when pages are loaded or purged from history.
   * 
   * @param aListener         Listener object to be notified for all
   *                          page loads that initiate in session history.
   *
   * @note                    A listener object must implement 
   *                          nsISHistoryListener and nsSupportsWeakReference
   *
   * @see nsISHistoryListener
   * @see nsSupportsWeakReference
   */
  /* void addSHistoryListener (in nsISHistoryListener aListener); */
  NS_SCRIPTABLE NS_IMETHOD AddSHistoryListener(nsISHistoryListener *aListener) = 0;

  /**
   * Called to remove a listener for the session history component.
   * Listeners are notified when pages are loaded from history.
   * 
   * @param aListener         Listener object to be removed from 
   *                          session history.
   *
   * @note                    A listener object must implement 
   *                          nsISHistoryListener and nsSupportsWeakReference
   * @see nsISHistoryListener
   * @see nsSupportsWeakReference
   */
  /* void removeSHistoryListener (in nsISHistoryListener aListener); */
  NS_SCRIPTABLE NS_IMETHOD RemoveSHistoryListener(nsISHistoryListener *aListener) = 0;

  /**
   * Called to obtain a enumerator for all the  documents stored in 
   * session history. The enumerator object thus returned by this method
   * can be traversed using nsISimpleEnumerator. 
   *
   * @note  To access individual history entries of the enumerator, perform the
   *        following steps:
   *        1) Call nsISHistory->GetSHistoryEnumerator() to obtain handle 
   *           the nsISimpleEnumerator object.
   *        2) Use nsISimpleEnumerator->GetNext() on the object returned
   *           by step #1 to obtain handle to the next object in the list. 
   *           The object returned by this step is of type nsISupports.
   *        3) Perform a QueryInterface on the object returned by step #2 
   *           to nsIHistoryEntry.
   *        4) Use nsIHistoryEntry to access properties of each history entry. 
   *
   * @see nsISimpleEnumerator
   * @see nsIHistoryEntry
   * @see QueryInterface()
   * @see do_QueryInterface()
   */
  /* readonly attribute nsISimpleEnumerator SHistoryEnumerator; */
  NS_SCRIPTABLE NS_IMETHOD GetSHistoryEnumerator(nsISimpleEnumerator * *aSHistoryEnumerator) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISHistory, NS_ISHISTORY_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISHISTORY \
  NS_SCRIPTABLE NS_IMETHOD GetCount(PRInt32 *aCount); \
  NS_SCRIPTABLE NS_IMETHOD GetIndex(PRInt32 *aIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetRequestedIndex(PRInt32 *aRequestedIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetMaxLength(PRInt32 *aMaxLength); \
  NS_SCRIPTABLE NS_IMETHOD SetMaxLength(PRInt32 aMaxLength); \
  NS_SCRIPTABLE NS_IMETHOD GetEntryAtIndex(PRInt32 index, PRBool modifyIndex, nsIHistoryEntry **_retval); \
  NS_SCRIPTABLE NS_IMETHOD PurgeHistory(PRInt32 numEntries); \
  NS_SCRIPTABLE NS_IMETHOD AddSHistoryListener(nsISHistoryListener *aListener); \
  NS_SCRIPTABLE NS_IMETHOD RemoveSHistoryListener(nsISHistoryListener *aListener); \
  NS_SCRIPTABLE NS_IMETHOD GetSHistoryEnumerator(nsISimpleEnumerator * *aSHistoryEnumerator); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISHISTORY(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCount(PRInt32 *aCount) { return _to GetCount(aCount); } \
  NS_SCRIPTABLE NS_IMETHOD GetIndex(PRInt32 *aIndex) { return _to GetIndex(aIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetRequestedIndex(PRInt32 *aRequestedIndex) { return _to GetRequestedIndex(aRequestedIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetMaxLength(PRInt32 *aMaxLength) { return _to GetMaxLength(aMaxLength); } \
  NS_SCRIPTABLE NS_IMETHOD SetMaxLength(PRInt32 aMaxLength) { return _to SetMaxLength(aMaxLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetEntryAtIndex(PRInt32 index, PRBool modifyIndex, nsIHistoryEntry **_retval) { return _to GetEntryAtIndex(index, modifyIndex, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD PurgeHistory(PRInt32 numEntries) { return _to PurgeHistory(numEntries); } \
  NS_SCRIPTABLE NS_IMETHOD AddSHistoryListener(nsISHistoryListener *aListener) { return _to AddSHistoryListener(aListener); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveSHistoryListener(nsISHistoryListener *aListener) { return _to RemoveSHistoryListener(aListener); } \
  NS_SCRIPTABLE NS_IMETHOD GetSHistoryEnumerator(nsISimpleEnumerator * *aSHistoryEnumerator) { return _to GetSHistoryEnumerator(aSHistoryEnumerator); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISHISTORY(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCount(PRInt32 *aCount) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCount(aCount); } \
  NS_SCRIPTABLE NS_IMETHOD GetIndex(PRInt32 *aIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIndex(aIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetRequestedIndex(PRInt32 *aRequestedIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRequestedIndex(aRequestedIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetMaxLength(PRInt32 *aMaxLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMaxLength(aMaxLength); } \
  NS_SCRIPTABLE NS_IMETHOD SetMaxLength(PRInt32 aMaxLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMaxLength(aMaxLength); } \
  NS_SCRIPTABLE NS_IMETHOD GetEntryAtIndex(PRInt32 index, PRBool modifyIndex, nsIHistoryEntry **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEntryAtIndex(index, modifyIndex, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD PurgeHistory(PRInt32 numEntries) { return !_to ? NS_ERROR_NULL_POINTER : _to->PurgeHistory(numEntries); } \
  NS_SCRIPTABLE NS_IMETHOD AddSHistoryListener(nsISHistoryListener *aListener) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddSHistoryListener(aListener); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveSHistoryListener(nsISHistoryListener *aListener) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveSHistoryListener(aListener); } \
  NS_SCRIPTABLE NS_IMETHOD GetSHistoryEnumerator(nsISimpleEnumerator * *aSHistoryEnumerator) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSHistoryEnumerator(aSHistoryEnumerator); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSHistory : public nsISHistory
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISHISTORY

  nsSHistory();

private:
  ~nsSHistory();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSHistory, nsISHistory)

nsSHistory::nsSHistory()
{
  /* member initializers and constructor code */
}

nsSHistory::~nsSHistory()
{
  /* destructor code */
}

/* readonly attribute long count; */
NS_IMETHODIMP nsSHistory::GetCount(PRInt32 *aCount)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long index; */
NS_IMETHODIMP nsSHistory::GetIndex(PRInt32 *aIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long requestedIndex; */
NS_IMETHODIMP nsSHistory::GetRequestedIndex(PRInt32 *aRequestedIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long maxLength; */
NS_IMETHODIMP nsSHistory::GetMaxLength(PRInt32 *aMaxLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsSHistory::SetMaxLength(PRInt32 aMaxLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIHistoryEntry getEntryAtIndex (in long index, in boolean modifyIndex); */
NS_IMETHODIMP nsSHistory::GetEntryAtIndex(PRInt32 index, PRBool modifyIndex, nsIHistoryEntry **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void PurgeHistory (in long numEntries); */
NS_IMETHODIMP nsSHistory::PurgeHistory(PRInt32 numEntries)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void addSHistoryListener (in nsISHistoryListener aListener); */
NS_IMETHODIMP nsSHistory::AddSHistoryListener(nsISHistoryListener *aListener)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeSHistoryListener (in nsISHistoryListener aListener); */
NS_IMETHODIMP nsSHistory::RemoveSHistoryListener(nsISHistoryListener *aListener)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsISimpleEnumerator SHistoryEnumerator; */
NS_IMETHODIMP nsSHistory::GetSHistoryEnumerator(nsISimpleEnumerator * *aSHistoryEnumerator)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsISHistory_h__ */
