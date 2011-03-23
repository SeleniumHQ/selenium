#ifndef WEBDRIVER_IE_MOUSECLICKCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MOUSECLICKCOMMANDHANDLER_H_

#include "interactions.h"
#include "Session.h"

namespace webdriver {

class MouseClickCommandHandler : public WebDriverCommandHandler {
public:
	MouseClickCommandHandler(void) {
	}

	virtual ~MouseClickCommandHandler(void) {
	}

protected:
	void MouseClickCommandHandler::ExecuteInternal(Session* session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		ParametersMap::const_iterator button_parameter_iterator = command_parameters.find("button");
		if (button_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: button");
			return;
		} else {
			int button(button_parameter_iterator->second.asInt());
			BrowserHandle browser_wrapper;
			int status_code = session->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get current browser");
			}

			HWND browser_window_handle = browser_wrapper->GetWindowHandle();
			clickAt(browser_window_handle, session->last_known_mouse_x(), session->last_known_mouse_y(), button);
			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_MOUSECLICKCOMMANDHANDLER_H_
