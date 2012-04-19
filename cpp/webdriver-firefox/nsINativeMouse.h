/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM cpp/webdriver-firefox/nsINativeMouse.idl
 */

#ifndef __gen_nsINativeMouse_h__
#define __gen_nsINativeMouse_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsISupportsPrimitives_h__
#include "nsISupportsPrimitives.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsINativeMouse */
#define NS_INATIVEMOUSE_IID_STR "eb9123fc-0fdc-4164-bff5-03b3243931d1"

#define NS_INATIVEMOUSE_IID \
  {0xeb9123fc, 0x0fdc, 0x4164, \
    { 0xbf, 0xf5, 0x03, 0xb3, 0x24, 0x39, 0x31, 0xd1 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsINativeMouse : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_INATIVEMOUSE_IID)

  /* void mouseMove (in nsISupports aNode, in long startX, in long startY, in long endX, in long endY); */
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY) = 0;

  /* void click (in nsISupports aNode, in long x, in long y, in long button); */
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) = 0;

  /* void mousePress (in nsISupports aNode, in long x, in long y, in long button); */
  NS_SCRIPTABLE NS_IMETHOD MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) = 0;

  /* void mouseRelease (in nsISupports anode, in long x, in long y, in long button); */
  NS_SCRIPTABLE NS_IMETHOD MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button) = 0;

  /* void doubleClick (in nsISupports aNode, in long x, in long y); */
  NS_SCRIPTABLE NS_IMETHOD DoubleClick(nsISupports *aNode, PRInt32 x, PRInt32 y) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsINativeMouse, NS_INATIVEMOUSE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSINATIVEMOUSE \
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY); \
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button); \
  NS_SCRIPTABLE NS_IMETHOD MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button); \
  NS_SCRIPTABLE NS_IMETHOD MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button); \
  NS_SCRIPTABLE NS_IMETHOD DoubleClick(nsISupports *aNode, PRInt32 x, PRInt32 y); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSINATIVEMOUSE(_to) \
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY) { return _to MouseMove(aNode, startX, startY, endX, endY); } \
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) { return _to Click(aNode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) { return _to MousePress(aNode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button) { return _to MouseRelease(anode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD DoubleClick(nsISupports *aNode, PRInt32 x, PRInt32 y) { return _to DoubleClick(aNode, x, y); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSINATIVEMOUSE(_to) \
  NS_SCRIPTABLE NS_IMETHOD MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY) { return !_to ? NS_ERROR_NULL_POINTER : _to->MouseMove(aNode, startX, startY, endX, endY); } \
  NS_SCRIPTABLE NS_IMETHOD Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) { return !_to ? NS_ERROR_NULL_POINTER : _to->Click(aNode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button) { return !_to ? NS_ERROR_NULL_POINTER : _to->MousePress(aNode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button) { return !_to ? NS_ERROR_NULL_POINTER : _to->MouseRelease(anode, x, y, button); } \
  NS_SCRIPTABLE NS_IMETHOD DoubleClick(nsISupports *aNode, PRInt32 x, PRInt32 y) { return !_to ? NS_ERROR_NULL_POINTER : _to->DoubleClick(aNode, x, y); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsNativeMouse : public nsINativeMouse
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSINATIVEMOUSE

  nsNativeMouse();

private:
  ~nsNativeMouse();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsNativeMouse, nsINativeMouse)

nsNativeMouse::nsNativeMouse()
{
  /* member initializers and constructor code */
}

nsNativeMouse::~nsNativeMouse()
{
  /* destructor code */
}

/* void mouseMove (in nsISupports aNode, in long startX, in long startY, in long endX, in long endY); */
NS_IMETHODIMP nsNativeMouse::MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void click (in nsISupports aNode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeMouse::Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void mousePress (in nsISupports aNode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeMouse::MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void mouseRelease (in nsISupports anode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeMouse::MouseRelease(nsISupports *anode, PRInt32 x, PRInt32 y, PRInt32 button)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void doubleClick (in nsISupports aNode, in long x, in long y); */
NS_IMETHODIMP nsNativeMouse::DoubleClick(nsISupports *aNode, PRInt32 x, PRInt32 y)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsINativeMouse_h__ */
