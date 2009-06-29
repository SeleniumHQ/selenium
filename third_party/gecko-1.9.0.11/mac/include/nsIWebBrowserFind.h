/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/embedding/components/find/public/nsIWebBrowserFind.idl
 */

#ifndef __gen_nsIWebBrowserFind_h__
#define __gen_nsIWebBrowserFind_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIWebBrowserFind */
#define NS_IWEBBROWSERFIND_IID_STR "2f977d44-5485-11d4-87e2-0010a4e75ef2"

#define NS_IWEBBROWSERFIND_IID \
  {0x2f977d44, 0x5485, 0x11d4, \
    { 0x87, 0xe2, 0x00, 0x10, 0xa4, 0xe7, 0x5e, 0xf2 }}

/**
 * nsIWebBrowserFind
 *
 * Searches for text in a web browser.
 *
 * Get one by doing a GetInterface on an nsIWebBrowser.
 *
 * By default, the implementation will search the focussed frame, or
 * if there is no focussed frame, the web browser content area. It
 * does not by default search subframes or iframes. To change this
 * behaviour, and to explicitly set the frame to search, 
 * QueryInterface to nsIWebBrowserFindInFrames.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebBrowserFind : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBBROWSERFIND_IID)

  /**
     * findNext
     *
     * Finds, highlights, and scrolls into view the next occurrence of the
     * search string, using the current search settings. Fails if the
     * search string is empty.
     *
     * @return  Whether an occurrence was found
     */
  /* boolean findNext (); */
  NS_SCRIPTABLE NS_IMETHOD FindNext(PRBool *_retval) = 0;

  /**
     * searchString
     *
     * The string to search for. This must be non-empty to search.
     */
  /* attribute wstring searchString; */
  NS_SCRIPTABLE NS_IMETHOD GetSearchString(PRUnichar * *aSearchString) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSearchString(const PRUnichar * aSearchString) = 0;

  /**
     * findBackwards
     *
     * Whether to find backwards (towards the beginning of the document).
     * Default is false (search forward).
     */
  /* attribute boolean findBackwards; */
  NS_SCRIPTABLE NS_IMETHOD GetFindBackwards(PRBool *aFindBackwards) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFindBackwards(PRBool aFindBackwards) = 0;

  /**
     * wrapFind
     *
     * Whether the search wraps around to the start (or end) of the document
     * if no match was found between the current position and the end (or
     * beginning). Works correctly when searching backwards. Default is
     * false.
     */
  /* attribute boolean wrapFind; */
  NS_SCRIPTABLE NS_IMETHOD GetWrapFind(PRBool *aWrapFind) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetWrapFind(PRBool aWrapFind) = 0;

  /**
     * entireWord
     *
     * Whether to match entire words only. Default is false.
     */
  /* attribute boolean entireWord; */
  NS_SCRIPTABLE NS_IMETHOD GetEntireWord(PRBool *aEntireWord) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetEntireWord(PRBool aEntireWord) = 0;

  /**
     * matchCase
     *
     * Whether to match case (case sensitive) when searching. Default is false.
     */
  /* attribute boolean matchCase; */
  NS_SCRIPTABLE NS_IMETHOD GetMatchCase(PRBool *aMatchCase) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetMatchCase(PRBool aMatchCase) = 0;

  /**
     * searchFrames
     *
     * Whether to search through all frames in the content area. Default is true.
     * 
     * Note that you can control whether the search propagates into child or
     * parent frames explicitly using nsIWebBrowserFindInFrames, but if one,
     * but not both, of searchSubframes and searchParentFrames are set, this
     * returns false.
     */
  /* attribute boolean searchFrames; */
  NS_SCRIPTABLE NS_IMETHOD GetSearchFrames(PRBool *aSearchFrames) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSearchFrames(PRBool aSearchFrames) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebBrowserFind, NS_IWEBBROWSERFIND_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBBROWSERFIND \
  NS_SCRIPTABLE NS_IMETHOD FindNext(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetSearchString(PRUnichar * *aSearchString); \
  NS_SCRIPTABLE NS_IMETHOD SetSearchString(const PRUnichar * aSearchString); \
  NS_SCRIPTABLE NS_IMETHOD GetFindBackwards(PRBool *aFindBackwards); \
  NS_SCRIPTABLE NS_IMETHOD SetFindBackwards(PRBool aFindBackwards); \
  NS_SCRIPTABLE NS_IMETHOD GetWrapFind(PRBool *aWrapFind); \
  NS_SCRIPTABLE NS_IMETHOD SetWrapFind(PRBool aWrapFind); \
  NS_SCRIPTABLE NS_IMETHOD GetEntireWord(PRBool *aEntireWord); \
  NS_SCRIPTABLE NS_IMETHOD SetEntireWord(PRBool aEntireWord); \
  NS_SCRIPTABLE NS_IMETHOD GetMatchCase(PRBool *aMatchCase); \
  NS_SCRIPTABLE NS_IMETHOD SetMatchCase(PRBool aMatchCase); \
  NS_SCRIPTABLE NS_IMETHOD GetSearchFrames(PRBool *aSearchFrames); \
  NS_SCRIPTABLE NS_IMETHOD SetSearchFrames(PRBool aSearchFrames); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBBROWSERFIND(_to) \
  NS_SCRIPTABLE NS_IMETHOD FindNext(PRBool *_retval) { return _to FindNext(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetSearchString(PRUnichar * *aSearchString) { return _to GetSearchString(aSearchString); } \
  NS_SCRIPTABLE NS_IMETHOD SetSearchString(const PRUnichar * aSearchString) { return _to SetSearchString(aSearchString); } \
  NS_SCRIPTABLE NS_IMETHOD GetFindBackwards(PRBool *aFindBackwards) { return _to GetFindBackwards(aFindBackwards); } \
  NS_SCRIPTABLE NS_IMETHOD SetFindBackwards(PRBool aFindBackwards) { return _to SetFindBackwards(aFindBackwards); } \
  NS_SCRIPTABLE NS_IMETHOD GetWrapFind(PRBool *aWrapFind) { return _to GetWrapFind(aWrapFind); } \
  NS_SCRIPTABLE NS_IMETHOD SetWrapFind(PRBool aWrapFind) { return _to SetWrapFind(aWrapFind); } \
  NS_SCRIPTABLE NS_IMETHOD GetEntireWord(PRBool *aEntireWord) { return _to GetEntireWord(aEntireWord); } \
  NS_SCRIPTABLE NS_IMETHOD SetEntireWord(PRBool aEntireWord) { return _to SetEntireWord(aEntireWord); } \
  NS_SCRIPTABLE NS_IMETHOD GetMatchCase(PRBool *aMatchCase) { return _to GetMatchCase(aMatchCase); } \
  NS_SCRIPTABLE NS_IMETHOD SetMatchCase(PRBool aMatchCase) { return _to SetMatchCase(aMatchCase); } \
  NS_SCRIPTABLE NS_IMETHOD GetSearchFrames(PRBool *aSearchFrames) { return _to GetSearchFrames(aSearchFrames); } \
  NS_SCRIPTABLE NS_IMETHOD SetSearchFrames(PRBool aSearchFrames) { return _to SetSearchFrames(aSearchFrames); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBBROWSERFIND(_to) \
  NS_SCRIPTABLE NS_IMETHOD FindNext(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->FindNext(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetSearchString(PRUnichar * *aSearchString) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSearchString(aSearchString); } \
  NS_SCRIPTABLE NS_IMETHOD SetSearchString(const PRUnichar * aSearchString) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSearchString(aSearchString); } \
  NS_SCRIPTABLE NS_IMETHOD GetFindBackwards(PRBool *aFindBackwards) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFindBackwards(aFindBackwards); } \
  NS_SCRIPTABLE NS_IMETHOD SetFindBackwards(PRBool aFindBackwards) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFindBackwards(aFindBackwards); } \
  NS_SCRIPTABLE NS_IMETHOD GetWrapFind(PRBool *aWrapFind) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetWrapFind(aWrapFind); } \
  NS_SCRIPTABLE NS_IMETHOD SetWrapFind(PRBool aWrapFind) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetWrapFind(aWrapFind); } \
  NS_SCRIPTABLE NS_IMETHOD GetEntireWord(PRBool *aEntireWord) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEntireWord(aEntireWord); } \
  NS_SCRIPTABLE NS_IMETHOD SetEntireWord(PRBool aEntireWord) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetEntireWord(aEntireWord); } \
  NS_SCRIPTABLE NS_IMETHOD GetMatchCase(PRBool *aMatchCase) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMatchCase(aMatchCase); } \
  NS_SCRIPTABLE NS_IMETHOD SetMatchCase(PRBool aMatchCase) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMatchCase(aMatchCase); } \
  NS_SCRIPTABLE NS_IMETHOD GetSearchFrames(PRBool *aSearchFrames) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSearchFrames(aSearchFrames); } \
  NS_SCRIPTABLE NS_IMETHOD SetSearchFrames(PRBool aSearchFrames) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSearchFrames(aSearchFrames); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebBrowserFind : public nsIWebBrowserFind
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBBROWSERFIND

  nsWebBrowserFind();

