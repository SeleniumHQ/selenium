#ifndef WEBDRIVER_IE_GETCURRENTWINDOWHANDLECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETCURRENTWINDOWHANDLECOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetCurrentWindowHandleCommandHandler : public WebDriverCommandHandler {
public:
	GetCurrentWindowHandleCommandHandler(void) {
	}

	virtual ~GetCurrentWindowHandleCommandHandler(void) {
	}

protected:
	void ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::string current_handle(CW2A(manager->current_browser_id().c_str(), CP_UTF8));
		response->SetResponse(SUCCESS, current_handle);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETCURRENTWINDOWHANDLECOMMANDHANDLER_H_
