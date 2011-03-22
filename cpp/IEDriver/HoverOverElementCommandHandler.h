#ifndef WEBDRIVER_IE_HOVEROVERELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_HOVEROVERELEMENTCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class HoverOverElementCommandHandler : public WebDriverCommandHandler {
public:
	HoverOverElementCommandHandler(void) {
	}

	virtual ~HoverOverElementCommandHandler(void) {
	}

protected:
	void HoverOverElementCommandHandler::ExecuteInternal(Session* session, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
			int status_code = session->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			std::tr1::shared_ptr<ElementWrapper> element_wrapper;
			status_code = this->GetElement(session, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				status_code = element_wrapper->Hover();
				if (status_code != SUCCESS) {
					response->SetErrorResponse(status_code, "Unable to hover over element");
					return;
				} else {
					response->SetResponse(SUCCESS, Json::Value::null);
					return;
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_HOVEROVERELEMENTCOMMANDHANDLER_H_
