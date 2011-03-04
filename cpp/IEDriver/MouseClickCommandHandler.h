#ifndef WEBDRIVER_IE_MOUSECLICKCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MOUSECLICKCOMMANDHANDLER_H_

#include "interactions.h"
#include "BrowserManager.h"

namespace webdriver {

class MouseClickCommandHandler : public WebDriverCommandHandler {
public:
	MouseClickCommandHandler(void) {
	}

	virtual ~MouseClickCommandHandler(void) {
	}

protected:
	void MouseClickCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, Json::Value>::const_iterator button_parameter_iterator = command_parameters.find("button");
		if (button_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: button");
			return;
		} else {
			int button(button_parameter_iterator->second.asInt());
			std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get current browser");
			}

			HWND browser_window_handle = browser_wrapper->GetWindowHandle();
			clickAt(browser_window_handle, manager->last_known_mouse_x(), manager->last_known_mouse_y(), button);
			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_MOUSECLICKCOMMANDHANDLER_H_
