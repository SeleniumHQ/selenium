#ifndef WEBDRIVER_IE_SENDMODIFIERKEYCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SENDMODIFIERKEYCOMMANDHANDLER_H_

#include "interactions.h"
#include "Session.h"

namespace webdriver {

class SendModifierKeyCommandHandler : public WebDriverCommandHandler {
public:
	SendModifierKeyCommandHandler(void) {
	}

	virtual ~SendModifierKeyCommandHandler(void) {
	}

protected:
	void SendModifierKeyCommandHandler::ExecuteInternal(Session* session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		ParametersMap::const_iterator value_parameter_iterator = command_parameters.find("value");
		ParametersMap::const_iterator is_down_parameter_iterator = command_parameters.find("isdown");
		if (value_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: value");
			return;
		} else if (command_parameters.find("isdown") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: isdown");
			return;
		} else {
			bool press_key(is_down_parameter_iterator->second.asBool());
			std::wstring key(CA2W(value_parameter_iterator->second.asCString(), CP_UTF8));
			BrowserHandle browser_wrapper;
			session->GetCurrentBrowser(&browser_wrapper);
			HWND window_handle = browser_wrapper->GetWindowHandle();
			if (press_key) {
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
