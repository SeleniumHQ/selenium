#ifndef WEBDRIVER_IE_SETIMPLICITWAITTIMEOUTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETIMPLICITWAITTIMEOUTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class SetImplicitWaitTimeoutCommandHandler : public WebDriverCommandHandler {
public:
	SetImplicitWaitTimeoutCommandHandler(void) {
	}

	virtual ~SetImplicitWaitTimeoutCommandHandler(void) {
	}

protected:
	void SetImplicitWaitTimeoutCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (command_parameters.find("ms") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: ms");
			return;
		} else {
			int timeout = command_parameters["ms"].asInt();
			manager->set_implicit_wait_timeout(timeout);
			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETIMPLICITWAITTIMEOUTCOMMANDHANDLER_H_
