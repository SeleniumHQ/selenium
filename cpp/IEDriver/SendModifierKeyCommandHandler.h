#ifndef WEBDRIVER_IE_SENDMODIFIERKEYCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SENDMODIFIERKEYCOMMANDHANDLER_H_

#include "interactions.h"
#include "BrowserManager.h"

namespace webdriver {

class SendModifierKeyCommandHandler : public WebDriverCommandHandler {
public:
	SendModifierKeyCommandHandler(void) {
	}

	virtual ~SendModifierKeyCommandHandler(void) {
	}

protected:
	void SendModifierKeyCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (command_parameters.find("value") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: value");
			return;
		} else if (command_parameters.find("isdown") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: isdown");
			return;
		} else {
			bool pressKey(command_parameters["isdown"].asBool());
			std::wstring key(CA2W(command_parameters["value"].asCString(), CP_UTF8));
			BrowserWrapper *browser_wrapper;
			manager->GetCurrentBrowser(&browser_wrapper);
			HWND window_handle = browser_wrapper->GetWindowHandle();
			if (pressKey) {
				sendKeyPress(window_handle, key.c_str());
			} else {
				sendKeyRelease(window_handle, key.c_str());
			}

			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SENDMODIFIERKEYCOMMANDHANDLER_H_
