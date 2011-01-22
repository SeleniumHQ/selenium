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
	void IsElementSelectedCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (locator_parameters.find("id") == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id(CA2W(locator_parameters["id"].c_str(), CP_UTF8));

			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			// The atom is just the definition of an anonymous
			// function: "function() {...}"; Wrap it in another function so we can
			// invoke it with our arguments without polluting the current namespace.
			std::wstring script(L"(function() { return (");

			// Read in all the scripts
			for (int j = 0; IS_SELECTED[j]; j++) {
				script += IS_SELECTED[j];
			}

			// Now for the magic and to close things
			script += L")})();";

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				ScriptWrapper *script_wrapper = new ScriptWrapper(script, 1);
				script_wrapper->AddArgument(element_wrapper);
				status_code = browser_wrapper->ExecuteScript(script_wrapper);

				Json::Value selected_value(false);
				if (status_code == SUCCESS) {
					if (script_wrapper->ResultIsBoolean()) {
						script_wrapper->ConvertResultToJsonValue(manager, &selected_value);
						response->SetResponse(SUCCESS, selected_value);
					} else {
						response->SetErrorResponse(EUNHANDLEDERROR, "Script determining if element is selected did not return boolean");
					}
				} else {
					response->SetErrorResponse(status_code, "Error determining if element is selected");
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

#endif // WEBDRIVER_IE_ISELEMENTSELECTEDCOMMANDHANDLER_H_
