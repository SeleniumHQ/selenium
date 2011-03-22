#ifndef WEBDRIVER_IE_MOUSEDOUBLECLICKCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MOUSEDOUBLECLICKCOMMANDHANDLER_H_

#include "interactions.h"
#include "Session.h"

namespace webdriver {

class MouseDoubleClickCommandHandler : public WebDriverCommandHandler {
public:
	MouseDoubleClickCommandHandler(void) {
	}

	virtual ~MouseDoubleClickCommandHandler(void) {
	}

protected:
	void MouseDoubleClickCommandHandler::ExecuteInternal(Session* session, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
		int status_code = session->GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get current browser");
		}

		HWND browser_window_handle = browser_wrapper->GetWindowHandle();

		// This will never work. There needs to be a doubleClickAt function added 
		// to the webdriver-interactions module.
		clickAt(browser_window_handle, session->last_known_mouse_x(), session->last_known_mouse_y(), MOUSEBUTTON_LEFT);
		clickAt(browser_window_handle, session->last_known_mouse_x(), session->last_known_mouse_y(), MOUSEBUTTON_LEFT);
		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_MOUSEDOUBLECLICKCOMMANDHANDLER_H_
