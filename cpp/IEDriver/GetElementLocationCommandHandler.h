#ifndef WEBDRIVER_IE_GETELEMENTLOCATIONCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTLOCATIONCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetElementLocationCommandHandler : public WebDriverCommandHandler {
public:
	GetElementLocationCommandHandler(void) {
	}

	virtual ~GetElementLocationCommandHandler(void) {
	}

protected:
	void GetElementLocationCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
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
			//HWND window_handle = browser_wrapper->GetWindowHandle();

			ElementWrapper *element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				// The atom is just the definition of an anonymous
				// function: "function() {...}"; Wrap it in another function so we can
				// invoke it with our arguments without polluting the current namespace.
				std::wstring script(L"(function() { return (");
				script += atoms::GET_LOCATION;
				script += L")})();";

				CComPtr<IHTMLDocument2> doc;
				browser_wrapper->GetDocument(&doc);

				Json::Value location_array;
				ScriptWrapper script_wrapper(doc, script, 1);
				script_wrapper.AddArgument(element_wrapper);
				status_code = script_wrapper.Execute();

				// TODO (JimEvans): Find a way to collapse this and the atom
				// call into a single JS function.
				std::wstring location_script(L"(function() { return function(){ return [arguments[0].x, arguments[0].y];};})();");
				ScriptWrapper location_script_wrapper(doc, location_script, 1);
				location_script_wrapper.AddArgument(script_wrapper.result());
				status_code = location_script_wrapper.Execute();

				location_script_wrapper.ConvertResultToJsonValue(manager, &location_array);

				Json::UInt index = 0;
				Json::Value response_value;
				response_value["x"] = location_array[index];
				++index;
				response_value["y"] = location_array[index];
				response->SetResponse(SUCCESS, response_value);
				return;
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTLOCATIONCOMMANDHANDLER_H_
