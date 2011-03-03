#ifndef WEBDRIVER_IE_DRAGELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_DRAGELEMENTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class DragElementCommandHandler : public WebDriverCommandHandler {
public:
	DragElementCommandHandler(void) {
	}

	virtual ~DragElementCommandHandler(void) {
	}

protected:
	void DragElementCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		std::map<std::string, Json::Value>::const_iterator x_parameter_iterator = command_parameters.find("x");
		std::map<std::string, Json::Value>::const_iterator y_parameter_iterator = command_parameters.find("y");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (x_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: x");
			return;
		} else if (y_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: y");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			int x = x_parameter_iterator->second.asInt();
			int y = y_parameter_iterator->second.asInt();

			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				status_code = element_wrapper->DragBy(x, y, manager->speed());
				if (status_code == SUCCESS) {
					response->SetResponse(SUCCESS, Json::Value::null);
					return;
				} else {
					response->SetErrorResponse(status_code, "Drag element failed.");
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

#endif // WEBDRIVER_IE_DRAGELEMENTCOMMANDHANDLER_H_
