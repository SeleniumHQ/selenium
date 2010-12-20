#ifndef WEBDRIVER_IE_ISELEMENTDISPLAYEDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_ISELEMENTDISPLAYEDCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class IsElementDisplayedCommandHandler : public WebDriverCommandHandler {
public:
	IsElementDisplayedCommandHandler(void) {
	}

	virtual ~IsElementDisplayedCommandHandler(void) {
	}

protected:
	void IsElementDisplayedCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
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

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				bool result;
				status_code = element_wrapper->IsDisplayed(&result);
				if (status_code == SUCCESS) {
					response->SetResponse(SUCCESS, result);
				} else {
					response->SetErrorResponse(status_code, "Error determining if element is displayed");
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

#endif // WEBDRIVER_IE_ISELEMENTDISPLAYEDCOMMANDHANDLER_H_
