#ifndef WEBDRIVER_IE_SETSPEEDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETSPEEDCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class SetSpeedCommandHandler : public WebDriverCommandHandler {
public:
	SetSpeedCommandHandler(void) {
	}

	virtual ~SetSpeedCommandHandler(void) {
	}

protected:
	void SetSpeedCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, Json::Value>::const_iterator speed_parameter_iterator = command_parameters.find("speed");
		if (speed_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: speed");
			return;
		} else {
			std::string speed = speed_parameter_iterator->second.asString();
			if (strcmp(speed.c_str(), SPEED_SLOW) == 0) {
				manager->set_speed(1000);
			} else if (strcmp(speed.c_str(), SPEED_MEDIUM) == 0) {
				manager->set_speed(500);
			} else {
				manager->set_speed(0);
			}
			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETSPEEDCOMMANDHANDLER_H_
