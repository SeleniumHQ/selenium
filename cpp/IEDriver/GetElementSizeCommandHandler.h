#ifndef WEBDRIVER_IE_GETELEMENTSIZECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTSIZECOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetElementSizeCommandHandler : public WebDriverCommandHandler {
public:
	GetElementSizeCommandHandler(void) {
	}

	virtual ~GetElementSizeCommandHandler(void) {
	}

protected:
	void GetElementSizeCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (locator_parameters.find("id") == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(locator_parameters["id"].c_str(), CP_UTF8));

			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}
			//HWND hwnd = browser_wrapper->GetWindowHandle();

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				bool displayed;
				status_code = element_wrapper->IsDisplayed(&displayed);
				if (status_code == SUCCESS) {
					long height, width;
					element_wrapper->element()->get_offsetHeight(&height);
					element_wrapper->element()->get_offsetWidth(&width);
					Json::Value response_value;
					response_value["width"] = width;
					response_value["height"] = height;
					response->SetResponse(SUCCESS, response_value);
					return;
				} else {
					response->SetErrorResponse(status_code, "Element is not displayed.");
					return;
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTSIZECOMMANDHANDLER_H_
