#ifndef WEBDRIVER_IE_GETTITLECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETTITLECOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetTitleCommandHandler : public WebDriverCommandHandler {
public:
	GetTitleCommandHandler(void) {
	}

	virtual ~GetTitleCommandHandler(void) {
	}

protected:
	void GetTitleCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		BrowserWrapper *browser_wrapper;
		int status_code = manager->GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}
		std::string title(CW2A(browser_wrapper->GetTitle().c_str(), CP_UTF8));

		response->SetResponse(SUCCESS, title);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETTITLECOMMANDHANDLER_H_
