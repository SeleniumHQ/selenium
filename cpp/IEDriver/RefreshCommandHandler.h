#ifndef WEBDRIVER_IE_REFRESHCOMMANDHANDLER_H_
#define WEBDRIVER_IE_REFRESHCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class RefreshCommandHandler : public WebDriverCommandHandler {
public:
	RefreshCommandHandler(void) {
	}

	virtual ~RefreshCommandHandler(void) {
	}

protected:
	void RefreshCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		BrowserWrapper *browser_wrapper;
		int status_code = manager->GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}
		HRESULT hr = browser_wrapper->browser()->Refresh();
		browser_wrapper->set_wait_required(true);
		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_REFRESHCOMMANDHANDLER_H_
