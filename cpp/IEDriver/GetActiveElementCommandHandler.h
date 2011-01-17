#ifndef WEBDRIVER_IE_GETACTIVEELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETACTIVEELEMENTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetActiveElementCommandHandler : public WebDriverCommandHandler {
public:
	GetActiveElementCommandHandler(void) 	{
	}

	virtual ~GetActiveElementCommandHandler(void) {
	}

protected:
	void GetActiveElementCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		BrowserWrapper *browser_wrapper;
		int status_code = manager->GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}

		CComPtr<IHTMLDocument2> doc;
		browser_wrapper->GetDocument(&doc);
		if (!doc) {
			response->SetErrorResponse(ENOSUCHDOCUMENT, "Document not found");
			return;
		}

		CComPtr<IHTMLElement> element;
		doc->get_activeElement(&element);

		if (!element) {
			// Grab the body instead
			doc->get_body(&element);
		}

		if (element) {
			IHTMLElement* dom_element;
			element.CopyTo(&dom_element);
			ElementWrapper *element_wrapper;
			manager->AddManagedElement(dom_element, &element_wrapper);
			response->SetResponse(SUCCESS, element_wrapper->ConvertToJson());
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETACTIVEELEMENTCOMMANDHANDLER_H_
