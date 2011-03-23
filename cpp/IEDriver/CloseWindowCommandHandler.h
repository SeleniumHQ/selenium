#ifndef WEBDRIVER_IE_CLOSEWINDOWCOMMANDHANDLER_H_
#define WEBDRIVER_IE_CLOSEWINDOWCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class CloseWindowCommandHandler : public WebDriverCommandHandler {
public:
	CloseWindowCommandHandler(void) {
	}

	virtual ~CloseWindowCommandHandler(void) {
	}

protected:
	void CloseWindowCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		// TODO: Check HRESULT values for errors.
		BrowserHandle browser_wrapper;
		int status_code = session.GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}
		HRESULT hr = browser_wrapper->browser()->Quit();
		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLOSEWINDOWCOMMANDHANDLER_H_
