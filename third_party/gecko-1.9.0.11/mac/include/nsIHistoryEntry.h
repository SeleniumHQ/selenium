/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/docshell/shistory/public/nsIHistoryEntry.idl
 */

#ifndef __gen_nsIHistoryEntry_h__
#define __gen_nsIHistoryEntry_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIURI; /* forward declaration */


/* starting interface:    nsIHistoryEntry */
#define NS_IHISTORYENTRY_IID_STR "a41661d4-1417-11d5-9882-00c04fa02f40"

#define NS_IHISTORYENTRY_IID \
  {0xa41661d4, 0x1417, 0x11d5, \
    { 0x98, 0x82, 0x00, 0xc0, 0x4f, 0xa0, 0x2f, 0x40 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIHistoryEntry : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IHISTORYENTRY_IID)

  /** 
     * A readonly property that returns the URI
     * of the current entry. The object returned is
     * of type nsIURI
     */
  /* readonly attribute nsIURI URI; */
  NS_SCRIPTABLE NS_IMETHOD GetURI(nsIURI * *aURI) = 0;

  /** 
     * A readonly property that returns the title
     * of the current entry.  The object returned
     * is a encoded string
     */
  /* readonly attribute wstring title; */
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle) = 0;

  /** 
     * A readonly property that returns a boolean
     * flag which indicates if the entry was created as a 
     * result of a subframe navigation. This flag will be
     * 'false' when a frameset page is visited for
     * the first time. This flag will be 'true' for all
     * history entries created as a result of a subframe
     * navigation.
     */
  /* readonly attribute boolean isSubFrame; */
  NS_SCRIPTABLE NS_IMETHOD GetIsSubFrame(PRBool *aIsSubFrame) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIHistoryEntry, NS_IHISTORYENTRY_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIHISTORYENTRY \
  NS_SCRIPTABLE NS_IMETHOD GetURI(nsIURI * *aURI); \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle); \
  NS_SCRIPTABLE NS_IMETHOD GetIsSubFrame(PRBool *aIsSubFrame); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIHISTORYENTRY(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetURI(nsIURI * *aURI) { return _to GetURI(aURI); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle) { return _to GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsSubFrame(PRBool *aIsSubFrame) { return _to GetIsSubFrame(aIsSubFrame); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIHISTORYENTRY(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetURI(nsIURI * *aURI) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetURI(aURI); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsSubFrame(PRBool *aIsSubFrame) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsSubFrame(aIsSubFrame); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsHistoryEntry : public nsIHistoryEntry
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIHISTORYENTRY

  nsHistoryEntry();

private:
  ~nsHistoryEntry();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsHistoryEntry, nsIHistoryEntry)

nsHistoryEntry::nsHistoryEntry()
{
  /* member initializers and constructor code */
}

nsHistoryEntry::~nsHistoryEntry()
{
  /* destructor code */
}

/* readonly attribute nsIURI URI; */
NS_IMETHODIMP nsHistoryEntry::GetURI(nsIURI * *aURI)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute wstring title; */
NS_IMETHODIMP nsHistoryEntry::GetTitle(PRUnichar * *aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean isSubFrame; */
NS_IMETHODIMP nsHistoryEntry::GetIsSubFrame(PRBool *aIsSubFrame)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

// {A41661D5-1417-11D5-9882-00C04FA02F40}
#define NS_HISTORYENTRY_CID \
{0xa41661d5, 0x1417, 0x11d5, {0x98, 0x82, 0x0, 0xc0, 0x4f, 0xa0, 0x2f, 0x40}}
#define NS_HISTORYENTRY_CONTRACTID \
    "@mozilla.org/browser/history-entry;1"

#endif /* __gen_nsIHistoryEntry_h__ */
