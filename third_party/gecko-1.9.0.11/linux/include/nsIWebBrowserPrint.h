/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/embedding/browser/webBrowser/nsIWebBrowserPrint.idl
 */

#ifndef __gen_nsIWebBrowserPrint_h__
#define __gen_nsIWebBrowserPrint_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIDOMWindow; /* forward declaration */

class nsIPrintSettings; /* forward declaration */

class nsIWebProgressListener; /* forward declaration */


/* starting interface:    nsIWebBrowserPrint */
#define NS_IWEBBROWSERPRINT_IID_STR "9a7ca4b0-fbba-11d4-a869-00105a183419"

#define NS_IWEBBROWSERPRINT_IID \
  {0x9a7ca4b0, 0xfbba, 0x11d4, \
    { 0xa8, 0x69, 0x00, 0x10, 0x5a, 0x18, 0x34, 0x19 }}

/**
 * nsIWebBrowserPrint corresponds to the main interface
 * for printing an embedded Gecko web browser window/document
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIWebBrowserPrint : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IWEBBROWSERPRINT_IID)

  /**
   * PrintPreview Navigation Constants
   */
  enum { PRINTPREVIEW_GOTO_PAGENUM = 0 };

  enum { PRINTPREVIEW_PREV_PAGE = 1 };

  enum { PRINTPREVIEW_NEXT_PAGE = 2 };

  enum { PRINTPREVIEW_HOME = 3 };

  enum { PRINTPREVIEW_END = 4 };

  /**
   * Returns a "global" PrintSettings object 
   * Creates a new the first time, if one doesn't exist.
   *
   * Then returns the same object each time after that.
   *
   * Initializes the globalPrintSettings from the default printer
   */
  /* readonly attribute nsIPrintSettings globalPrintSettings; */
  NS_SCRIPTABLE NS_IMETHOD GetGlobalPrintSettings(nsIPrintSettings * *aGlobalPrintSettings) = 0;

  /**
   * Returns a pointer to the PrintSettings object that
   * that was passed into either "print" or "print preview"
   *
   * This enables any consumers of the interface to have access
   * to the "current" PrintSetting at later points in the execution
   */
  /* readonly attribute nsIPrintSettings currentPrintSettings; */
  NS_SCRIPTABLE NS_IMETHOD GetCurrentPrintSettings(nsIPrintSettings * *aCurrentPrintSettings) = 0;

  /**
   * Returns a pointer to the current child DOMWindow
   * that is being print previewed. (FrameSet Frames)
   *
   * Returns null if parent document is not a frameset or the entire FrameSet 
   * document is being print previewed
   *
   * This enables any consumers of the interface to have access
   * to the "current" child DOMWindow at later points in the execution
   */
  /* readonly attribute nsIDOMWindow currentChildDOMWindow; */
  NS_SCRIPTABLE NS_IMETHOD GetCurrentChildDOMWindow(nsIDOMWindow * *aCurrentChildDOMWindow) = 0;

  /**
   * Returns whether it is in Print mode
   */
  /* readonly attribute boolean doingPrint; */
  NS_SCRIPTABLE NS_IMETHOD GetDoingPrint(PRBool *aDoingPrint) = 0;

  /**
   * Returns whether it is in Print Preview mode
   */
  /* readonly attribute boolean doingPrintPreview; */
  NS_SCRIPTABLE NS_IMETHOD GetDoingPrintPreview(PRBool *aDoingPrintPreview) = 0;

  /**
   * This returns whether the current document is a frameset document
   */
  /* readonly attribute boolean isFramesetDocument; */
  NS_SCRIPTABLE NS_IMETHOD GetIsFramesetDocument(PRBool *aIsFramesetDocument) = 0;

  /**
   * This returns whether the current document is a frameset document
   */
  /* readonly attribute boolean isFramesetFrameSelected; */
  NS_SCRIPTABLE NS_IMETHOD GetIsFramesetFrameSelected(PRBool *aIsFramesetFrameSelected) = 0;

  /**
   * This returns whether there is an IFrame selected
   */
  /* readonly attribute boolean isIFrameSelected; */
  NS_SCRIPTABLE NS_IMETHOD GetIsIFrameSelected(PRBool *aIsIFrameSelected) = 0;

  /**
   * This returns whether there is a "range" selection
   */
  /* readonly attribute boolean isRangeSelection; */
  NS_SCRIPTABLE NS_IMETHOD GetIsRangeSelection(PRBool *aIsRangeSelection) = 0;

  /**
   * This returns the total number of pages for the Print Preview
   */
  /* readonly attribute long printPreviewNumPages; */
  NS_SCRIPTABLE NS_IMETHOD GetPrintPreviewNumPages(PRInt32 *aPrintPreviewNumPages) = 0;

  /**
   * Print the specified DOM window
   *
   * @param aThePrintSettings - Printer Settings for the print job, if aThePrintSettings is null
   *                            then the global PS will be used.
   * @param aWPListener - is updated during the print
   * @return void
   */
  /* void print (in nsIPrintSettings aThePrintSettings, in nsIWebProgressListener aWPListener); */
  NS_SCRIPTABLE NS_IMETHOD Print(nsIPrintSettings *aThePrintSettings, nsIWebProgressListener *aWPListener) = 0;

  /**
   * Print Preview the specified DOM window
   *
   * @param aThePrintSettings - Printer Settings for the print preview, if aThePrintSettings is null
   *                            then the global PS will be used.
   * @param aChildDOMWin - DOM Window of the child document to be PP (FrameSet frames)
   * @param aWPListener - is updated during the printpreview
   * @return void
   */
  /* void printPreview (in nsIPrintSettings aThePrintSettings, in nsIDOMWindow aChildDOMWin, in nsIWebProgressListener aWPListener); */
  NS_SCRIPTABLE NS_IMETHOD PrintPreview(nsIPrintSettings *aThePrintSettings, nsIDOMWindow *aChildDOMWin, nsIWebProgressListener *aWPListener) = 0;

  /**
   * Print Preview - Navigates within the window
   *
   * @param aNavType - navigation enum
   * @param aPageNum - page num to navigate to when aNavType = ePrintPreviewGoToPageNum
   * @return void
   */
  /* void printPreviewNavigate (in short aNavType, in long aPageNum); */
  NS_SCRIPTABLE NS_IMETHOD PrintPreviewNavigate(PRInt16 aNavType, PRInt32 aPageNum) = 0;

  /**
   * Cancels the current print 
   * @return void
   */
  /* void cancel (); */
  NS_SCRIPTABLE NS_IMETHOD Cancel(void) = 0;

  /**
   * Returns an array of the names of all documents names (Title or URL)
   * and sub-documents. This will return a single item if the attr "isFramesetDocument" is false
   * and may return any number of items is "isFramesetDocument" is true
   *
   * @param  aCount - returns number of printers returned
   * @param  aResult - returns array of names
   * @return void
   */
  /* void enumerateDocumentNames (out PRUint32 aCount, [array, size_is (aCount), retval] out wstring aResult); */
  NS_SCRIPTABLE NS_IMETHOD EnumerateDocumentNames(PRUint32 *aCount, PRUnichar ***aResult) = 0;

  /**
   * This exists PrintPreview mode and returns browser window to galley mode
   * @return void
   */
  /* void exitPrintPreview (); */
  NS_SCRIPTABLE NS_IMETHOD ExitPrintPreview(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIWebBrowserPrint, NS_IWEBBROWSERPRINT_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIWEBBROWSERPRINT \
  NS_SCRIPTABLE NS_IMETHOD GetGlobalPrintSettings(nsIPrintSettings * *aGlobalPrintSettings); \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentPrintSettings(nsIPrintSettings * *aCurrentPrintSettings); \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentChildDOMWindow(nsIDOMWindow * *aCurrentChildDOMWindow); \
  NS_SCRIPTABLE NS_IMETHOD GetDoingPrint(PRBool *aDoingPrint); \
  NS_SCRIPTABLE NS_IMETHOD GetDoingPrintPreview(PRBool *aDoingPrintPreview); \
  NS_SCRIPTABLE NS_IMETHOD GetIsFramesetDocument(PRBool *aIsFramesetDocument); \
  NS_SCRIPTABLE NS_IMETHOD GetIsFramesetFrameSelected(PRBool *aIsFramesetFrameSelected); \
  NS_SCRIPTABLE NS_IMETHOD GetIsIFrameSelected(PRBool *aIsIFrameSelected); \
  NS_SCRIPTABLE NS_IMETHOD GetIsRangeSelection(PRBool *aIsRangeSelection); \
  NS_SCRIPTABLE NS_IMETHOD GetPrintPreviewNumPages(PRInt32 *aPrintPreviewNumPages); \
  NS_SCRIPTABLE NS_IMETHOD Print(nsIPrintSettings *aThePrintSettings, nsIWebProgressListener *aWPListener); \
  NS_SCRIPTABLE NS_IMETHOD PrintPreview(nsIPrintSettings *aThePrintSettings, nsIDOMWindow *aChildDOMWin, nsIWebProgressListener *aWPListener); \
  NS_SCRIPTABLE NS_IMETHOD PrintPreviewNavigate(PRInt16 aNavType, PRInt32 aPageNum); \
  NS_SCRIPTABLE NS_IMETHOD Cancel(void); \
  NS_SCRIPTABLE NS_IMETHOD EnumerateDocumentNames(PRUint32 *aCount, PRUnichar ***aResult); \
  NS_SCRIPTABLE NS_IMETHOD ExitPrintPreview(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIWEBBROWSERPRINT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetGlobalPrintSettings(nsIPrintSettings * *aGlobalPrintSettings) { return _to GetGlobalPrintSettings(aGlobalPrintSettings); } \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentPrintSettings(nsIPrintSettings * *aCurrentPrintSettings) { return _to GetCurrentPrintSettings(aCurrentPrintSettings); } \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentChildDOMWindow(nsIDOMWindow * *aCurrentChildDOMWindow) { return _to GetCurrentChildDOMWindow(aCurrentChildDOMWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetDoingPrint(PRBool *aDoingPrint) { return _to GetDoingPrint(aDoingPrint); } \
  NS_SCRIPTABLE NS_IMETHOD GetDoingPrintPreview(PRBool *aDoingPrintPreview) { return _to GetDoingPrintPreview(aDoingPrintPreview); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsFramesetDocument(PRBool *aIsFramesetDocument) { return _to GetIsFramesetDocument(aIsFramesetDocument); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsFramesetFrameSelected(PRBool *aIsFramesetFrameSelected) { return _to GetIsFramesetFrameSelected(aIsFramesetFrameSelected); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsIFrameSelected(PRBool *aIsIFrameSelected) { return _to GetIsIFrameSelected(aIsIFrameSelected); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsRangeSelection(PRBool *aIsRangeSelection) { return _to GetIsRangeSelection(aIsRangeSelection); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrintPreviewNumPages(PRInt32 *aPrintPreviewNumPages) { return _to GetPrintPreviewNumPages(aPrintPreviewNumPages); } \
  NS_SCRIPTABLE NS_IMETHOD Print(nsIPrintSettings *aThePrintSettings, nsIWebProgressListener *aWPListener) { return _to Print(aThePrintSettings, aWPListener); } \
  NS_SCRIPTABLE NS_IMETHOD PrintPreview(nsIPrintSettings *aThePrintSettings, nsIDOMWindow *aChildDOMWin, nsIWebProgressListener *aWPListener) { return _to PrintPreview(aThePrintSettings, aChildDOMWin, aWPListener); } \
  NS_SCRIPTABLE NS_IMETHOD PrintPreviewNavigate(PRInt16 aNavType, PRInt32 aPageNum) { return _to PrintPreviewNavigate(aNavType, aPageNum); } \
  NS_SCRIPTABLE NS_IMETHOD Cancel(void) { return _to Cancel(); } \
  NS_SCRIPTABLE NS_IMETHOD EnumerateDocumentNames(PRUint32 *aCount, PRUnichar ***aResult) { return _to EnumerateDocumentNames(aCount, aResult); } \
  NS_SCRIPTABLE NS_IMETHOD ExitPrintPreview(void) { return _to ExitPrintPreview(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIWEBBROWSERPRINT(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetGlobalPrintSettings(nsIPrintSettings * *aGlobalPrintSettings) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetGlobalPrintSettings(aGlobalPrintSettings); } \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentPrintSettings(nsIPrintSettings * *aCurrentPrintSettings) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCurrentPrintSettings(aCurrentPrintSettings); } \
  NS_SCRIPTABLE NS_IMETHOD GetCurrentChildDOMWindow(nsIDOMWindow * *aCurrentChildDOMWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCurrentChildDOMWindow(aCurrentChildDOMWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetDoingPrint(PRBool *aDoingPrint) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDoingPrint(aDoingPrint); } \
  NS_SCRIPTABLE NS_IMETHOD GetDoingPrintPreview(PRBool *aDoingPrintPreview) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDoingPrintPreview(aDoingPrintPreview); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsFramesetDocument(PRBool *aIsFramesetDocument) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsFramesetDocument(aIsFramesetDocument); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsFramesetFrameSelected(PRBool *aIsFramesetFrameSelected) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsFramesetFrameSelected(aIsFramesetFrameSelected); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsIFrameSelected(PRBool *aIsIFrameSelected) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsIFrameSelected(aIsIFrameSelected); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsRangeSelection(PRBool *aIsRangeSelection) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsRangeSelection(aIsRangeSelection); } \
  NS_SCRIPTABLE NS_IMETHOD GetPrintPreviewNumPages(PRInt32 *aPrintPreviewNumPages) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPrintPreviewNumPages(aPrintPreviewNumPages); } \
  NS_SCRIPTABLE NS_IMETHOD Print(nsIPrintSettings *aThePrintSettings, nsIWebProgressListener *aWPListener) { return !_to ? NS_ERROR_NULL_POINTER : _to->Print(aThePrintSettings, aWPListener); } \
  NS_SCRIPTABLE NS_IMETHOD PrintPreview(nsIPrintSettings *aThePrintSettings, nsIDOMWindow *aChildDOMWin, nsIWebProgressListener *aWPListener) { return !_to ? NS_ERROR_NULL_POINTER : _to->PrintPreview(aThePrintSettings, aChildDOMWin, aWPListener); } \
  NS_SCRIPTABLE NS_IMETHOD PrintPreviewNavigate(PRInt16 aNavType, PRInt32 aPageNum) { return !_to ? NS_ERROR_NULL_POINTER : _to->PrintPreviewNavigate(aNavType, aPageNum); } \
  NS_SCRIPTABLE NS_IMETHOD Cancel(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Cancel(); } \
  NS_SCRIPTABLE NS_IMETHOD EnumerateDocumentNames(PRUint32 *aCount, PRUnichar ***aResult) { return !_to ? NS_ERROR_NULL_POINTER : _to->EnumerateDocumentNames(aCount, aResult); } \
  NS_SCRIPTABLE NS_IMETHOD ExitPrintPreview(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->ExitPrintPreview(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsWebBrowserPrint : public nsIWebBrowserPrint
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIWEBBROWSERPRINT

  nsWebBrowserPrint();

private:
  ~nsWebBrowserPrint();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsWebBrowserPrint, nsIWebBrowserPrint)

nsWebBrowserPrint::nsWebBrowserPrint()
{
  /* member initializers and constructor code */
}

nsWebBrowserPrint::~nsWebBrowserPrint()
{
  /* destructor code */
}

/* readonly attribute nsIPrintSettings globalPrintSettings; */
NS_IMETHODIMP nsWebBrowserPrint::GetGlobalPrintSettings(nsIPrintSettings * *aGlobalPrintSettings)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIPrintSettings currentPrintSettings; */
NS_IMETHODIMP nsWebBrowserPrint::GetCurrentPrintSettings(nsIPrintSettings * *aCurrentPrintSettings)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMWindow currentChildDOMWindow; */
NS_IMETHODIMP nsWebBrowserPrint::GetCurrentChildDOMWindow(nsIDOMWindow * *aCurrentChildDOMWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean doingPrint; */
NS_IMETHODIMP nsWebBrowserPrint::GetDoingPrint(PRBool *aDoingPrint)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean doingPrintPreview; */
NS_IMETHODIMP nsWebBrowserPrint::GetDoingPrintPreview(PRBool *aDoingPrintPreview)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean isFramesetDocument; */
NS_IMETHODIMP nsWebBrowserPrint::GetIsFramesetDocument(PRBool *aIsFramesetDocument)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean isFramesetFrameSelected; */
NS_IMETHODIMP nsWebBrowserPrint::GetIsFramesetFrameSelected(PRBool *aIsFramesetFrameSelected)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean isIFrameSelected; */
NS_IMETHODIMP nsWebBrowserPrint::GetIsIFrameSelected(PRBool *aIsIFrameSelected)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute boolean isRangeSelection; */
NS_IMETHODIMP nsWebBrowserPrint::GetIsRangeSelection(PRBool *aIsRangeSelection)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long printPreviewNumPages; */
NS_IMETHODIMP nsWebBrowserPrint::GetPrintPreviewNumPages(PRInt32 *aPrintPreviewNumPages)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void print (in nsIPrintSettings aThePrintSettings, in nsIWebProgressListener aWPListener); */
NS_IMETHODIMP nsWebBrowserPrint::Print(nsIPrintSettings *aThePrintSettings, nsIWebProgressListener *aWPListener)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void printPreview (in nsIPrintSettings aThePrintSettings, in nsIDOMWindow aChildDOMWin, in nsIWebProgressListener aWPListener); */
NS_IMETHODIMP nsWebBrowserPrint::PrintPreview(nsIPrintSettings *aThePrintSettings, nsIDOMWindow *aChildDOMWin, nsIWebProgressListener *aWPListener)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void printPreviewNavigate (in short aNavType, in long aPageNum); */
NS_IMETHODIMP nsWebBrowserPrint::PrintPreviewNavigate(PRInt16 aNavType, PRInt32 aPageNum)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void cancel (); */
NS_IMETHODIMP nsWebBrowserPrint::Cancel()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void enumerateDocumentNames (out PRUint32 aCount, [array, size_is (aCount), retval] out wstring aResult); */
NS_IMETHODIMP nsWebBrowserPrint::EnumerateDocumentNames(PRUint32 *aCount, PRUnichar ***aResult)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void exitPrintPreview (); */
NS_IMETHODIMP nsWebBrowserPrint::ExitPrintPreview()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIWebBrowserPrint_h__ */
