#ifndef WEBDRIVER_IE_CLEARELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_CLEARELEMENTCOMMANDHANDLER_H_

#include "atoms.h"
#include "BrowserManager.h"

namespace webdriver {

class ClearElementCommandHandler : public WebDriverCommandHandler {
public:
	ClearElementCommandHandler(void) {
	}

	virtual ~ClearElementCommandHandler(void) {
	}

protected:
	void ClearElementCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (locator_parameters.find("id") == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring text(L"");
			int status_code = SUCCESS;
			std::wstring element_id(CA2W(locator_parameters["id"].c_str(), CP_UTF8));

			BrowserWrapper *browser_wrapper;
			status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}
			HWND window_handle = browser_wrapper->GetWindowHandle();

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS)
			{
				// The atom is just the definition of an anonymous
				// function: "function() {...}"; Wrap it in another function so we can
				// invoke it with our arguments without polluting the current namespace.
				std::wstring script(L"(function() { return (");
				script += atoms::CLEAR;
				script += L")})();";

				CComPtr<IHTMLDocument2> doc;
				browser_wrapper->GetDocument(&doc);
				ScriptWrapper *script_wrapper = new ScriptWrapper(doc, script, 1);
				script_wrapper->AddArgument(element_wrapper);
				status_code = script_wrapper->Execute();
				delete script_wrapper;
				if (status_code != SUCCESS) {
					response->SetErrorResponse(EUNHANDLEDERROR, "Element is no longer valid");
					return;
				}

				response->SetResponse(SUCCESS, Json::Value::null);
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}

			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLEARELEMENTCOMMANDHANDLER_H_
