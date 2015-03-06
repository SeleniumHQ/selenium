#pragma once

#include "nsCOMPtr.h"
#include "gecko18/nsIAccessibleDocument.h"
#ifdef GECKO_19_COMPATIBILITY
#include "gecko19/nsIAccessibleDocument.h"
#endif
#include "nsIAccessibleDocument.h"

class AccessibleDocumentWrapper 
{
public:
	AccessibleDocumentWrapper(nsISupports *node) 
	{
		wrapper_18 = do_QueryInterface(node);
#ifdef GECKO_19_COMPATIBILITY
		wrapper_19 = do_QueryInterface(node);
#endif
		wrapper_2 = do_QueryInterface(node);
	}

	void* getWindowHandle() 
	{
		if (!isValid()) return NULL;

		void *handle = NULL;
		nsresult rv;
		
		if (wrapper_2) {
			rv = wrapper_2->GetWindowHandle(&handle);
			if(NS_SUCCEEDED(rv)){ return handle; }
		}

#ifdef GECKO_19_COMPATIBILITY
		if (wrapper_19) {
			rv = wrapper_19->GetWindowHandle(&handle);
			if(NS_SUCCEEDED(rv)){ return handle; }
		}
#endif

		if (wrapper_18) {
			rv = wrapper_18->GetWindowHandle(&handle);
			if(NS_SUCCEEDED(rv)){ return handle; }
		}

		return NULL;
	}

private:
	bool isValid() const 
	{
		return (wrapper_18 != NULL) ||
#ifdef GECKO_19_COMPATIBILITY
                    (wrapper_19 != NULL) ||
#endif
                    (wrapper_2 != NULL);
	}

	nsCOMPtr<nsIAccessibleDocument_18> wrapper_18;
#ifdef GECKO_19_COMPATIBILITY
	nsCOMPtr<nsIAccessibleDocument_19> wrapper_19;
#endif
	nsCOMPtr<nsIAccessibleDocument> wrapper_2;
};
