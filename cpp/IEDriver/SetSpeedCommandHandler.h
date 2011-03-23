#ifndef WEBDRIVER_IE_SETSPEEDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETSPEEDCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class SetSpeedCommandHandler : public WebDriverCommandHandler {
public:
	SetSpeedCommandHandler(void) {
	}

	virtual ~SetSpeedCommandHandler(void) {
	}

protected:
	void SetSpeedCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		ParametersMap::const_iterator speed_parameter_iterator = command_parameters.find("speed");
		if (speed_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: speed");
			return;
		} else {
			std::string speed = speed_parameter_iterator->second.asString();
			Session& mutable_session = const_cast<Session&>(session);
			if (strcmp(speed.c_str(), SPEED_SLOW) == 0) {
				mutable_session.set_speed(1000);
			} else if (strcmp(speed.c_str(), SPEED_MEDIUM) == 0) {
				mutable_session.set_speed(500);
			} else {
				mutable_session.set_speed(0);
			}
			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETSPEEDCOMMANDHANDLER_H_
