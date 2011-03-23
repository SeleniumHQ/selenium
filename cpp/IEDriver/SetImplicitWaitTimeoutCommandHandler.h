#ifndef WEBDRIVER_IE_SETIMPLICITWAITTIMEOUTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETIMPLICITWAITTIMEOUTCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class SetImplicitWaitTimeoutCommandHandler : public WebDriverCommandHandler {
public:
	SetImplicitWaitTimeoutCommandHandler(void) {
	}

	virtual ~SetImplicitWaitTimeoutCommandHandler(void) {
	}

protected:
	void SetImplicitWaitTimeoutCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		ParametersMap::const_iterator ms_parameter_iterator = command_parameters.find("ms");
		if (ms_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: ms");
			return;
		} else {
			int timeout = ms_parameter_iterator->second.asInt();
			Session& mutable_session = const_cast<Session&>(session);
			mutable_session.set_implicit_wait_timeout(timeout);
			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETIMPLICITWAITTIMEOUTCOMMANDHANDLER_H_
