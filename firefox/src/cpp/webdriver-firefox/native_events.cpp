#ifdef __GNUC__
#include <xpcom-config.h>
#endif
#include "errorcodes.h"
#include "interactions.h"
#include "logging.h"
#include "native_events.h"
#include "nsIGenericFactory.h"
#include "nsIComponentManager.h"
#include "nsComponentManagerUtils.h"
#include <assert.h>

// For Debugging purpose
#include <nsStringAPI.h>

NS_IMPL_ISUPPORTS1(nsNativeEvents, nsINativeEvents)

nsNativeEvents::nsNativeEvents()
{
  LOG::Level("WARN");
  LOG(DEBUG) << "Starting up";
}

nsNativeEvents::~nsNativeEvents()
{
}

/* void SendKeys (in nsISupports aNode, in wstring value); */
NS_IMETHODIMP nsNativeEvents::SendKeys(nsISupports *aNode,
                                       const PRUnichar *value)
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
#ifdef __GNUC__
        assert(sizeof(PRUnichar) == sizeof(wchar_t));
        const wchar_t* valuePtr = (const wchar_t*) value;
#else
        const PRUnichar* valuePtr = value;
#endif
        sendKeys(windowHandle, valuePtr, 0);

        LOG(DEBUG) << "Sent keys sucessfully.";

        return NS_OK;
}

/* void mouseMove (in nsISupports aNode, in long startX, in long startY, in long endX, in long endY); */
NS_IMETHODIMP nsNativeEvents::MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY)
{
#ifdef __GNUC__
  return NS_ERROR_NOT_IMPLEMENTED;
#else
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();

  if (!windowHandle) {
    return NS_ERROR_NULL_POINTER;
  }

  LRESULT res = mouseMoveTo(windowHandle, 100, startX, startY, endX, endY);

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
#endif
}

/* void click (in nsISupports aNode, in long x, in long y); */
NS_IMETHODIMP nsNativeEvents::Click(nsISupports *aNode, PRInt32 x, PRInt32 y)
{
#ifdef __GNUC__
  return NS_ERROR_NOT_IMPLEMENTED;
#else
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();
  LOG(DEBUG) << "Have click window handle: " << windowHandle;

  if (!windowHandle) {
    LOG(WARN) << "No window handle!";
    return NS_ERROR_NULL_POINTER;
  }

  LOG(DEBUG) << "Calling clickAt: " << x << ", " << y;
  LRESULT res = clickAt(windowHandle, x, y);

  LOG(DEBUG) << "Result was: " << (res == SUCCESS ? "ok" : "fail");

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
#endif
}

/* void hasUnhandledEvents (in nsISupports aNode, out boolean hasEvents); */
NS_IMETHODIMP nsNativeEvents::HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents)
{
  *hasEvents = pending_keyboard_events();
  return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(nsNativeEvents)

static nsModuleComponentInfo components[] =
{
    {
       EVENTS_CLASSNAME, 
       EVENTS_CID,
       EVENTS_CONTRACTID,
       nsNativeEventsConstructor,
    }
};

NS_IMPL_NSGETMODULE("NativeEventsModule", components) 
