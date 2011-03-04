#ifndef WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class ClickElementCommandHandler : public WebDriverCommandHandler {
public:
	ClickElementCommandHandler(void) {
	}

	virtual ~ClickElementCommandHandler(void) {
	}

protected:
	void ClickElementCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			int status_code = SUCCESS;
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			BrowserWrapper *browser_wrapper;
			status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			std::tr1::shared_ptr<ElementWrapper> element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				status_code = element_wrapper->Click();
				browser_wrapper->set_wait_required(true);
				if (status_code != SUCCESS) {
					response->SetErrorResponse(status_code, "Cannot click on element");
					return;
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}

			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
