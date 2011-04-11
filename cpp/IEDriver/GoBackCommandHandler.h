#ifndef WEBDRIVER_IE_GOBACKCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GOBACKCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GoBackCommandHandler : public WebDriverCommandHandler {
public:
	GoBackCommandHandler(void) {
	}

	virtual ~GoBackCommandHandler(void) {
	}

protected:
	void GoBackCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		BrowserHandle browser_wrapper;
		int status_code = session.GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}
		status_code = browser_wrapper->NavigateBack();
		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GOBACKCOMMANDHANDLER_H_