private:
  ~nsWebBrowserFind();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebBrowserFind, nsIWebBrowserFind)

nsWebBrowserFind::nsWebBrowserFind()
{
  /* member initializers and constructor code */
}

nsWebBrowserFind::~nsWebBrowserFind()
{
  /* destructor code */
}

/* boolean findNext (); */
NS_IMETHODIMP nsWebBrowserFind::FindNext(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute wstring searchString; */
NS_IMETHODIMP nsWebBrowserFind::GetSearchString(PRUnichar * *aSearchString)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFind::SetSearchString(const PRUnichar * aSearchString)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean findBackwards; */
NS_IMETHODIMP nsWebBrowserFind::GetFindBackwards(PRBool *aFindBackwards)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFind::SetFindBackwards(PRBool aFindBackwards)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean wrapFind; */
NS_IMETHODIMP nsWebBrowserFind::GetWrapFind(PRBool *aWrapFind)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFind::SetWrapFind(PRBool aWrapFind)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean entireWord; */
NS_IMETHODIMP nsWebBrowserFind::GetEntireWord(PRBool *aEntireWord)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFind::SetEntireWord(PRBool aEntireWord)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean matchCase; */
NS_IMETHODIMP nsWebBrowserFind::GetMatchCase(PRBool *aMatchCase)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFind::SetMatchCase(PRBool aMatchCase)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean searchFrames; */
NS_IMETHODIMP nsWebBrowserFind::GetSearchFrames(PRBool *aSearchFrames)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFind::SetSearchFrames(PRBool aSearchFrames)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    nsIWebBrowserFindInFrames */
#define NS_IWEBBROWSERFINDINFRAMES_IID_STR "e0f5d182-34bc-11d5-be5b-b760676c6ebc"

#define NS_IWEBBROWSERFINDINFRAMES_IID \
  {0xe0f5d182, 0x34bc, 0x11d5, \
    { 0xbe, 0x5b, 0xb7, 0x60, 0x67, 0x6c, 0x6e, 0xbc }}

/**
 * nsIWebBrowserFindInFrames
 *
 * Controls how find behaves when multiple frames or iframes are present.
 *
 * Get by doing a QueryInterface from nsIWebBrowserFind.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebBrowserFindInFrames : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBBROWSERFINDINFRAMES_IID)

  /**
     * currentSearchFrame
     *
     * Frame at which to start the search. Once the search is done, this will
     * be set to be the last frame searched, whether or not a result was found.
     * Has to be equal to or contained within the rootSearchFrame.
     */
  /* attribute nsIDOMWindow currentSearchFrame; */
  NS_SCRIPTABLE NS_IMETHOD GetCurrentSearchFrame(nsIDOMWindow * *aCurrentSearchFrame) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCurrentSearchFrame(nsIDOMWindow * aCurrentSearchFrame) = 0;

  /**
     * rootSearchFrame
     *
     * Frame within which to confine the search (normally the content area frame).
     * Set this to only search a subtree of the frame hierarchy.
     */
  /* attribute nsIDOMWindow rootSearchFrame; */
  NS_SCRIPTABLE NS_IMETHOD GetRootSearchFrame(nsIDOMWindow * *aRootSearchFrame) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetRootSearchFrame(nsIDOMWindow * aRootSearchFrame) = 0;

  /**
     * searchSubframes
     *
     * Whether to recurse down into subframes while searching. Default is true.
     *
     * Setting nsIWebBrowserfind.searchFrames to true sets this to true.
     */
  /* attribute boolean searchSubframes; */
  NS_SCRIPTABLE NS_IMETHOD GetSearchSubframes(PRBool *aSearchSubframes) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSearchSubframes(PRBool aSearchSubframes) = 0;

  /**
     * searchParentFrames
     *
     * Whether to allow the search to propagate out of the currentSearchFrame into its
     * parent frame(s). Search is always confined within the rootSearchFrame. Default
     * is true.
     *
     * Setting nsIWebBrowserfind.searchFrames to true sets this to true.
     */
  /* attribute boolean searchParentFrames; */
  NS_SCRIPTABLE NS_IMETHOD GetSearchParentFrames(PRBool *aSearchParentFrames) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetSearchParentFrames(PRBool aSearchParentFrames) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebBrowserFindInFrames, NS_IWEBBROWSERFINDINFRAMES_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBBROWSERFINDINFRAMES \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentSearchFrame(nsIDOMWindow * *aCurrentSearchFrame); \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentSearchFrame(nsIDOMWindow * aCurrentSearchFrame); \
  NS_SCRIPTABLE NS_IMETHOD GetRootSearchFrame(nsIDOMWindow * *aRootSearchFrame); \
  NS_SCRIPTABLE NS_IMETHOD SetRootSearchFrame(nsIDOMWindow * aRootSearchFrame); \
  NS_SCRIPTABLE NS_IMETHOD GetSearchSubframes(PRBool *aSearchSubframes); \
  NS_SCRIPTABLE NS_IMETHOD SetSearchSubframes(PRBool aSearchSubframes); \
  NS_SCRIPTABLE NS_IMETHOD GetSearchParentFrames(PRBool *aSearchParentFrames); \
  NS_SCRIPTABLE NS_IMETHOD SetSearchParentFrames(PRBool aSearchParentFrames); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBBROWSERFINDINFRAMES(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentSearchFrame(nsIDOMWindow * *aCurrentSearchFrame) { return _to GetCurrentSearchFrame(aCurrentSearchFrame); } \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentSearchFrame(nsIDOMWindow * aCurrentSearchFrame) { return _to SetCurrentSearchFrame(aCurrentSearchFrame); } \
  NS_SCRIPTABLE NS_IMETHOD GetRootSearchFrame(nsIDOMWindow * *aRootSearchFrame) { return _to GetRootSearchFrame(aRootSearchFrame); } \
  NS_SCRIPTABLE NS_IMETHOD SetRootSearchFrame(nsIDOMWindow * aRootSearchFrame) { return _to SetRootSearchFrame(aRootSearchFrame); } \
  NS_SCRIPTABLE NS_IMETHOD GetSearchSubframes(PRBool *aSearchSubframes) { return _to GetSearchSubframes(aSearchSubframes); } \
  NS_SCRIPTABLE NS_IMETHOD SetSearchSubframes(PRBool aSearchSubframes) { return _to SetSearchSubframes(aSearchSubframes); } \
  NS_SCRIPTABLE NS_IMETHOD GetSearchParentFrames(PRBool *aSearchParentFrames) { return _to GetSearchParentFrames(aSearchParentFrames); } \
  NS_SCRIPTABLE NS_IMETHOD SetSearchParentFrames(PRBool aSearchParentFrames) { return _to SetSearchParentFrames(aSearchParentFrames); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBBROWSERFINDINFRAMES(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentSearchFrame(nsIDOMWindow * *aCurrentSearchFrame) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCurrentSearchFrame(aCurrentSearchFrame); } \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentSearchFrame(nsIDOMWindow * aCurrentSearchFrame) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCurrentSearchFrame(aCurrentSearchFrame); } \
  NS_SCRIPTABLE NS_IMETHOD GetRootSearchFrame(nsIDOMWindow * *aRootSearchFrame) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRootSearchFrame(aRootSearchFrame); } \
  NS_SCRIPTABLE NS_IMETHOD SetRootSearchFrame(nsIDOMWindow * aRootSearchFrame) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRootSearchFrame(aRootSearchFrame); } \
  NS_SCRIPTABLE NS_IMETHOD GetSearchSubframes(PRBool *aSearchSubframes) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSearchSubframes(aSearchSubframes); } \
  NS_SCRIPTABLE NS_IMETHOD SetSearchSubframes(PRBool aSearchSubframes) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSearchSubframes(aSearchSubframes); } \
  NS_SCRIPTABLE NS_IMETHOD GetSearchParentFrames(PRBool *aSearchParentFrames) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSearchParentFrames(aSearchParentFrames); } \
  NS_SCRIPTABLE NS_IMETHOD SetSearchParentFrames(PRBool aSearchParentFrames) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSearchParentFrames(aSearchParentFrames); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebBrowserFindInFrames : public nsIWebBrowserFindInFrames
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBBROWSERFINDINFRAMES

  nsWebBrowserFindInFrames();

