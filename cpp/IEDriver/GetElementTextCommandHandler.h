#ifndef WEBDRIVER_IE_GETELEMENTTEXTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTTEXTCOMMANDHANDLER_H_

#include "atoms.h"
#include "BrowserManager.h"

namespace webdriver {

class GetElementTextCommandHandler : public WebDriverCommandHandler {
public:
	GetElementTextCommandHandler(void) {
	}

	~GetElementTextCommandHandler(void) {
	}

protected:
	void GetElementTextCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
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

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				// The atom is just the definition of an anonymous
				// function: "function() {...}"; Wrap it in another function so we can
				// invoke it with our arguments without polluting the current namespace.
				std::wstring script(L"(function() { return (");

				// Read in all the scripts
				for (int j = 0; GET_TEXT[j]; j++) {
					script += GET_TEXT[j];
				}

				// Now for the magic and to close things
				script += L")})();";

				CComPtr<IHTMLDocument2> doc;
				browser_wrapper->GetDocument(&doc);
				ScriptWrapper *script_wrapper = new ScriptWrapper(doc, script, 1);
				script_wrapper->AddArgument(element_wrapper->element());
				status_code = script_wrapper->Execute();

				CComVariant text_variant;
				if (status_code == SUCCESS) {
					::VariantCopy(&text_variant, &script_wrapper->result());
				}

				delete script_wrapper;

				if (status_code == SUCCESS) {
					std::wstring text(browser_wrapper->ConvertVariantToWString(&text_variant));
					std::string text_str(CW2A(text.c_str(), CP_UTF8));
					response->SetResponse(SUCCESS, text_str);
					return;
				} else {
					response->SetErrorResponse(status_code, "Unable to get element text");
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

#endif // WEBDRIVER_IE_GETELEMENTTEXTCOMMANDHANDLER_H_
