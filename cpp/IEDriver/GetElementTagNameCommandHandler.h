#ifndef WEBDRIVER_IE_GETELEMENTTAGNAMECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTTAGNAMECOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetElementTagNameCommandHandler : public WebDriverCommandHandler {
public:
	GetElementTagNameCommandHandler(void) {
	}

	virtual ~GetElementTagNameCommandHandler(void) {
	}

protected:
	void GetElementTagNameCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));
			std::tr1::shared_ptr<ElementWrapper> element_wrapper;
			int status_code = this->GetElement(manager, element_id, &element_wrapper);
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
