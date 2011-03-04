#ifndef WEBDRIVER_IE_ISELEMENTSELECTEDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_ISELEMENTSELECTEDCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class IsElementSelectedCommandHandler : public WebDriverCommandHandler {
public:
	IsElementSelectedCommandHandler(void) {
	}

	virtual ~IsElementSelectedCommandHandler(void) {
	}

protected:
	void IsElementSelectedCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));

			std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			// The atom is just the definition of an anonymous
			// function: "function() {...}"; Wrap it in another function so we can
			// invoke it with our arguments without polluting the current namespace.
			std::wstring script(L"(function() { return (");
			script += atoms::IS_SELECTED;
			script += L")})();";

			std::tr1::shared_ptr<ElementWrapper> element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
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
