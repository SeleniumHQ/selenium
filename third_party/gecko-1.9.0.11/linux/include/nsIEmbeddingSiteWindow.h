/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/embedding/browser/webBrowser/nsIEmbeddingSiteWindow.idl
 */

#ifndef __gen_nsIEmbeddingSiteWindow_h__
#define __gen_nsIEmbeddingSiteWindow_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIEmbeddingSiteWindow */
#define NS_IEMBEDDINGSITEWINDOW_IID_STR "3e5432cd-9568-4bd1-8cbe-d50aba110743"

#define NS_IEMBEDDINGSITEWINDOW_IID \
  {0x3e5432cd, 0x9568, 0x4bd1, \
    { 0x8c, 0xbe, 0xd5, 0x0a, 0xba, 0x11, 0x07, 0x43 }}

/**
 * The nsIEmbeddingSiteWindow is implemented by the embedder to provide
 * Gecko with the means to call up to the host to resize the window,
 * hide or show it and set/get its title.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIEmbeddingSiteWindow : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IEMBEDDINGSITEWINDOW_IID)

  /**
     * Flag indicates that position of the top left corner of the outer area
     * is required/specified.
     *
     * @see setDimensions
     * @see getDimensions
     */
  enum { DIM_FLAGS_POSITION = 1U };

  /**
     * Flag indicates that the size of the inner area is required/specified.
     *
     * @note The inner and outer flags are mutually exclusive and it is
     *       invalid to combine them.
     *
     * @see setDimensions
     * @see getDimensions
     * @see DIM_FLAGS_SIZE_OUTER
     */
  enum { DIM_FLAGS_SIZE_INNER = 2U };

  /**
     * Flag indicates that the size of the outer area is required/specified.
     *
     * @see setDimensions
     * @see getDimensions
     * @see DIM_FLAGS_SIZE_INNER
     */
  enum { DIM_FLAGS_SIZE_OUTER = 4U };

  /**
     * Sets the dimensions for the window; the position & size. The
     * flags to indicate what the caller wants to set and whether the size
     * refers to the inner or outer area. The inner area refers to just
     * the embedded area, wheras the outer area can also include any 
     * surrounding chrome, window frame, title bar, and so on.
     *
     * @param flags  Combination of position, inner and outer size flags.
     * @param x      Left hand corner of the outer area.
     * @param y      Top corner of the outer area.
     * @param cx     Width of the inner or outer area.
     * @param cy     Height of the inner or outer area.
     *
     * @return <code>NS_OK</code> if operation was performed correctly;
     *         <code>NS_ERROR_UNEXPECTED</code> if window could not be
     *           destroyed;
     *         <code>NS_ERROR_INVALID_ARG</code> for bad flag combination
     *           or illegal dimensions.
     *
     * @see getDimensions
     * @see DIM_FLAGS_POSITION
     * @see DIM_FLAGS_SIZE_OUTER
     * @see DIM_FLAGS_SIZE_INNER
     */
  /* void setDimensions (in unsigned long flags, in long x, in long y, in long cx, in long cy); */
  NS_SCRIPTABLE NS_IMETHOD SetDimensions(PRUint32 flags, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy) = 0;

  /**
     * Gets the dimensions of the window. The caller may pass
     * <CODE>nsnull</CODE> for any value it is uninterested in receiving.
     *
     * @param flags  Combination of position, inner and outer size flag .
     * @param x      Left hand corner of the outer area; or <CODE>nsnull</CODE>.
     * @param y      Top corner of the outer area; or <CODE>nsnull</CODE>.
     * @param cx     Width of the inner or outer area; or <CODE>nsnull</CODE>.
     * @param cy     Height of the inner or outer area; or <CODE>nsnull</CODE>.
     *
     * @see setDimensions
     * @see DIM_FLAGS_POSITION
     * @see DIM_FLAGS_SIZE_OUTER
     * @see DIM_FLAGS_SIZE_INNER
     */
  /* void getDimensions (in unsigned long flags, out long x, out long y, out long cx, out long cy); */
  NS_SCRIPTABLE NS_IMETHOD GetDimensions(PRUint32 flags, PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy) = 0;

  /**
     * Give the window focus.
     */
  /* void setFocus (); */
  NS_SCRIPTABLE NS_IMETHOD SetFocus(void) = 0;

  /**
     * Visibility of the window.
     */
  /* attribute boolean visibility; */
  NS_SCRIPTABLE NS_IMETHOD GetVisibility(PRBool *aVisibility) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVisibility(PRBool aVisibility) = 0;

  /**
     * Title of the window.
     */
  /* attribute wstring title; */
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const PRUnichar * aTitle) = 0;

  /**
     * Native window for the site's window. The implementor should copy the
     * native window object into the address supplied by the caller. The
     * type of the native window that the address refers to is  platform
     * and OS specific as follows:
     *
     * <ul>
     *   <li>On Win32 it is an <CODE>HWND</CODE>.</li>
     *   <li>On MacOS this is a <CODE>WindowPtr</CODE>.</li>
     *   <li>On GTK this is a <CODE>GtkWidget*</CODE>.</li>
     * </ul>
     */
  /* [noscript] readonly attribute voidPtr siteWindow; */
  NS_IMETHOD GetSiteWindow(void * *aSiteWindow) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIEmbeddingSiteWindow, NS_IEMBEDDINGSITEWINDOW_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIEMBEDDINGSITEWINDOW \
  NS_SCRIPTABLE NS_IMETHOD SetDimensions(PRUint32 flags, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy); \
  NS_SCRIPTABLE NS_IMETHOD GetDimensions(PRUint32 flags, PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy); \
  NS_SCRIPTABLE NS_IMETHOD SetFocus(void); \
  NS_SCRIPTABLE NS_IMETHOD GetVisibility(PRBool *aVisibility); \
  NS_SCRIPTABLE NS_IMETHOD SetVisibility(PRBool aVisibility); \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle); \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const PRUnichar * aTitle); \
  NS_IMETHOD GetSiteWindow(void * *aSiteWindow); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIEMBEDDINGSITEWINDOW(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetDimensions(PRUint32 flags, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy) { return _to SetDimensions(flags, x, y, cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD GetDimensions(PRUint32 flags, PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy) { return _to GetDimensions(flags, x, y, cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocus(void) { return _to SetFocus(); } \
  NS_SCRIPTABLE NS_IMETHOD GetVisibility(PRBool *aVisibility) { return _to GetVisibility(aVisibility); } \
  NS_SCRIPTABLE NS_IMETHOD SetVisibility(PRBool aVisibility) { return _to SetVisibility(aVisibility); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle) { return _to GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const PRUnichar * aTitle) { return _to SetTitle(aTitle); } \
  NS_IMETHOD GetSiteWindow(void * *aSiteWindow) { return _to GetSiteWindow(aSiteWindow); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIEMBEDDINGSITEWINDOW(_to) \
  NS_SCRIPTABLE NS_IMETHOD SetDimensions(PRUint32 flags, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDimensions(flags, x, y, cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD GetDimensions(PRUint32 flags, PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDimensions(flags, x, y, cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocus(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFocus(); } \
  NS_SCRIPTABLE NS_IMETHOD GetVisibility(PRBool *aVisibility) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVisibility(aVisibility); } \
  NS_SCRIPTABLE NS_IMETHOD SetVisibility(PRBool aVisibility) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVisibility(aVisibility); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const PRUnichar * aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTitle(aTitle); } \
  NS_IMETHOD GetSiteWindow(void * *aSiteWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSiteWindow(aSiteWindow); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsEmbeddingSiteWindow : public nsIEmbeddingSiteWindow
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIEMBEDDINGSITEWINDOW

  nsEmbeddingSiteWindow();

private:
  ~nsEmbeddingSiteWindow();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsEmbeddingSiteWindow, nsIEmbeddingSiteWindow)

nsEmbeddingSiteWindow::nsEmbeddingSiteWindow()
{
  /* member initializers and constructor code */
}

nsEmbeddingSiteWindow::~nsEmbeddingSiteWindow()
{
  /* destructor code */
}

/* void setDimensions (in unsigned long flags, in long x, in long y, in long cx, in long cy); */
NS_IMETHODIMP nsEmbeddingSiteWindow::SetDimensions(PRUint32 flags, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getDimensions (in unsigned long flags, out long x, out long y, out long cx, out long cy); */
NS_IMETHODIMP nsEmbeddingSiteWindow::GetDimensions(PRUint32 flags, PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setFocus (); */
NS_IMETHODIMP nsEmbeddingSiteWindow::SetFocus()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean visibility; */
NS_IMETHODIMP nsEmbeddingSiteWindow::GetVisibility(PRBool *aVisibility)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsEmbeddingSiteWindow::SetVisibility(PRBool aVisibility)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute wstring title; */
NS_IMETHODIMP nsEmbeddingSiteWindow::GetTitle(PRUnichar * *aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsEmbeddingSiteWindow::SetTitle(const PRUnichar * aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] readonly attribute voidPtr siteWindow; */
NS_IMETHODIMP nsEmbeddingSiteWindow::GetSiteWindow(void * *aSiteWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIEmbeddingSiteWindow_h__ */
