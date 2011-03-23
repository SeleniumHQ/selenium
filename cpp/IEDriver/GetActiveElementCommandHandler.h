#ifndef WEBDRIVER_IE_GETACTIVEELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETACTIVEELEMENTCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GetActiveElementCommandHandler : public WebDriverCommandHandler {
public:
	GetActiveElementCommandHandler(void) 	{
	}

	virtual ~GetActiveElementCommandHandler(void) {
	}

protected:
	void GetActiveElementCommandHandler::ExecuteInternal(Session* session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		BrowserHandle browser_wrapper;
		int status_code = session->GetCurrentBrowser(&browser_wrapper);
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
			ElementHandle element_wrapper;
			session->AddManagedElement(dom_element, &element_wrapper);
			response->SetResponse(SUCCESS, element_wrapper->ConvertToJson());
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETACTIVEELEMENTCOMMANDHANDLER_H_
