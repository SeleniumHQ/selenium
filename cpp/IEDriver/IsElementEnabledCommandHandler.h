#ifndef WEBDRIVER_IE_ISELEMENTENABLEDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_ISELEMENTENABLEDCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class IsElementEnabledCommandHandler : public WebDriverCommandHandler {
public:
	IsElementEnabledCommandHandler(void) {
	}

	virtual ~IsElementEnabledCommandHandler(void) {
	}

protected:
	void IsElementEnabledCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			BrowserHandle browser_wrapper;
			int status_code = session.GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementHandle element_wrapper;
			status_code = this->GetElement(session, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				response->SetResponse(SUCCESS, element_wrapper->IsEnabled());
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ISELEMENTENABLEDCOMMANDHANDLER_H_
