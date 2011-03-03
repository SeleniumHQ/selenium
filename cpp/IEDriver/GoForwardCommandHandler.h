#ifndef WEBDRIVER_IE_GOFORWARDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GOFORWARDCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GoForwardCommandHandler : public WebDriverCommandHandler {
public:
	GoForwardCommandHandler(void) {
	}

	virtual ~GoForwardCommandHandler(void) {
	}

protected:
	void GoForwardCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		BrowserWrapper *browser_wrapper;
		int status_code = manager->GetCurrentBrowser(&browser_wrapper);
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
