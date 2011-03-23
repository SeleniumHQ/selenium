#ifndef WEBDRIVER_IE_GETELEMENTTAGNAMECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTTAGNAMECOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GetElementTagNameCommandHandler : public WebDriverCommandHandler {
public:
	GetElementTagNameCommandHandler(void) {
	}

	virtual ~GetElementTagNameCommandHandler(void) {
	}

protected:
	void GetElementTagNameCommandHandler::ExecuteInternal(Session* session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));
			ElementHandle element_wrapper;
			int status_code = this->GetElement(session, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				CComBSTR temp;
				element_wrapper->element()->get_tagName(&temp);
				std::wstring tag_name((BSTR)temp);
				std::transform(tag_name.begin(), tag_name.end(), tag_name.begin(), tolower);
				std::string return_value(CW2A(tag_name.c_str(), CP_UTF8));
				response->SetResponse(SUCCESS, return_value);
				return;
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTTAGNAMECOMMANDHANDLER_H_
