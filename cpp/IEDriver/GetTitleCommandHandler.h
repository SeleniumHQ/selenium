#ifndef WEBDRIVER_IE_GETTITLECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETTITLECOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GetTitleCommandHandler : public WebDriverCommandHandler {
public:
	GetTitleCommandHandler(void) {
	}

	virtual ~GetTitleCommandHandler(void) {
	}

protected:
	void GetTitleCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		BrowserHandle browser_wrapper;
		int status_code = session.GetCurrentBrowser(&browser_wrapper);
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
