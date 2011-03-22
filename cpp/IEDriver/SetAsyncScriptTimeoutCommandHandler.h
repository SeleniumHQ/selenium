#ifndef WEBDRIVER_IE_SETASYNCSCRIPTTIMEOUTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETASYNCSCRIPTTIMEOUTCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class SetAsyncScriptTimeoutCommandHandler : public WebDriverCommandHandler {
public:
	SetAsyncScriptTimeoutCommandHandler(void) {
	}

	virtual ~SetAsyncScriptTimeoutCommandHandler(void) {
	}

protected:
	void SetAsyncScriptTimeoutCommandHandler::ExecuteInternal(Session* session, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, Json::Value>::const_iterator ms_parameter_iterator = command_parameters.find("ms");
		if (ms_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: ms");
			return;
		} else {
			int timeout = ms_parameter_iterator->second.asInt();
			session->set_async_script_timeout(timeout);
			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETASYNCSCRIPTIMEOUTCOMMANDHANDLER_H_
