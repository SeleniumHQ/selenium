
#include "errorcodes.h"
#include "interactions.h"
#include "logging.h"
#include "native_events.h"
#include "nsIGenericFactory.h"
#include "nsIComponentManager.h"
#include "nsComponentManagerUtils.h"

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
NS_IMETHODIMP nsNativeEvents::SendKeys(nsISupports *aNode, const PRUnichar *value)
{
	AccessibleDocumentWrapper doc(aNode);

	void* windowHandle = doc.getWindowHandle();

	if (!windowHandle) {
		return NS_ERROR_NULL_POINTER;
	}

	sendKeys(windowHandle, value, 0);

	return NS_OK;
}

/* void mouseMove (in nsISupports aNode, in long startX, in long startY, in long endX, in long endY); */
NS_IMETHODIMP nsNativeEvents::MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY)
{
    AccessibleDocumentWrapper doc(aNode);

	void* windowHandle = doc.getWindowHandle();

	if (!windowHandle) {
		return NS_ERROR_NULL_POINTER;
	}

	LRESULT res = mouseMoveTo(windowHandle, 100, startX, startY, endX, endY);
	
	return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}

/* void click (in nsISupports aNode, in long x, in long y); */
NS_IMETHODIMP nsNativeEvents::Click(nsISupports *aNode, PRInt32 x, PRInt32 y)
{
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
