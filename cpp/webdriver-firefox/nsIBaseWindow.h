/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM firefox/src/cpp/webdriver-firefox/nsIBaseWindow.idl
 */

#ifndef __gen_nsIBaseWindow_h__
#define __gen_nsIBaseWindow_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsrootidl_h__
#include "nsrootidl.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIWidget;
typedef void * nativeWindow;


/* starting interface:    nsIBaseWindow */
#define NS_IBASEWINDOW_IID_STR "046bc8a0-8015-11d3-af70-00a024ffc08c"

#define NS_IBASEWINDOW_IID \
  {0x046bc8a0, 0x8015, 0x11d3, \
    { 0xaf, 0x70, 0x00, 0xa0, 0x24, 0xff, 0xc0, 0x8c }}

/**
 * The nsIBaseWindow describes a generic window and basic operations that 
 * can be performed on it.  This is not to be a complete windowing interface
 * but rather a common set that nearly all windowed objects support.    
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIBaseWindow : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IBASEWINDOW_IID)

  /* [noscript] void initWindow (in nativeWindow parentNativeWindow, in nsIWidget parentWidget, in long x, in long y, in long cx, in long cy); */
  NS_IMETHOD InitWindow(nativeWindow parentNativeWindow, nsIWidget * parentWidget, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy) = 0;

  /* void create (); */
  NS_SCRIPTABLE NS_IMETHOD Create(void) = 0;

  /* void destroy (); */
  NS_SCRIPTABLE NS_IMETHOD Destroy(void) = 0;

  /* void setPosition (in long x, in long y); */
  NS_SCRIPTABLE NS_IMETHOD SetPosition(PRInt32 x, PRInt32 y) = 0;

  /* void getPosition (out long x, out long y); */
  NS_SCRIPTABLE NS_IMETHOD GetPosition(PRInt32 *x, PRInt32 *y) = 0;

  /* void setSize (in long cx, in long cy, in boolean fRepaint); */
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 cx, PRInt32 cy, PRBool fRepaint) = 0;

  /* void getSize (out long cx, out long cy); */
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *cx, PRInt32 *cy) = 0;

  /* void setPositionAndSize (in long x, in long y, in long cx, in long cy, in boolean fRepaint); */
  NS_SCRIPTABLE NS_IMETHOD SetPositionAndSize(PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy, PRBool fRepaint) = 0;

  /* void getPositionAndSize (out long x, out long y, out long cx, out long cy); */
  NS_SCRIPTABLE NS_IMETHOD GetPositionAndSize(PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy) = 0;

  /** 
	 * Tell the window to repaint itself
	 * @param aForce - if true, repaint immediately
	 *                 if false, the window may defer repainting as it sees fit.
	 */
  /* void repaint (in boolean force); */
  NS_SCRIPTABLE NS_IMETHOD Repaint(PRBool force) = 0;

  /* [noscript] attribute nsIWidget parentWidget; */
  NS_IMETHOD GetParentWidget(nsIWidget * *aParentWidget) = 0;
  NS_IMETHOD SetParentWidget(nsIWidget * aParentWidget) = 0;

  /* attribute nativeWindow parentNativeWindow; */
  NS_SCRIPTABLE NS_IMETHOD GetParentNativeWindow(nativeWindow *aParentNativeWindow) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetParentNativeWindow(nativeWindow aParentNativeWindow) = 0;

  /* attribute boolean visibility; */
  NS_SCRIPTABLE NS_IMETHOD GetVisibility(PRBool *aVisibility) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetVisibility(PRBool aVisibility) = 0;

  /* attribute boolean enabled; */
  NS_SCRIPTABLE NS_IMETHOD GetEnabled(PRBool *aEnabled) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetEnabled(PRBool aEnabled) = 0;

  /** set blurSuppression to true to suppress handling of blur events.
     *  set it false to re-enable them. query it to determine whether
     *  blur events are suppressed. The implementation should allow
     *  for blur events to be suppressed multiple times.
     */
  /* attribute boolean blurSuppression; */
  NS_SCRIPTABLE NS_IMETHOD GetBlurSuppression(PRBool *aBlurSuppression) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetBlurSuppression(PRBool aBlurSuppression) = 0;

  /* [noscript] readonly attribute nsIWidget mainWidget; */
  NS_IMETHOD GetMainWidget(nsIWidget * *aMainWidget) = 0;

  /**
	* Give the window focus.
	*/
  /* void setFocus (); */
  NS_SCRIPTABLE NS_IMETHOD SetFocus(void) = 0;

  /* attribute wstring title; */
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const PRUnichar * aTitle) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIBaseWindow, NS_IBASEWINDOW_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIBASEWINDOW \
  NS_IMETHOD InitWindow(nativeWindow parentNativeWindow, nsIWidget * parentWidget, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy); \
  NS_SCRIPTABLE NS_IMETHOD Create(void); \
  NS_SCRIPTABLE NS_IMETHOD Destroy(void); \
  NS_SCRIPTABLE NS_IMETHOD SetPosition(PRInt32 x, PRInt32 y); \
  NS_SCRIPTABLE NS_IMETHOD GetPosition(PRInt32 *x, PRInt32 *y); \
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 cx, PRInt32 cy, PRBool fRepaint); \
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *cx, PRInt32 *cy); \
  NS_SCRIPTABLE NS_IMETHOD SetPositionAndSize(PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy, PRBool fRepaint); \
  NS_SCRIPTABLE NS_IMETHOD GetPositionAndSize(PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy); \
  NS_SCRIPTABLE NS_IMETHOD Repaint(PRBool force); \
  NS_IMETHOD GetParentWidget(nsIWidget * *aParentWidget); \
  NS_IMETHOD SetParentWidget(nsIWidget * aParentWidget); \
  NS_SCRIPTABLE NS_IMETHOD GetParentNativeWindow(nativeWindow *aParentNativeWindow); \
  NS_SCRIPTABLE NS_IMETHOD SetParentNativeWindow(nativeWindow aParentNativeWindow); \
  NS_SCRIPTABLE NS_IMETHOD GetVisibility(PRBool *aVisibility); \
  NS_SCRIPTABLE NS_IMETHOD SetVisibility(PRBool aVisibility); \
  NS_SCRIPTABLE NS_IMETHOD GetEnabled(PRBool *aEnabled); \
  NS_SCRIPTABLE NS_IMETHOD SetEnabled(PRBool aEnabled); \
  NS_SCRIPTABLE NS_IMETHOD GetBlurSuppression(PRBool *aBlurSuppression); \
  NS_SCRIPTABLE NS_IMETHOD SetBlurSuppression(PRBool aBlurSuppression); \
  NS_IMETHOD GetMainWidget(nsIWidget * *aMainWidget); \
  NS_SCRIPTABLE NS_IMETHOD SetFocus(void); \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle); \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const PRUnichar * aTitle); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIBASEWINDOW(_to) \
  NS_IMETHOD InitWindow(nativeWindow parentNativeWindow, nsIWidget * parentWidget, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy) { return _to InitWindow(parentNativeWindow, parentWidget, x, y, cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD Create(void) { return _to Create(); } \
  NS_SCRIPTABLE NS_IMETHOD Destroy(void) { return _to Destroy(); } \
  NS_SCRIPTABLE NS_IMETHOD SetPosition(PRInt32 x, PRInt32 y) { return _to SetPosition(x, y); } \
  NS_SCRIPTABLE NS_IMETHOD GetPosition(PRInt32 *x, PRInt32 *y) { return _to GetPosition(x, y); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 cx, PRInt32 cy, PRBool fRepaint) { return _to SetSize(cx, cy, fRepaint); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *cx, PRInt32 *cy) { return _to GetSize(cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD SetPositionAndSize(PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy, PRBool fRepaint) { return _to SetPositionAndSize(x, y, cx, cy, fRepaint); } \
  NS_SCRIPTABLE NS_IMETHOD GetPositionAndSize(PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy) { return _to GetPositionAndSize(x, y, cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD Repaint(PRBool force) { return _to Repaint(force); } \
  NS_IMETHOD GetParentWidget(nsIWidget * *aParentWidget) { return _to GetParentWidget(aParentWidget); } \
  NS_IMETHOD SetParentWidget(nsIWidget * aParentWidget) { return _to SetParentWidget(aParentWidget); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentNativeWindow(nativeWindow *aParentNativeWindow) { return _to GetParentNativeWindow(aParentNativeWindow); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentNativeWindow(nativeWindow aParentNativeWindow) { return _to SetParentNativeWindow(aParentNativeWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetVisibility(PRBool *aVisibility) { return _to GetVisibility(aVisibility); } \
  NS_SCRIPTABLE NS_IMETHOD SetVisibility(PRBool aVisibility) { return _to SetVisibility(aVisibility); } \
  NS_SCRIPTABLE NS_IMETHOD GetEnabled(PRBool *aEnabled) { return _to GetEnabled(aEnabled); } \
  NS_SCRIPTABLE NS_IMETHOD SetEnabled(PRBool aEnabled) { return _to SetEnabled(aEnabled); } \
  NS_SCRIPTABLE NS_IMETHOD GetBlurSuppression(PRBool *aBlurSuppression) { return _to GetBlurSuppression(aBlurSuppression); } \
  NS_SCRIPTABLE NS_IMETHOD SetBlurSuppression(PRBool aBlurSuppression) { return _to SetBlurSuppression(aBlurSuppression); } \
  NS_IMETHOD GetMainWidget(nsIWidget * *aMainWidget) { return _to GetMainWidget(aMainWidget); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocus(void) { return _to SetFocus(); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle) { return _to GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const PRUnichar * aTitle) { return _to SetTitle(aTitle); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIBASEWINDOW(_to) \
  NS_IMETHOD InitWindow(nativeWindow parentNativeWindow, nsIWidget * parentWidget, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitWindow(parentNativeWindow, parentWidget, x, y, cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD Create(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Create(); } \
  NS_SCRIPTABLE NS_IMETHOD Destroy(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Destroy(); } \
  NS_SCRIPTABLE NS_IMETHOD SetPosition(PRInt32 x, PRInt32 y) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPosition(x, y); } \
  NS_SCRIPTABLE NS_IMETHOD GetPosition(PRInt32 *x, PRInt32 *y) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPosition(x, y); } \
  NS_SCRIPTABLE NS_IMETHOD SetSize(PRInt32 cx, PRInt32 cy, PRBool fRepaint) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetSize(cx, cy, fRepaint); } \
  NS_SCRIPTABLE NS_IMETHOD GetSize(PRInt32 *cx, PRInt32 *cy) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSize(cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD SetPositionAndSize(PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy, PRBool fRepaint) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPositionAndSize(x, y, cx, cy, fRepaint); } \
  NS_SCRIPTABLE NS_IMETHOD GetPositionAndSize(PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPositionAndSize(x, y, cx, cy); } \
  NS_SCRIPTABLE NS_IMETHOD Repaint(PRBool force) { return !_to ? NS_ERROR_NULL_POINTER : _to->Repaint(force); } \
  NS_IMETHOD GetParentWidget(nsIWidget * *aParentWidget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentWidget(aParentWidget); } \
  NS_IMETHOD SetParentWidget(nsIWidget * aParentWidget) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetParentWidget(aParentWidget); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentNativeWindow(nativeWindow *aParentNativeWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentNativeWindow(aParentNativeWindow); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentNativeWindow(nativeWindow aParentNativeWindow) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetParentNativeWindow(aParentNativeWindow); } \
  NS_SCRIPTABLE NS_IMETHOD GetVisibility(PRBool *aVisibility) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVisibility(aVisibility); } \
  NS_SCRIPTABLE NS_IMETHOD SetVisibility(PRBool aVisibility) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVisibility(aVisibility); } \
  NS_SCRIPTABLE NS_IMETHOD GetEnabled(PRBool *aEnabled) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetEnabled(aEnabled); } \
  NS_SCRIPTABLE NS_IMETHOD SetEnabled(PRBool aEnabled) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetEnabled(aEnabled); } \
  NS_SCRIPTABLE NS_IMETHOD GetBlurSuppression(PRBool *aBlurSuppression) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetBlurSuppression(aBlurSuppression); } \
  NS_SCRIPTABLE NS_IMETHOD SetBlurSuppression(PRBool aBlurSuppression) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetBlurSuppression(aBlurSuppression); } \
  NS_IMETHOD GetMainWidget(nsIWidget * *aMainWidget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMainWidget(aMainWidget); } \
  NS_SCRIPTABLE NS_IMETHOD SetFocus(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFocus(); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(PRUnichar * *aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const PRUnichar * aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTitle(aTitle); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsBaseWindow : public nsIBaseWindow
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIBASEWINDOW

  nsBaseWindow();

private:
  ~nsBaseWindow();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsBaseWindow, nsIBaseWindow)

nsBaseWindow::nsBaseWindow()
{
  /* member initializers and constructor code */
}

nsBaseWindow::~nsBaseWindow()
{
  /* destructor code */
}

/* [noscript] void initWindow (in nativeWindow parentNativeWindow, in nsIWidget parentWidget, in long x, in long y, in long cx, in long cy); */
NS_IMETHODIMP nsBaseWindow::InitWindow(nativeWindow parentNativeWindow, nsIWidget * parentWidget, PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void create (); */
NS_IMETHODIMP nsBaseWindow::Create()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void destroy (); */
NS_IMETHODIMP nsBaseWindow::Destroy()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setPosition (in long x, in long y); */
NS_IMETHODIMP nsBaseWindow::SetPosition(PRInt32 x, PRInt32 y)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getPosition (out long x, out long y); */
NS_IMETHODIMP nsBaseWindow::GetPosition(PRInt32 *x, PRInt32 *y)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setSize (in long cx, in long cy, in boolean fRepaint); */
NS_IMETHODIMP nsBaseWindow::SetSize(PRInt32 cx, PRInt32 cy, PRBool fRepaint)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getSize (out long cx, out long cy); */
NS_IMETHODIMP nsBaseWindow::GetSize(PRInt32 *cx, PRInt32 *cy)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setPositionAndSize (in long x, in long y, in long cx, in long cy, in boolean fRepaint); */
NS_IMETHODIMP nsBaseWindow::SetPositionAndSize(PRInt32 x, PRInt32 y, PRInt32 cx, PRInt32 cy, PRBool fRepaint)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getPositionAndSize (out long x, out long y, out long cx, out long cy); */
NS_IMETHODIMP nsBaseWindow::GetPositionAndSize(PRInt32 *x, PRInt32 *y, PRInt32 *cx, PRInt32 *cy)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void repaint (in boolean force); */
NS_IMETHODIMP nsBaseWindow::Repaint(PRBool force)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] attribute nsIWidget parentWidget; */
NS_IMETHODIMP nsBaseWindow::GetParentWidget(nsIWidget * *aParentWidget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsBaseWindow::SetParentWidget(nsIWidget * aParentWidget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nativeWindow parentNativeWindow; */
NS_IMETHODIMP nsBaseWindow::GetParentNativeWindow(nativeWindow *aParentNativeWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsBaseWindow::SetParentNativeWindow(nativeWindow aParentNativeWindow)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean visibility; */
NS_IMETHODIMP nsBaseWindow::GetVisibility(PRBool *aVisibility)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsBaseWindow::SetVisibility(PRBool aVisibility)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean enabled; */
NS_IMETHODIMP nsBaseWindow::GetEnabled(PRBool *aEnabled)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsBaseWindow::SetEnabled(PRBool aEnabled)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean blurSuppression; */
NS_IMETHODIMP nsBaseWindow::GetBlurSuppression(PRBool *aBlurSuppression)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsBaseWindow::SetBlurSuppression(PRBool aBlurSuppression)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] readonly attribute nsIWidget mainWidget; */
NS_IMETHODIMP nsBaseWindow::GetMainWidget(nsIWidget * *aMainWidget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setFocus (); */
NS_IMETHODIMP nsBaseWindow::SetFocus()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute wstring title; */
NS_IMETHODIMP nsBaseWindow::GetTitle(PRUnichar * *aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsBaseWindow::SetTitle(const PRUnichar * aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIBaseWindow_h__ */
