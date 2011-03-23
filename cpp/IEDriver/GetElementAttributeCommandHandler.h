#ifndef WEBDRIVER_IE_GETELEMENTATTRIBUTECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTATTRIBUTECOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GetElementAttributeCommandHandler : public WebDriverCommandHandler {
public:
	GetElementAttributeCommandHandler(void) {
	}

	virtual ~GetElementAttributeCommandHandler(void) {
	}

protected:
	void GetElementAttributeCommandHandler::ExecuteInternal(Session* session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		LocatorMap::const_iterator name_parameter_iterator = locator_parameters.find("name");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (name_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: name");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));
			std::wstring name(CA2W(name_parameter_iterator->second.c_str(), CP_UTF8));

			BrowserHandle browser_wrapper;
			int status_code = session->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementHandle element_wrapper;
			status_code = this->GetElement(session, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				CComVariant value_variant;
				status_code = element_wrapper->GetAttributeValue(name, &value_variant);
				if (status_code != SUCCESS) {
					response->SetErrorResponse(status_code, "Unable to get attribute");
					return;
				} else {
					if (value_variant.vt != VT_EMPTY && value_variant.vt != VT_NULL) {
						std::wstring value(browser_wrapper->ConvertVariantToWString(&value_variant));
						std::string value_str(CW2A(value.c_str(), CP_UTF8));
						response->SetResponse(SUCCESS, value_str);
						return;
					} else {
						response->SetResponse(SUCCESS, Json::Value::null);
						return;
					}
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTATTRIBUTECOMMANDHANDLER_H_
