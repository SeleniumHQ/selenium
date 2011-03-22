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
	void GoForwardCommandHandler::ExecuteInternal(Session* session, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
		int status_code = session->GetCurrentBrowser(&browser_wrapper);
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
