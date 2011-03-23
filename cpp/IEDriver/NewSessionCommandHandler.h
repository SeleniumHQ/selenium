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
	void NewSessionCommandHandler::ExecuteInternal(Session* session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		session->CreateNewBrowser();
		std::string id = CW2A(session->session_id().c_str(), CP_UTF8);
		response->SetResponse(303, "/session/" + id);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
