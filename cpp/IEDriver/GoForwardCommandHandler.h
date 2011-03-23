#ifndef WEBDRIVER_IE_GOFORWARDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GOFORWARDCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GoForwardCommandHandler : public WebDriverCommandHandler {
public:
	GoForwardCommandHandler(void) {
	}

	virtual ~GoForwardCommandHandler(void) {
	}

protected:
	void GoForwardCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		BrowserHandle browser_wrapper;
		int status_code = session.GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}
		HRESULT hr = browser_wrapper->browser()->GoForward();
		browser_wrapper->set_wait_required(true);
		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GOFORWARDCOMMANDHANDLER_H_
