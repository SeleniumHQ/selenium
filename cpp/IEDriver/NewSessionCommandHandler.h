#ifndef WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
#define WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class NewSessionCommandHandler : public WebDriverCommandHandler {
public:
	NewSessionCommandHandler(void) {
	}

	virtual ~NewSessionCommandHandler(void) {
	}

protected:
	void NewSessionCommandHandler::ExecuteInternal(Session* session, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		session->CreateNewBrowser();
		std::string id = CW2A(session->session_id().c_str(), CP_UTF8);
		response->SetResponse(303, "/session/" + id);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
