/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/base/nsIDOMWindow.idl
 */

#ifndef __gen_nsIDOMWindow_h__
#define __gen_nsIDOMWindow_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsISelection; /* forward declaration */


/* starting interface:    nsIDOMWindow */
#define NS_IDOMWINDOW_IID_STR "a6cf906b-15b3-11d2-932e-00805f8add32"

#define NS_IDOMWINDOW_IID \
  {0xa6cf906b, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMWindow : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMWINDOW_IID)

  /**
 * The nsIDOMWindow interface is the primary interface for a DOM
 * window object. It represents a single window object that may
 * contain child windows if the document in the window contains a
 * HTML frameset document or if the document contains iframe elements.
 *
 * This interface is not officially defined by any standard bodies, it
 * originates from the defacto DOM Level 0 standard.
 *
 * @status FROZEN
 */
/**
   * Accessor for the document in this window.
   */
  /* readonly attribute nsIDOMDocument document; */
  NS_SCRIPTABLE NS_IMETHOD GetDocument(nsIDOMDocument * *aDocument) = 0;

  /**
   * Accessor for this window's parent window, or the window itself if
   * there is no parent, or if the parent is of different type
   * (i.e. this does not cross chrome-content boundaries).
   */
  /* readonly attribute nsIDOMWindow parent; */
  NS_SCRIPTABLE NS_IMETHOD GetParent(nsIDOMWindow * *aParent) = 0;

  /**
   * Accessor for the root of this hierarchy of windows. This root may
   * be the window itself if there is no parent, or if the parent is
   * of different type (i.e. this does not cross chrome-content
   * boundaries).
   *
   * This property is "replaceable" in JavaScript */
  /* readonly attribute nsIDOMWindow top; */
  NS_SCRIPTABLE NS_IMETHOD GetTop(nsIDOMWindow * *aTop) = 0;

  /**
   * Accessor for the object that controls whether or not scrollbars
   * are shown in this window.
   *
   * This attribute is "replaceable" in JavaScript
   */
  /* readonly attribute nsIDOMBarProp scrollbars; */
  NS_SCRIPTABLE NS_IMETHOD GetScrollbars(nsIDOMBarProp * *aScrollbars) = 0;

  /**
   * Accessor for the child windows in this window.
   */
  /* [noscript] readonly attribute nsIDOMWindowCollection frames; */
  NS_IMETHOD GetFrames(nsIDOMWindowCollection * *aFrames) = 0;

  /**
   * Set/Get the name of this window.
   *
   * This attribute is "replaceable" in JavaScript
   */
  /* attribute DOMString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /**
   * Set/Get the document scale factor as a multiplier on the default
   * size. When setting this attribute, a NS_ERROR_NOT_IMPLEMENTED
   * error may be returned by implementations not supporting
   * zoom. Implementations not supporting zoom should return 1.0 all
   * the time for the Get operation. 1.0 is equals normal size,
   * i.e. no zoom.
   */
  /* [noscript] attribute float textZoom; */
  NS_IMETHOD GetTextZoom(float *aTextZoom) = 0;
  NS_IMETHOD SetTextZoom(float aTextZoom) = 0;

  /**
   * Accessor for the current x scroll position in this window in
   * pixels.
   *
   * This attribute is "replaceable" in JavaScript
   */
  /* readonly attribute long scrollX; */
  NS_SCRIPTABLE NS_IMETHOD GetScrollX(PRInt32 *aScrollX) = 0;

  /**
   * Accessor for the current y scroll position in this window in
   * pixels.
   *
   * This attribute is "replaceable" in JavaScript
   */
  /* readonly attribute long scrollY; */
  NS_SCRIPTABLE NS_IMETHOD GetScrollY(PRInt32 *aScrollY) = 0;

  /**
   * Method for scrolling this window to an absolute pixel offset.
   */
  /* void scrollTo (in long xScroll, in long yScroll); */
  NS_SCRIPTABLE NS_IMETHOD ScrollTo(PRInt32 xScroll, PRInt32 yScroll) = 0;

  /**
   * Method for scrolling this window to a pixel offset relative to
   * the current scroll position.
   */
  /* void scrollBy (in long xScrollDif, in long yScrollDif); */
  NS_SCRIPTABLE NS_IMETHOD ScrollBy(PRInt32 xScrollDif, PRInt32 yScrollDif) = 0;

  /**
   * Method for accessing this window's selection object.
   */
  /* nsISelection getSelection (); */
  NS_SCRIPTABLE NS_IMETHOD GetSelection(nsISelection **_retval) = 0;

  /**
   * Method for scrolling this window by a number of lines.
   */
  /* void scrollByLines (in long numLines); */
  NS_SCRIPTABLE NS_IMETHOD ScrollByLines(PRInt32 numLines) = 0;

  /**
   * Method for scrolling this window by a number of pages.
   */
  /* void scrollByPages (in long numPages); */
  NS_SCRIPTABLE NS_IMETHOD ScrollByPages(PRInt32 numPages) = 0;

  /**
   * Method for sizing this window to the content in the window.
   */
  /* void sizeToContent (); */
  NS_SCRIPTABLE NS_IMETHOD SizeToContent(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMWindow, NS_IDOMWINDOW_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMWINDOW \
  NS_SCRIPTABLE NS_IMETHOD GetDocument(nsIDOMDocument * *aDocument); \
  NS_SCRIPTABLE NS_IMETHOD GetParent(nsIDOMWindow * *aParent); \
  NS_SCRIPTABLE NS_IMETHOD GetTop(nsIDOMWindow * *aTop); \
  NS_SCRIPTABLE NS_IMETHOD GetScrollbars(nsIDOMBarProp * *aScrollbars); \
  NS_IMETHOD GetFrames(nsIDOMWindowCollection * *aFrames); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_IMETHOD GetTextZoom(float *aTextZoom); \
  NS_IMETHOD SetTextZoom(float aTextZoom); \
  NS_SCRIPTABLE NS_IMETHOD GetScrollX(PRInt32 *aScrollX); \
  NS_SCRIPTABLE NS_IMETHOD GetScrollY(PRInt32 *aScrollY); \
  NS_SCRIPTABLE NS_IMETHOD ScrollTo(PRInt32 xScroll, PRInt32 yScroll); \
  NS_SCRIPTABLE NS_IMETHOD ScrollBy(PRInt32 xScrollDif, PRInt32 yScrollDif); \
  NS_SCRIPTABLE NS_IMETHOD GetSelection(nsISelection **_retval); \
  NS_SCRIPTABLE NS_IMETHOD ScrollByLines(PRInt32 numLines); \
  NS_SCRIPTABLE NS_IMETHOD ScrollByPages(PRInt32 numPages); \
  NS_SCRIPTABLE NS_IMETHOD SizeToContent(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMWINDOW(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDocument(nsIDOMDocument * *aDocument) { return _to GetDocument(aDocument); } \
  NS_SCRIPTABLE NS_IMETHOD GetParent(nsIDOMWindow * *aParent) { return _to GetParent(aParent); } \
  NS_SCRIPTABLE NS_IMETHOD GetTop(nsIDOMWindow * *aTop) { return _to GetTop(aTop); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrollbars(nsIDOMBarProp * *aScrollbars) { return _to GetScrollbars(aScrollbars); } \
  NS_IMETHOD GetFrames(nsIDOMWindowCollection * *aFrames) { return _to GetFrames(aFrames); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_IMETHOD GetTextZoom(float *aTextZoom) { return _to GetTextZoom(aTextZoom); } \
  NS_IMETHOD SetTextZoom(float aTextZoom) { return _to SetTextZoom(aTextZoom); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrollX(PRInt32 *aScrollX) { return _to GetScrollX(aScrollX); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrollY(PRInt32 *aScrollY) { return _to GetScrollY(aScrollY); } \
  NS_SCRIPTABLE NS_IMETHOD ScrollTo(PRInt32 xScroll, PRInt32 yScroll) { return _to ScrollTo(xScroll, yScroll); } \
  NS_SCRIPTABLE NS_IMETHOD ScrollBy(PRInt32 xScrollDif, PRInt32 yScrollDif) { return _to ScrollBy(xScrollDif, yScrollDif); } \
  NS_SCRIPTABLE NS_IMETHOD GetSelection(nsISelection **_retval) { return _to GetSelection(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD ScrollByLines(PRInt32 numLines) { return _to ScrollByLines(numLines); } \
  NS_SCRIPTABLE NS_IMETHOD ScrollByPages(PRInt32 numPages) { return _to ScrollByPages(numPages); } \
  NS_SCRIPTABLE NS_IMETHOD SizeToContent(void) { return _to SizeToContent(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMWINDOW(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetDocument(nsIDOMDocument * *aDocument) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDocument(aDocument); } \
  NS_SCRIPTABLE NS_IMETHOD GetParent(nsIDOMWindow * *aParent) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParent(aParent); } \
  NS_SCRIPTABLE NS_IMETHOD GetTop(nsIDOMWindow * *aTop) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTop(aTop); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrollbars(nsIDOMBarProp * *aScrollbars) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScrollbars(aScrollbars); } \
  NS_IMETHOD GetFrames(nsIDOMWindowCollection * *aFrames) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFrames(aFrames); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_IMETHOD GetTextZoom(float *aTextZoom) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTextZoom(aTextZoom); } \
  NS_IMETHOD SetTextZoom(float aTextZoom) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTextZoom(aTextZoom); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrollX(PRInt32 *aScrollX) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScrollX(aScrollX); } \
  NS_SCRIPTABLE NS_IMETHOD GetScrollY(PRInt32 *aScrollY) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetScrollY(aScrollY); } \
  NS_SCRIPTABLE NS_IMETHOD ScrollTo(PRInt32 xScroll, PRInt32 yScroll) { return !_to ? NS_ERROR_NULL_POINTER : _to->ScrollTo(xScroll, yScroll); } \
  NS_SCRIPTABLE NS_IMETHOD ScrollBy(PRInt32 xScrollDif, PRInt32 yScrollDif) { return !_to ? NS_ERROR_NULL_POINTER : _to->ScrollBy(xScrollDif, yScrollDif); } \
  NS_SCRIPTABLE NS_IMETHOD GetSelection(nsISelection **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetSelection(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD ScrollByLines(PRInt32 numLines) { return !_to ? NS_ERROR_NULL_POINTER : _to->ScrollByLines(numLines); } \
  NS_SCRIPTABLE NS_IMETHOD ScrollByPages(PRInt32 numPages) { return !_to ? NS_ERROR_NULL_POINTER : _to->ScrollByPages(numPages); } \
  NS_SCRIPTABLE NS_IMETHOD SizeToContent(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->SizeToContent(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMWindow : public nsIDOMWindow
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMWINDOW

  nsDOMWindow();

private:
  ~nsDOMWindow();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMWindow, nsIDOMWindow)

nsDOMWindow::nsDOMWindow()
{
  /* member initializers and constructor code */
}

nsDOMWindow::~nsDOMWindow()
{
  /* destructor code */
}

/* readonly attribute nsIDOMDocument document; */
NS_IMETHODIMP nsDOMWindow::GetDocument(nsIDOMDocument * *aDocument)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMWindow parent; */
NS_IMETHODIMP nsDOMWindow::GetParent(nsIDOMWindow * *aParent)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMWindow top; */
NS_IMETHODIMP nsDOMWindow::GetTop(nsIDOMWindow * *aTop)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIDOMBarProp scrollbars; */
NS_IMETHODIMP nsDOMWindow::GetScrollbars(nsIDOMBarProp * *aScrollbars)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] readonly attribute nsIDOMWindowCollection frames; */
NS_IMETHODIMP nsDOMWindow::GetFrames(nsIDOMWindowCollection * *aFrames)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString name; */
NS_IMETHODIMP nsDOMWindow::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMWindow::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] attribute float textZoom; */
NS_IMETHODIMP nsDOMWindow::GetTextZoom(float *aTextZoom)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMWindow::SetTextZoom(float aTextZoom)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long scrollX; */
NS_IMETHODIMP nsDOMWindow::GetScrollX(PRInt32 *aScrollX)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute long scrollY; */
NS_IMETHODIMP nsDOMWindow::GetScrollY(PRInt32 *aScrollY)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void scrollTo (in long xScroll, in long yScroll); */
NS_IMETHODIMP nsDOMWindow::ScrollTo(PRInt32 xScroll, PRInt32 yScroll)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void scrollBy (in long xScrollDif, in long yScrollDif); */
NS_IMETHODIMP nsDOMWindow::ScrollBy(PRInt32 xScrollDif, PRInt32 yScrollDif)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsISelection getSelection (); */
NS_IMETHODIMP nsDOMWindow::GetSelection(nsISelection **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void scrollByLines (in long numLines); */
NS_IMETHODIMP nsDOMWindow::ScrollByLines(PRInt32 numLines)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void scrollByPages (in long numPages); */
NS_IMETHODIMP nsDOMWindow::ScrollByPages(PRInt32 numPages)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void sizeToContent (); */
NS_IMETHODIMP nsDOMWindow::SizeToContent()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMWindow_h__ */
