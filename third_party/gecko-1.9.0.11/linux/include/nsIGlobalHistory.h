/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/docshell/base/nsIGlobalHistory.idl
 */

#ifndef __gen_nsIGlobalHistory_h__
#define __gen_nsIGlobalHistory_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIGlobalHistory */
#define NS_IGLOBALHISTORY_IID_STR "9491c383-e3c4-11d2-bdbe-0050040a9b44"

#define NS_IGLOBALHISTORY_IID \
  {0x9491c383, 0xe3c4, 0x11d2, \
    { 0xbd, 0xbe, 0x00, 0x50, 0x04, 0x0a, 0x9b, 0x44 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIGlobalHistory : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IGLOBALHISTORY_IID)

  /**
     * addPage
     * Add a page to the history
     *
     * @param aURL the url to the page
     */
  /* void addPage (in string aURL); */
  NS_SCRIPTABLE NS_IMETHOD AddPage(const char *aURL) = 0;

  /**
     * isVisited
     * Checks to see if the given page is in history
     *
     * @return true if a page has been passed into addPage().
     * @param aURL the url to the page
     */
  /* boolean isVisited (in string aURL); */
  NS_SCRIPTABLE NS_IMETHOD IsVisited(const char *aURL, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIGlobalHistory, NS_IGLOBALHISTORY_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIGLOBALHISTORY \
  NS_SCRIPTABLE NS_IMETHOD AddPage(const char *aURL); \
  NS_SCRIPTABLE NS_IMETHOD IsVisited(const char *aURL, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIGLOBALHISTORY(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddPage(const char *aURL) { return _to AddPage(aURL); } \
  NS_SCRIPTABLE NS_IMETHOD IsVisited(const char *aURL, PRBool *_retval) { return _to IsVisited(aURL, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIGLOBALHISTORY(_to) \
  NS_SCRIPTABLE NS_IMETHOD AddPage(const char *aURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddPage(aURL); } \
  NS_SCRIPTABLE NS_IMETHOD IsVisited(const char *aURL, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsVisited(aURL, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsGlobalHistory : public nsIGlobalHistory
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIGLOBALHISTORY

  nsGlobalHistory();

private:
  ~nsGlobalHistory();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsGlobalHistory, nsIGlobalHistory)

nsGlobalHistory::nsGlobalHistory()
{
  /* member initializers and constructor code */
}

nsGlobalHistory::~nsGlobalHistory()
{
  /* destructor code */
}

/* void addPage (in string aURL); */
NS_IMETHODIMP nsGlobalHistory::AddPage(const char *aURL)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isVisited (in string aURL); */
NS_IMETHODIMP nsGlobalHistory::IsVisited(const char *aURL, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

#define NS_GLOBALHISTORY_CONTRACTID \
    "@mozilla.org/browser/global-history;1"

#endif /* __gen_nsIGlobalHistory_h__ */
