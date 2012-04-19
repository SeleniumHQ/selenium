#include "build_environment.h"

#ifndef GECKO_19_COMPATIBILITY

#ifndef BUILD_ON_UNIX
#define MOZ_NO_MOZALLOC
#include <mozilla-config.h>
#endif

#include <xpcom-config.h>
#undef HAVE_CPP_CHAR16_T

#else // Gecko 1.9
#ifdef BUILD_ON_UNIX
#include <xpcom-config.h>
#endif
#endif

#include "errorcodes.h"
#include "interactions.h"
#include "logging.h"
#include "native_mouse.h"

#ifndef GECKO_19_COMPATIBILITY
#include "mozilla/ModuleUtils.h"
#else
#include "nsIGenericFactory.h"
#endif

#include "nsIComponentManager.h"
#include "nsComponentManagerUtils.h"
#include <assert.h>

#include "nsISupportsPrimitives.h"

#ifdef BUILD_ON_WINDOWS
#define WD_RESULT LRESULT
#else
#define WD_RESULT int
#endif

NS_IMPL_ISUPPORTS1(nsNativeMouse, nsINativeMouse)

nsNativeMouse::nsNativeMouse()
{
  LOG(DEBUG) << "Native mouse instantiated.";
}

nsNativeMouse::~nsNativeMouse()
{
}

/* void mouseMove (in nsISupports aNode, in long startX, in long startY, in long endX, in long endY); */
NS_IMETHODIMP nsNativeMouse::MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY)
{
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();

  if (!windowHandle) {
    return NS_ERROR_NULL_POINTER;
  }

  WD_RESULT res = mouseMoveTo(windowHandle, 100, startX, startY, endX, endY);

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}

/* void click (in nsISupports aNode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeMouse::Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();
  LOG(DEBUG) << "Have click window handle: " << windowHandle;

  if (!windowHandle) {
    LOG(WARN) << "No window handle!";
    return NS_ERROR_NULL_POINTER;
  }

  LOG(DEBUG) << "Calling clickAt: " << x << ", " << y;
  WD_RESULT res = clickAt(windowHandle, x, y, button);

  LOG(DEBUG) << "Result was: " << (res == SUCCESS ? "ok" : "fail");

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}

/* void doubleClick (in nsISupports aNode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeMouse::DoubleClick(nsISupports *aNode, PRInt32 x, PRInt32 y)
{
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();
  LOG(DEBUG) << "Have doubleClick window handle: " << windowHandle;

  if (!windowHandle) {
    LOG(WARN) << "No window handle!";
    return NS_ERROR_NULL_POINTER;
  }

  LOG(DEBUG) << "Calling doubleClickAt: " << x << ", " << y;
  WD_RESULT res = doubleClickAt(windowHandle, x, y);

  LOG(DEBUG) << "Result was: " << (res == SUCCESS ? "ok" : "fail");

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}

/* void mousePress(in nsISupports aNode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeMouse::MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();
  LOG(DEBUG) << "Have mousePress window handle: " << windowHandle;

  if (!windowHandle) {
    LOG(WARN) << "No window handle!";
    return NS_ERROR_NULL_POINTER;
  }

  LOG(DEBUG) << "Calling mouseDownAt at: " << x << ", " << y << " with button: " << button;
  WD_RESULT res = mouseDownAt(windowHandle, x, y, button);

  LOG(DEBUG) << "Result was: " << (res == SUCCESS ? "ok" : "fail");

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}


/* void mouseRelease(in nsISupports anode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeMouse::MouseRelease(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();
  LOG(DEBUG) << "Have mouseRelease window handle: " << windowHandle;

  if (!windowHandle) {
    LOG(WARN) << "No window handle!";
    return NS_ERROR_NULL_POINTER;
  }

  LOG(DEBUG) << "Calling mouseUpAt: " << x << ", " << y << " with button: " << button;
  WD_RESULT res = mouseUpAt(windowHandle, x, y, button);

  LOG(DEBUG) << "Result was: " << (res == SUCCESS ? "ok" : "fail");

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}