private:
  ~nsWebBrowserFindInFrames();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebBrowserFindInFrames, nsIWebBrowserFindInFrames)

nsWebBrowserFindInFrames::nsWebBrowserFindInFrames()
{
  /* member initializers and constructor code */
}

nsWebBrowserFindInFrames::~nsWebBrowserFindInFrames()
{
  /* destructor code */
}

/* attribute nsIDOMWindow currentSearchFrame; */
NS_IMETHODIMP nsWebBrowserFindInFrames::GetCurrentSearchFrame(nsIDOMWindow * *aCurrentSearchFrame)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFindInFrames::SetCurrentSearchFrame(nsIDOMWindow * aCurrentSearchFrame)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDOMWindow rootSearchFrame; */
NS_IMETHODIMP nsWebBrowserFindInFrames::GetRootSearchFrame(nsIDOMWindow * *aRootSearchFrame)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFindInFrames::SetRootSearchFrame(nsIDOMWindow * aRootSearchFrame)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean searchSubframes; */
NS_IMETHODIMP nsWebBrowserFindInFrames::GetSearchSubframes(PRBool *aSearchSubframes)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFindInFrames::SetSearchSubframes(PRBool aSearchSubframes)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean searchParentFrames; */
NS_IMETHODIMP nsWebBrowserFindInFrames::GetSearchParentFrames(PRBool *aSearchParentFrames)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsWebBrowserFindInFrames::SetSearchParentFrames(PRBool aSearchParentFrames)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIWebBrowserFind_h__ */
