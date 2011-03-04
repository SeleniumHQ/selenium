#ifndef WEBDRIVER_IE_GETELEMENTATTRIBUTECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTATTRIBUTECOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetElementAttributeCommandHandler : public WebDriverCommandHandler {
public:
	GetElementAttributeCommandHandler(void) {
	}

	virtual ~GetElementAttributeCommandHandler(void) {
	}

protected:
	void GetElementAttributeCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		std::map<std::string, std::string>::const_iterator name_parameter_iterator = locator_parameters.find("name");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (name_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: name");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));
			std::wstring name(CA2W(name_parameter_iterator->second.c_str(), CP_UTF8));

			std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			std::tr1::shared_ptr<ElementWrapper> element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
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
