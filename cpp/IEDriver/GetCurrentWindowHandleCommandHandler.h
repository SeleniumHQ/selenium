#ifndef WEBDRIVER_IE_GETCURRENTWINDOWHANDLECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETCURRENTWINDOWHANDLECOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GetCurrentWindowHandleCommandHandler : public WebDriverCommandHandler {
public:
	GetCurrentWindowHandleCommandHandler(void) {
	}

	virtual ~GetCurrentWindowHandleCommandHandler(void) {
	}

protected:
	void ExecuteInternal(Session* session, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::string current_handle(CW2A(session->current_browser_id().c_str(), CP_UTF8));
		response->SetResponse(SUCCESS, current_handle);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETCURRENTWINDOWHANDLECOMMANDHANDLER_H_
