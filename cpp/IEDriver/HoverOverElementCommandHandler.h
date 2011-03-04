#ifndef WEBDRIVER_IE_HOVEROVERELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_HOVEROVERELEMENTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class HoverOverElementCommandHandler : public WebDriverCommandHandler {
public:
	HoverOverElementCommandHandler(void) {
	}

	virtual ~HoverOverElementCommandHandler(void) {
	}

protected:
	void HoverOverElementCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			std::tr1::shared_ptr<ElementWrapper> element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				status_code = element_wrapper->Hover();
				if (status_code != SUCCESS) {
					response->SetErrorResponse(status_code, "Unable to hover over element");
					return;
				} else {
					response->SetResponse(SUCCESS, Json::Value::null);
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

#endif // WEBDRIVER_IE_HOVEROVERELEMENTCOMMANDHANDLER_H_
