#ifndef WEBDRIVER_IE_GETELEMENTSIZECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTSIZECOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetElementSizeCommandHandler : public WebDriverCommandHandler {
public:
	GetElementSizeCommandHandler(void) {
	}

	virtual ~GetElementSizeCommandHandler(void) {
	}

protected:
	void GetElementSizeCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
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
			//HWND hwnd = browser_wrapper->GetWindowHandle();

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				// The atom is just the definition of an anonymous
				// function: "function() {...}"; Wrap it in another function so we can
				// invoke it with our arguments without polluting the current namespace.
				std::wstring script(L"(function() { return (");

				// Read in all the scripts
				for (int j = 0; GET_SIZE[j]; j++) {
					script += GET_SIZE[j];
				}
				
				// Now for the magic and to close things
				script += L")})();";

				CComPtr<IHTMLDocument2> doc;
				browser_wrapper->GetDocument(&doc);
				ScriptWrapper *script_wrapper = new ScriptWrapper(doc, script, 1);
				script_wrapper->AddArgument(element_wrapper);
				int status_code = script_wrapper->Execute();

				// TODO (JimEvans): Find a way to collapse this and the atom
				// call into a single JS function.
				std::wstring size_script(L"(function() { return function(){ return [arguments[0].width, arguments[0].height];};})();");
				ScriptWrapper *size_script_wrapper = new ScriptWrapper(doc, size_script, 1);
				size_script_wrapper->AddArgument(script_wrapper->result());
				status_code = size_script_wrapper->Execute();

				Json::Value size_array;
				size_script_wrapper->ConvertResultToJsonValue(manager, &size_array);

				delete size_script_wrapper;
				delete script_wrapper;

				Json::UInt index = 0;
				Json::Value response_value;
				response_value["width"] = size_array[index];
				++index;
				response_value["height"] = size_array[index];
				response->SetResponse(SUCCESS, response_value);
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTSIZECOMMANDHANDLER_H_
