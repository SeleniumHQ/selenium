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
	void NewSessionCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		Session& mutable_session = const_cast<Session&>(session);
		int result_code = mutable_session.CreateNewBrowser();
		if (result_code != SUCCESS) {
			// The browser was not created successfully, therefore the
			// session must be marked as invalid so the server can
			// properly shut it down.
			Session& mutable_session = const_cast<Session&>(session);
			mutable_session.set_is_valid(false);
			response->SetErrorResponse(result_code, "Unexpected error launching Internet Explorer. Protected Mode must be set to the same value (enabled or disabled) for all zones.");
			return;
		}
		std::string id = CW2A(session.session_id().c_str(), CP_UTF8);
		response->SetResponse(303, "/session/" + id);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
