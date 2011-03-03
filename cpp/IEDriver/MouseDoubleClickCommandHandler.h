#ifndef WEBDRIVER_IE_MOUSEDOUBLECLICKCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MOUSEDOUBLECLICKCOMMANDHANDLER_H_

#include "interactions.h"
#include "BrowserManager.h"

namespace webdriver {

class MouseDoubleClickCommandHandler : public WebDriverCommandHandler {
public:
	MouseDoubleClickCommandHandler(void) {
	}

	virtual ~MouseDoubleClickCommandHandler(void) {
	}

protected:
	void MouseDoubleClickCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		BrowserWrapper *browser_wrapper;
		int status_code = manager->GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get current browser");
		}

		HWND browser_window_handle = browser_wrapper->GetWindowHandle();

		// This will never work. There needs to be a doubleClickAt function added 
		// to the webdriver-interactions module.
		clickAt(browser_window_handle, manager->last_known_mouse_x(), manager->last_known_mouse_y(), MOUSEBUTTON_LEFT);
		clickAt(browser_window_handle, manager->last_known_mouse_x(), manager->last_known_mouse_y(), MOUSEBUTTON_LEFT);
		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_MOUSEDOUBLECLICKCOMMANDHANDLER_H_
