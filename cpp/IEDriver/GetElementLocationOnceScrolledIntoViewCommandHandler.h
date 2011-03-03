#pragma once
#include "BrowserManager.h"

namespace webdriver {

class GetElementLocationOnceScrolledIntoViewCommandHandler : public WebDriverCommandHandler {
public:
	GetElementLocationOnceScrolledIntoViewCommandHandler(void) {
	}

	virtual ~GetElementLocationOnceScrolledIntoViewCommandHandler(void) {
	}

protected:
	void GetElementLocationOnceScrolledIntoViewCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				long x, y, width, height;
				status_code = element_wrapper->GetLocationOnceScrolledIntoView(&x, &y, &width, &height);
				if (status_code == SUCCESS) {
					Json::Value response_value;
					response_value["x"] = x;
					response_value["y"] = y;
					response->SetResponse(SUCCESS, response_value);
					return;
				} else {
					response->SetErrorResponse(status_code, "Unable to get element location.");
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