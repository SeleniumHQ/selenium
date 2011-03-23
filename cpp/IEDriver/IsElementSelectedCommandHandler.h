#ifndef WEBDRIVER_IE_ISELEMENTSELECTEDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_ISELEMENTSELECTEDCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class IsElementSelectedCommandHandler : public WebDriverCommandHandler {
public:
	IsElementSelectedCommandHandler(void) {
	}

	virtual ~IsElementSelectedCommandHandler(void) {
	}

protected:
	void IsElementSelectedCommandHandler::ExecuteInternal(Session* session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			BrowserHandle browser_wrapper;
			int status_code = session->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementHandle element_wrapper;
			status_code = this->GetElement(session, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				bool is_selected = element_wrapper->IsSelected();
				response->SetResponse(SUCCESS, is_selected);
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ISELEMENTSELECTEDCOMMANDHANDLER_H_
