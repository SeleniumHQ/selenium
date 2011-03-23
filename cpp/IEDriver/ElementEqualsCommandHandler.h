#ifndef WEBDRIVER_IE_ELEMENTEQUALSCOMMANDHANDLER_H_
#define WEBDRIVER_IE_ELEMENTEQUALSCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class ElementEqualsCommandHandler : public WebDriverCommandHandler {
public:
	ElementEqualsCommandHandler(void) {
	}

	virtual ~ElementEqualsCommandHandler(void) {
	}

protected:
	void ElementEqualsCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		LocatorMap::const_iterator other_parameter_iterator = locator_parameters.find("other");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		}
		else if (other_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: other");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));
			std::wstring other_element_id(CA2W(other_parameter_iterator->second.c_str(), CP_UTF8));

			BrowserHandle browser_wrapper;
			int status_code = session.GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementHandle element_wrapper;
			status_code = this->GetElement(session, element_id, &element_wrapper);
			if (status_code == SUCCESS)
			{
				ElementHandle other_element_wrapper;
				status_code = this->GetElement(session, other_element_id, &other_element_wrapper);
				if (status_code == SUCCESS) {
					response->SetResponse(SUCCESS, (element_wrapper->element() == other_element_wrapper->element()));
					return;
				} else {
					response->SetErrorResponse(status_code, "Element specified by 'other' is no longer valid");
					return;
				}
			} else {
				response->SetErrorResponse(status_code, "Element specified by 'id' is no longer valid");
				return;
			}
		}

	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENTEQUALSCOMMANDHANDLER_H_
