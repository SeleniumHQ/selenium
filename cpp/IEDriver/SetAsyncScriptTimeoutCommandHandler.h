#ifndef WEBDRIVER_IE_SETASYNCSCRIPTTIMEOUTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETASYNCSCRIPTTIMEOUTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class SetAsyncScriptTimeoutCommandHandler : public WebDriverCommandHandler {
public:
	SetAsyncScriptTimeoutCommandHandler(void) {
	}

	virtual ~SetAsyncScriptTimeoutCommandHandler(void) {
	}

protected:
	void SetAsyncScriptTimeoutCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (command_parameters.find("ms") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: ms");
			return;
		} else {
			int timeout = command_parameters["ms"].asInt();
			manager->set_async_script_timeout(timeout);
			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETASYNCSCRIPTIMEOUTCOMMANDHANDLER_H_
