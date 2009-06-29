
#include "interactions.h"
#include "native_events.h"
#include "nsIGenericFactory.h"
#include "nsIComponentManager.h"
#include "nsComponentManagerUtils.h"

NS_IMPL_ISUPPORTS1(nsNativeEvents, nsINativeEvents)

nsNativeEvents::nsNativeEvents()
{
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