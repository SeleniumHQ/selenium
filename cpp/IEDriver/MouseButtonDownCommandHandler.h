#ifndef WEBDRIVER_IE_MOUSEBUTTONDOWNCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MOUSEBUTTONDOWNCOMMANDHANDLER_H_

#include "interactions.h"
#include "Session.h"

namespace webdriver {

class MouseButtonDownCommandHandler : public WebDriverCommandHandler {
public:
	MouseButtonDownCommandHandler(void) {
	}

	virtual ~MouseButtonDownCommandHandler(void) {
	}

protected:
	void MouseButtonDownCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		BrowserHandle browser_wrapper;
		int status_code = session.GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get current browser");
		}

		HWND browser_window_handle = browser_wrapper->GetWindowHandle();
		mouseDownAt(browser_window_handle, session.last_known_mouse_x(), session.last_known_mouse_y(), MOUSEBUTTON_LEFT);
		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_MOUSEBUTTONDOWNCOMMANDHANDLER_H_
