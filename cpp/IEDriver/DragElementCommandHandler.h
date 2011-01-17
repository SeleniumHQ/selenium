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
	void DragElementCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (locator_parameters.find("id") == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (command_parameters.find("x") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: x");
			return;
		} else if (command_parameters.find("y") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: y");
			return;
		} else {
			std::wstring element_id(CA2W(locator_parameters["id"].c_str(), CP_UTF8));

			int x = command_parameters["x"].asInt();
			int y = command_parameters["y"].asInt();

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
