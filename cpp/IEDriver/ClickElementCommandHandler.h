#ifndef WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class ClickElementCommandHandler : public WebDriverCommandHandler {
public:
	ClickElementCommandHandler(void) {
	}

	virtual ~ClickElementCommandHandler(void) {
	}

protected:
	void ClickElementCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			int status_code = SUCCESS;
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			BrowserHandle browser_wrapper;
			status_code = session.GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementHandle element_wrapper;
			status_code = this->GetElement(session, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				status_code = element_wrapper->Click();
				browser_wrapper->set_wait_required(true);
				if (status_code != SUCCESS) {
					response->SetErrorResponse(status_code, "Cannot click on element");
					return;
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}

			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
