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
#include "native_keyboard.h"

#ifndef GECKO_19_COMPATIBILITY
#include "mozilla/ModuleUtils.h"
#else
#include "nsIGenericFactory.h"
#endif

#include "nsIComponentManager.h"
#include "nsComponentManagerUtils.h"
#include <assert.h>

#include <nsStringAPI.h>
#include "nsISupportsPrimitives.h"

#ifdef BUILD_ON_WINDOWS
#define WD_RESULT LRESULT
#else
#define WD_RESULT int
#endif

NS_IMPL_ISUPPORTS1(nsNativeKeyboard, nsINativeKeyboard)

nsNativeKeyboard::nsNativeKeyboard()
{
  LOG(DEBUG) << "Native keyboard instantiated.";
}

nsNativeKeyboard::~nsNativeKeyboard()
{
}

/* void SendKeys (in nsISupports aNode, in wstring value); */
NS_IMETHODIMP nsNativeKeyboard::SendKeys(nsISupports *aNode,
    const PRUnichar *value,
    PRBool releaseModifiers)
{
  LOG(DEBUG) << "---------- Got to start of callback. aNode: " << aNode
    << " ----------";
  NS_LossyConvertUTF16toASCII ascii_keys(value);
  LOG(DEBUG) << "Ascii keys: " << ascii_keys.get();
  LOG(DEBUG) << "Ascii string length: " << strlen(ascii_keys.get());
  int i = 0;
  while (value[i] != '\0') {
    LOG(DEBUG) << value[i] << " ";
    i++;
  }

  AccessibleDocumentWrapper doc(aNode);

  WINDOW_HANDLE windowHandle = doc.getWindowHandle();

  if (!windowHandle) {
    LOG(WARN) << "Sorry, window handle is null.";
    return NS_ERROR_NULL_POINTER;
  }

  // Note that it's OK to send wchar_t even though wchar_t is *usually*
  // 32 bit, because this code (and any code that links with it) *MUST*
  // be compiled with -fshort-wchar, so it's actually 16 bit and,
  // incidentally, just like PRUnichar. This, of course, breaks any
  // library function that uses wchar_t.
#ifdef BUILD_ON_UNIX
  assert(sizeof(PRUnichar) == sizeof(wchar_t));
  const wchar_t* valuePtr = (const wchar_t*) value;
#else
  const PRUnichar* valuePtr = value;
#endif
  sendKeys(windowHandle, valuePtr, 0);

  if (releaseModifiers) {
    LOG(DEBUG) << "Also releasing modifiers.";
    releaseModifierKeys(windowHandle, 0);
  }

  LOG(DEBUG) << "Sent keys sucessfully.";

  return NS_OK;
}

